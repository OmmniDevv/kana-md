import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { memoryStorage } from './user-service.test.js'
import { createBridgeStorage, isBridgeEnabled } from '../src/services/web-bridge.js'

const NOW = Date.parse('2026-11-04T05:00:00Z')
const NOW_ISO = new Date(NOW).toISOString()
const DIGITS = '6281234567890'

// Klien REST palsu: merekam panggilan dan menyimpan baris di Map.
function fakeRest({ failWith = null } = {}) {
  const store = new Map()
  const id = (ns, key) => `${ns} ${key}`
  const calls = []
  const guard = () => {
    if (failWith) throw failWith
  }
  return {
    calls,
    store,
    async kvList(ns) {
      calls.push(['kvList', ns])
      guard()
      return [...store.values()]
        .filter((row) => row.ns === ns)
        .map((row) => ({ ...row, expires_at: row.expires_at ?? null }))
    },
    async kvGet(ns, key) {
      calls.push(['kvGet', ns, key])
      guard()
      return store.get(id(ns, key))?.value ?? null
    },
    async kvSet(ns, key, value, expiresAt) {
      calls.push(['kvSet', ns, key, value, expiresAt])
      guard()
      store.set(id(ns, key), { ns, key, value, expires_at: expiresAt ?? null })
    },
    async kvDelete(ns, key) {
      calls.push(['kvDelete', ns, key])
      guard()
      store.delete(id(ns, key))
    },
  }
}

async function tempHealth() {
  const dir = await mkdtemp(join(tmpdir(), 'kana-bridge-'))
  return { dir, healthFile: join(dir, 'bridge-health.json') }
}

async function readHealth(healthFile) {
  return JSON.parse(await readFile(healthFile, 'utf8'))
}

test('isBridgeEnabled hanya true bila URL dan service role key terisi', () => {
  assert.equal(isBridgeEnabled({}), false)
  assert.equal(isBridgeEnabled({ SUPABASE_REST_URL: 'https://x.example' }), false)
  assert.equal(isBridgeEnabled({ SUPABASE_SERVICE_ROLE_KEY: 'kunci' }), false)
  assert.equal(isBridgeEnabled({ SUPABASE_REST_URL: '  ', SUPABASE_SERVICE_ROLE_KEY: 'kunci' }), false)
  assert.equal(
    isBridgeEnabled({ SUPABASE_REST_URL: 'https://x.example', SUPABASE_SERVICE_ROLE_KEY: 'kunci' }),
    true
  )
})

test('routing: ns login web dan kv bot_stats ke REST, semua lain ke storage utama', async () => {
  const { healthFile } = await tempHealth()
  const base = memoryStorage()
  const rest = fakeRest()
  const bridge = createBridgeStorage(base, rest, { healthFile, now: NOW })
  assert.equal(bridge.driver, 'memory')

  await bridge.set('web_login_requests', DIGITS, { status: 'pending' })
  await bridge.set('web_login_limits', DIGITS, { count: 1 })
  await bridge.set('kv', 'bot_stats', { totalCommands: 7 })
  assert.deepEqual(await bridge.get('web_login_requests', DIGITS), { status: 'pending' })
  assert.deepEqual(await bridge.get('kv', 'bot_stats'), { totalCommands: 7 })
  assert.deepEqual(await bridge.keys('web_login_requests'), [DIGITS])
  await bridge.delete('web_login_limits', DIGITS)
  assert.equal(await bridge.get('web_login_limits', DIGITS), undefined)
  assert.ok(rest.calls.length >= 6)
  // Tidak ada satu pun record web yang bocor ke storage utama.
  assert.equal(await base.get('web_login_requests', DIGITS), undefined)
  assert.equal(await base.get('kv', 'bot_stats'), undefined)

  // Namespace dan key lain tetap storage utama, termasuk TTL diteruskan.
  const setCalls = []
  const origSet = base.set.bind(base)
  base.set = async (...args) => {
    setCalls.push(args)
    return origSet(...args)
  }
  await bridge.set('users', DIGITS, { registered: true })
  await bridge.set('kv', 'sched:123@g.us:2026-11-04:religi', true, 172800)
  assert.deepEqual(await bridge.get('users', DIGITS), { registered: true })
  assert.deepEqual(await bridge.keys('users'), [DIGITS])
  await bridge.delete('users', DIGITS)
  assert.equal(await bridge.get('users', DIGITS), undefined)
  assert.deepEqual(setCalls[1], ['kv', 'sched:123@g.us:2026-11-04:religi', true, 172800])
  assert.equal(rest.calls.filter((c) => c[1] === 'users').length, 0)
})

test('routing: ns web_login (kode .webcode) selalu ke REST, tidak ke storage utama', async () => {
  const { healthFile } = await tempHealth()
  const base = memoryStorage()
  const rest = fakeRest()
  const bridge = createBridgeStorage(base, rest, { healthFile, now: NOW })

  await bridge.set('web_login', DIGITS, { codeHash: 'abc123', expiresAt: NOW + 600000 })
  assert.deepEqual(await bridge.get('web_login', DIGITS), { codeHash: 'abc123', expiresAt: NOW + 600000 })
  assert.deepEqual(await bridge.keys('web_login'), [DIGITS])
  // Record kode .webcode tidak boleh bocor ke storage utama: web hanya
  // bisa membacanya bila ia tinggal di Supabase lewat REST.
  assert.equal(await base.get('web_login', DIGITS), undefined)
  assert.ok(rest.calls.some((c) => c[0] === 'kvSet' && c[1] === 'web_login'))
  // Operasi ns web_login tidak menyentuh penanda kesehatan watcher.
  await bridge.delete('web_login', DIGITS)
  assert.equal(await bridge.get('web_login', DIGITS), undefined)
})

