import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createAuthState, guardAuthState } from '../src/storage/index.js'

// Regresi insiden 2026-11-06: log mengklaim "Sesi dibersihkan" tapi
// creds.json driver lokal tidak pernah terhapus (useMultiFileAuthState
// library v1.4.7 tidak menyediakan clearAuth), jadi systemd menyalakan
// ulang bot 11x dengan creds mati yang sama.

test('clearAuth driver lokal: folder sesi kosong total dan penulisan terlambat tertahan', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kana-auth-'))
  const env = { LOCAL_DATA_DIR: dir }
  const sessionDir = join(dir, 'session')
  const auth = await createAuthState({ driver: 'local' }, env)

  // Tirukan sesi yang sudah pairing lalu mati di server.
  auth.state.creds.registered = true
  await auth.saveCreds()
  await auth.state.keys.set({
    'pre-key': { 42: { x: 1 } },
    'app-state-sync-key': { KEYID: { keyData: 'abc' } },
    session: { 62812: { y: 2 } },
  })
  const before = await readdir(sessionDir)
  assert.ok(before.includes('creds.json'), 'creds.json harus ada sebelum clear')
  assert.ok(before.includes('pre-key-42.json'), 'file pre-key harus ada sebelum clear')
  assert.ok(before.length >= 4, 'semua berkas auth state harus ada sebelum clear')
  const credsRaw = JSON.parse(await readFile(join(sessionDir, 'creds.json'), 'utf8'))
  assert.equal(credsRaw.registered, true)

  await auth.clearAuth()
  assert.deepEqual(await readdir(sessionDir), [], 'folder sesi harus kosong sesudah clearAuth')

  // Penulisan terlambat dari proses yang sama (creds.update yang menyusul
  // sesudah loggedOut) tidak boleh menghidupkan lagi berkas sesi.
  await auth.saveCreds()
  await auth.state.keys.set({ 'pre-key': { 43: { x: 2 } } })
  assert.deepEqual(await readdir(sessionDir), [], 'folder sesi harus tetap kosong')

  // Proses baru (sesudah restart systemd) harus bisa pairing dari bersih:
  // jalur normal simpan creds tidak rusak oleh guard proses sebelumnya.
  const auth2 = await createAuthState({ driver: 'local' }, env)
  auth2.state.creds.registered = true
  await auth2.saveCreds()
  assert.ok((await readdir(sessionDir)).includes('creds.json'))
})

test('guardAuthState: clearAuth bawaan dipanggil sekali, penulisan terlambat tertahan', async () => {
  let writes = 0
  let clears = 0
  const fake = {
    state: {
      creds: {},
      keys: {
        get: async () => ({}),
        set: async () => {
          writes += 1
        },
      },
    },
    saveCreds: async () => {
      writes += 1
    },
    clearAuth: async () => {
      clears += 1
    },
  }
  const auth = guardAuthState(fake)
  await auth.saveCreds()
  await auth.state.keys.set({ session: { a: {} } })
  assert.equal(writes, 2, 'jalur normal sebelum clear harus tetap menulis')

  await auth.clearAuth()
  await auth.clearAuth()
  assert.equal(clears, 1, 'clearAuth bawaan hanya dipanggil sekali')

  await auth.saveCreds()
  await auth.state.keys.set({ session: { b: {} } })
  assert.equal(writes, 2, 'penulisan sesudah clear harus tertahan')
})
