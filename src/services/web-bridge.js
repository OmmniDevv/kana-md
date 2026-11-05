// Jembatan HTTPS data web: adapter storage yang membungkus storage utama
// bot supaya namespace kontrak web (docs/WEB.md) dibaca dan ditulis lewat
// PostgREST Supabase (src/services/supabase-rest.js), bukan lewat driver
// storage utama. Alasannya: di production bot jalan dengan driver lokal
// dan koneksi pg dari VM ke Supabase timeout, jadi record yang ditulis
// web ke Supabase tidak pernah terlihat watcher bila memakai storage
// utama. Namespace lain tetap lewat storage utama apa adanya.
//
// Routing:
// - ns 'web_login_requests' dan 'web_login_limits': selalu REST.
// - ns 'premium', 'sewa_bot', dan 'usage_limits': selalu REST (panel
//   premium web dan bot berbagi data yang sama, keputusan 2026-11-05).
// - ns 'kv' dengan key 'bot_stats' dan 'top_users': REST (statistik
//   dashboard dan snapshot leaderboard publik tanpa nomor HP).
// - Semua pasangan ns dan key lain: storage utama, termasuk TTL apa adanya.
//   Method keys(ns) hanya tahu namespace, jadi 'kv' untuk keys diteruskan
//   ke storage utama; tidak ada pemanggil yang melisting 'kv' untuk web.
//
// Penanda kesehatan untuk watchdog: setiap operasi REST pada ns
// 'web_login_requests' memperbarui berkas healthFile secara atomik (tulis
// berkas tmp di direktori yang sama lalu rename) berisi JSON
// { lastPollOkAt, lastCodeSentAt, lastError }. Sukses mengisi
// lastPollOkAt dan mengosongkan lastError; kvSet dengan value.status
// 'sent' juga mengisi lastCodeSentAt. Gagal hanya mengisi lastError.
// Penulisan penanda TIDAK PERNAH melempar error ke pemanggil.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { REQUESTS_NS, LIMITS_NS } from './web-login-watcher.js'

export const BRIDGE_REQUESTS_NS = REQUESTS_NS
export const BRIDGE_LIMITS_NS = LIMITS_NS
export const STATS_NS = 'kv'
export const STATS_KEY = 'bot_stats'
export const TOP_USERS_KEY = 'top_users'

export function isBridgeEnabled(env = process.env) {
  return Boolean(String(env?.SUPABASE_REST_URL ?? '').trim()) &&
    Boolean(String(env?.SUPABASE_SERVICE_ROLE_KEY ?? '').trim())
}

function resolveNowMs(now) {
  const value = typeof now === 'function' ? now() : now
  if (value instanceof Date) return value.getTime()
  const n = Number(value)
  return value !== undefined && value !== null && Number.isFinite(n) ? n : Date.now()
}

// Namespace premium dan limit ikut REST (keputusan owner 2026-11-05):
// panel owner di web menulis namespace yang sama ('premium', 'sewa_bot')
// dan dashboard member membaca sisa limit ('usage_limits'), jadi bot dan
// web wajib berbagi satu data lewat Supabase, bukan storage lokal bot.
export const PREMIUM_NS_SET = new Set(['premium', 'sewa_bot', 'usage_limits'])

function isRestRouted(ns, key) {
  if (ns === REQUESTS_NS || ns === LIMITS_NS) return true
  if (PREMIUM_NS_SET.has(ns)) return true
  if (ns === STATS_NS && (key === STATS_KEY || key === TOP_USERS_KEY)) return true
  return false
}

