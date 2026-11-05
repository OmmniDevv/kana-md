import { useMultiFileAuthState, usePostgresAuthState } from '@rexxhayanasi/elaina-baileys'
import { mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { createLocalStorage } from './local.js'
import { createSupabaseStorage } from './supabase.js'

// Driver switch lewat env STORAGE_DRIVER: local (dev) atau supabase (production).
export function createStorage(env = process.env) {
  const driver = (env.STORAGE_DRIVER || 'local').toLowerCase()
  if (driver === 'supabase') return createSupabaseStorage(env.DATABASE_URL)
  return createLocalStorage(env.LOCAL_DATA_DIR || '.dev-data')
}

// Hapus SEMUA berkas auth state di folder sesi lokal (creds.json, pre-key,
// app-state-sync-key, session key, dll). Foldernya sendiri dipertahankan
// dalam keadaan kosong supaya proses berikutnya mulai dari sesi bersih.
export async function clearSessionFolder(folder) {
  await mkdir(folder, { recursive: true })
  const entries = await readdir(folder)
  await Promise.all(entries.map((entry) => rm(join(folder, entry), { recursive: true, force: true })))
}

// Bungkus auth state library dengan clearAuth yang beneran bekerja plus
// penjaga penulisan terlambat.
//
// Fakta library v1.4.7: useMultiFileAuthState HANYA mengembalikan
// { state, saveCreds }, tidak ada clearAuth. Kode lama memanggil
// `if (clearAuth) await clearAuth()` di jalur loggedOut, jadi untuk driver
// lokal tidak ada apa pun yang terhapus walau log mengklaim sesi
// dibersihkan; systemd lalu menyalakan ulang bot dengan creds mati yang
// sama (insiden 2026-11-06: 11x restart loggedOut beruntun).
// usePostgresAuthState memang punya clearAuth (menghapus baris sesi), tapi
// saveCreds/keys.set yang terlambat tetap bisa menulis ulang baris itu.
//
// Penjaga ini: begitu clearAuth() dipanggil, flag cleared menyala dan
// semua saveCreds/keys.set sesudahnya dari proses yang sama menjadi no-op.
// Semua operasi diserialkan lewat satu rantai promise supaya penulisan
// yang sedang berjalan selesai dulu sebelum penghapusan, dan tidak ada
// penulisan yang menyusul sesudah penghapusan.
export function guardAuthState(auth, clearImpl = null) {
  const libClear = typeof auth.clearAuth === 'function' ? auth.clearAuth.bind(auth) : null
  const rawSaveCreds = auth.saveCreds.bind(auth)
  const rawKeysSet = auth.state.keys.set.bind(auth.state.keys)
  let cleared = false
  let chain = Promise.resolve()
  const enqueue = (fn) => {
    const run = chain.then(fn)
    chain = run.catch(() => {})
    return run
  }
  auth.saveCreds = (...args) =>
    enqueue(async () => {
      if (!cleared) await rawSaveCreds(...args)
    })
  auth.state.keys.set = (...args) =>
    enqueue(async () => {
      if (!cleared) await rawKeysSet(...args)
    })
  auth.clearAuth = () =>
    enqueue(async () => {
      if (cleared) return
      cleared = true
      if (clearImpl) await clearImpl()
      else if (libClear) await libClear()
    })
  return auth
}

// Auth state lokal (multi-file) lewat satu pintu: auth state library
// dibungkus guardAuthState dengan clearImpl penghapus folder sesi.
export async function createLocalAuthState(folder) {
  const auth = await useMultiFileAuthState(folder)
  return guardAuthState(auth, () => clearSessionFolder(folder))
}

// Sesi WhatsApp mengikuti driver yang sama:
// - supabase: usePostgresAuthState dari library (terkonfirmasi di README
//   v1.4.7, mengembalikan { state, saveCreds, clearAuth, close }), session
//   bernama "kana". clearAuth bawaannya sudah benar, tetap dibungkus
//   guardAuthState supaya penulisan terlambat tidak menghidupkan lagi
//   baris sesi yang baru dihapus.
// - local: useMultiFileAuthState di <LOCAL_DATA_DIR>/session lewat
//   createLocalAuthState (clearAuth dari guardAuthState, karena bawaan
//   library tidak menyediakannya).
export async function createAuthState(storage, env = process.env) {
  if (storage.driver === 'supabase') {
    const auth = await usePostgresAuthState({ pool: storage.pool, session: env.BOT_SESSION || 'kana' })
    return guardAuthState(auth)
  }
  return createLocalAuthState(`${env.LOCAL_DATA_DIR || '.dev-data'}/session`)
}