test('health: kvList sukses mengisi lastPollOkAt dan lastError null secara atomik', async () => {
  const { dir, healthFile } = await tempHealth()
  const bridge = createBridgeStorage(memoryStorage(), fakeRest(), { healthFile, now: NOW })
  await bridge.keys('web_login_requests')
  const health = await readHealth(healthFile)
  assert.equal(health.lastPollOkAt, NOW_ISO)
  assert.equal(health.lastError, null)
  assert.equal(health.lastCodeSentAt, null)
  // Penulisan atomik: tidak ada berkas tmp yang tertinggal.
  const files = await readdir(dir)
  assert.deepEqual(files, ['bridge-health.json'])
})

test('health: kvSet status sent mengisi lastCodeSentAt dan nilai lama tidak tertimpa null', async () => {
  const { healthFile } = await tempHealth()
  const oldSent = '2026-11-03T01:02:03.000Z'
  await writeFile(
    healthFile,
    JSON.stringify({ lastPollOkAt: null, lastCodeSentAt: oldSent, lastError: 'lama' })
  )
  const bridge = createBridgeStorage(memoryStorage(), fakeRest(), { healthFile, now: NOW })
  // Operasi sukses biasa mempertahankan lastCodeSentAt lama.
  await bridge.keys('web_login_requests')
  let health = await readHealth(healthFile)
  assert.equal(health.lastCodeSentAt, oldSent)
  assert.equal(health.lastPollOkAt, NOW_ISO)
  // Set dengan status sent memperbarui lastCodeSentAt.
  await bridge.set('web_login_requests', DIGITS, { status: 'sent', attempts: 1 })
  health = await readHealth(healthFile)
  assert.equal(health.lastCodeSentAt, NOW_ISO)
  assert.equal(health.lastError, null)
  // Set dengan status lain tidak menganggap kode terkirim.
  await bridge.set('web_login_requests', DIGITS, { status: 'pending', attempts: 2 })
  health = await readHealth(healthFile)
  assert.equal(health.lastCodeSentAt, NOW_ISO)
})

test('health: operasi REST gagal mengisi lastError tanpa mengubah lastPollOkAt', async () => {
  const { healthFile } = await tempHealth()
  const failing = fakeRest({ failWith: new Error('HTTP 503 melambat sekali') })
  const bridge = createBridgeStorage(memoryStorage(), failing, { healthFile, now: NOW })
  await assert.rejects(() => bridge.keys('web_login_requests'), /HTTP 503/)
  const health = await readHealth(healthFile)
  assert.match(health.lastError, /HTTP 503/)
  assert.equal(health.lastPollOkAt, null)
  assert.equal(health.lastCodeSentAt, null)
})

test('health: namespace REST lain tidak menyentuh penanda dan penulisan tidak melempar', async () => {
  const { dir, healthFile } = await tempHealth()
  const bridge = createBridgeStorage(memoryStorage(), fakeRest(), { healthFile, now: NOW })
  await bridge.set('kv', 'bot_stats', { totalCommands: 1 })
  await bridge.set('web_login_limits', DIGITS, { count: 1 })
  const files = await readdir(dir)
  assert.deepEqual(files, [])
  // healthFile di subdirektori yang belum ada tetap bisa ditulis (mkdir).
  const nested = join(dir, 'sub', 'bridge-health.json')
  const bridge2 = createBridgeStorage(memoryStorage(), fakeRest(), {
    healthFile: nested,
    now: NOW,
  })
  await bridge2.keys('web_login_requests')
  const health = await readHealth(nested)
  assert.equal(health.lastPollOkAt, NOW_ISO)
})

test('tanpa healthFile bridge tetap bekerja penuh lewat REST dan base', async () => {
  const rest = fakeRest()
  const bridge = createBridgeStorage(memoryStorage(), rest, { now: NOW })
  await bridge.set('web_login_requests', DIGITS, { status: 'pending' })
  assert.deepEqual(await bridge.get('web_login_requests', DIGITS), { status: 'pending' })
  assert.deepEqual(await bridge.keys('web_login_limits'), [])
})

test('routing: kv top_users ke REST untuk snapshot leaderboard web', async () => {
  const { healthFile } = await tempHealth()
  const base = memoryStorage()
  const rest = fakeRest()
  const bridge = createBridgeStorage(base, rest, { healthFile, now: NOW })
  const top = [{ name: 'Rani', xp: 500, level: 4 }]
  await bridge.set('kv', 'top_users', top)
  assert.deepEqual(await bridge.get('kv', 'top_users'), top)
  assert.equal(await base.get('kv', 'top_users'), undefined)
  // Key kv lain tetap storage utama.
  await bridge.set('kv', 'sched:lain', true)
  assert.equal(await base.get('kv', 'sched:lain'), true)
  await bridge.delete('kv', 'top_users')
  assert.equal(await bridge.get('kv', 'top_users'), undefined)
})