export function createBridgeStorage(baseStorage, rest, { healthFile, now } = {}) {
  if (!baseStorage) throw new Error('createBridgeStorage butuh baseStorage')
  if (!rest) throw new Error('createBridgeStorage butuh klien REST')

  // Keadaan penanda kesehatan: dimuat malas dari berkas lama pada update
  // pertama supaya lastCodeSentAt lama tidak tertimpa null saat restart.
  let healthState = null
  let healthChain = Promise.resolve()
  let tmpCounter = 0

  async function loadHealthState() {
    if (healthState) return healthState
    healthState = { lastPollOkAt: null, lastCodeSentAt: null, lastError: null }
    if (!healthFile) return healthState
    try {
      const parsed = JSON.parse(await readFile(healthFile, 'utf8'))
      healthState = {
        lastPollOkAt: parsed?.lastPollOkAt ?? null,
        lastCodeSentAt: parsed?.lastCodeSentAt ?? null,
        lastError: parsed?.lastError ?? null,
      }
    } catch {}
    return healthState
  }

  async function writeHealthState(state) {
    const dir = dirname(healthFile)
    await mkdir(dir, { recursive: true })
    tmpCounter += 1
    const tmp = join(dir, `.bridge-health.${process.pid}.${tmpCounter}.tmp`)
    await writeFile(tmp, JSON.stringify(state, null, 2))
    await rename(tmp, healthFile)
  }

  // Antrikan update penanda supaya operasi bersamaan tidak saling timpa.
  // Semua error ditelan: penanda tidak boleh menjatuhkan alur pemanggil.
  function updateHealth(mutator) {
    if (!healthFile) return Promise.resolve()
    const task = healthChain.then(async () => {
      try {
        const state = { ...(await loadHealthState()) }
        mutator(state)
        await writeHealthState(state)
        healthState = state
      } catch {}
    })
    healthChain = task.catch(() => {})
    return healthChain
  }

  function noteRestSuccess({ sent = false } = {}) {
    const iso = new Date(resolveNowMs(now)).toISOString()
    return updateHealth((state) => {
      state.lastPollOkAt = iso
      state.lastError = null
      if (sent) state.lastCodeSentAt = iso
    })
  }

  function noteRestFailure(err) {
    const message = String(err?.message ?? err ?? 'unknown error').slice(0, 200)
    return updateHealth((state) => {
      state.lastError = message
    })
  }

  // Bungkus satu operasi REST pada ns web_login_requests dengan pencatatan
  // kesehatan. Namespace REST lain tidak menyentuh penanda.
  async function tracked(ns, operation, { sent = false } = {}) {
    if (ns !== REQUESTS_NS) return operation()
    try {
      const result = await operation()
      await noteRestSuccess({ sent })
      return result
    } catch (err) {
      await noteRestFailure(err)
      throw err
    }
  }

  const bridge = {
    driver: baseStorage.driver,
    async get(ns, key) {
      if (!isRestRouted(ns, key)) return baseStorage.get(ns, key)
      const value = await tracked(ns, () => rest.kvGet(ns, key))
      // Samakan kontrak storage utama: tidak ada record berarti undefined.
      return value === null ? undefined : value
    },
    async set(ns, key, value, ttlSeconds) {
      if (!isRestRouted(ns, key)) return baseStorage.set(ns, key, value, ttlSeconds)
      const expiresAt = ttlSeconds
        ? new Date(resolveNowMs(now) + Number(ttlSeconds) * 1000).toISOString()
        : null
      return tracked(ns, () => rest.kvSet(ns, key, value, expiresAt), {
        sent: value?.status === 'sent',
      })
    },
    async delete(ns, key) {
      if (!isRestRouted(ns, key)) return baseStorage.delete(ns, key)
      return tracked(ns, () => rest.kvDelete(ns, key))
    },
    async keys(ns) {
      // keys hanya membawa namespace: ns login, premium, sewa, dan limit
      // selalu REST, sisanya (termasuk 'kv') ke storage utama.
      if (ns !== REQUESTS_NS && ns !== LIMITS_NS && !PREMIUM_NS_SET.has(ns)) return baseStorage.keys(ns)
      const rows = await tracked(ns, () => rest.kvList(ns))
      const nowMs = resolveNowMs(now)
      return rows
        .filter((row) => !row?.expires_at || Date.parse(row.expires_at) > nowMs)
        .map((row) => row.key)
    },
    async close() {
      if (typeof baseStorage.close === 'function') return baseStorage.close()
      return undefined
    },
  }
  if (typeof baseStorage.init === 'function') {
    bridge.init = (...args) => baseStorage.init(...args)
  }
  return bridge
}
