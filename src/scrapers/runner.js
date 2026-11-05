// Kerangka scraper (spesifikasi 4.8): proteksi SSRF, retry dengan backoff,
// circuit breaker per sumber, unduh buffer berbatas ukuran, dan helper temp
// yang selalu membersihkan file. Sumber gratis akan rusak berkala; helper di
// sini membuat kegagalannya rapi (error jelas) dan perbaikannya murah.
import { lookup } from 'node:dns/promises'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
]

export function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function isPrivateIp(ip) {
  if (!ip) return true
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    return false
  }
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true
  if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice(7))
  return false
}

const IP_LIKE = /^[\d.]+$|^[0-9a-f:]+$/i

// Tolak skema non http(s), localhost, dan IP privat/link-local.
export function assertSafeUrl(rawUrl) {
  let url
  try {
    url = new URL(String(rawUrl).trim())
  } catch {
    throw new Error('URL tidak valid')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL harus memakai http atau https')
  }
  const host = url.hostname.toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Host URL tidak diizinkan')
  }
  if (IP_LIKE.test(host) && isPrivateIp(host)) {
    throw new Error('Host URL mengarah ke alamat privat')
  }
  return url
}

// Versi async: sekalian cek hasil DNS agar nama host yang menunjuk IP privat
// juga tertolak. Dipakai sebelum mengunduh media dari URL tak dikenal.
export async function assertSafeUrlResolved(rawUrl) {
  const url = assertSafeUrl(rawUrl)
  if (IP_LIKE.test(url.hostname)) return url
  try {
    const records = await lookup(url.hostname, { all: true })
    for (const rec of records) {
      if (isPrivateIp(rec.address)) throw new Error('Host URL mengarah ke alamat privat')
    }
  } catch (err) {
    if (/privat/.test(err.message)) throw err
    // DNS gagal: biarkan request aslinya yang melaporkan error jaringan.
  }
  return url
}

// Retry sederhana dengan backoff linear.
export async function retry(fn, { retries = 2, baseDelay = 800 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      lastError = err
      if (attempt < retries) await sleep(baseDelay * (attempt + 1))
    }
  }
  throw lastError
}

// Circuit breaker per sumber: buka setelah 3 gagal, coba lagi setelah 5 menit.
const breakers = new Map()
const BREAKER_THRESHOLD = 3
const BREAKER_COOLDOWN_MS = 5 * 60 * 1000

export function breakerState(key) {
  return breakers.get(key) ?? { failures: 0, openUntil: 0 }
}

export async function withBreaker(key, fn) {
  const state = breakerState(key)
  if (state.openUntil > Date.now()) {
    const err = new Error(`Sumber ${key} sedang tidak tersedia (circuit breaker terbuka)`)
    err.code = 'SOURCE_DOWN'
    throw err
  }
  try {
    const result = await fn()
    breakers.set(key, { failures: 0, openUntil: 0 })
    return result
  } catch (err) {
    const failures = state.failures + 1
    breakers.set(key, {
      failures,
      openUntil: failures >= BREAKER_THRESHOLD ? Date.now() + BREAKER_COOLDOWN_MS : 0,
    })
    throw err
  }
}

// Unduh URL jadi Buffer dengan batas ukuran dan validasi tiap lompatan redirect.
export async function downloadBuffer(rawUrl, { maxBytes = 16 * 1024 * 1024, timeout = 60000, headers = {} } = {}) {
  let current = (await assertSafeUrlResolved(rawUrl)).href
  for (let hop = 0; hop <= 5; hop++) {
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
      headers: { 'User-Agent': randomUserAgent(), ...headers },
    })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) throw new Error(`Redirect tanpa lokasi (HTTP ${res.status})`)
      current = (await assertSafeUrlResolved(new URL(location, current).href)).href
      continue
    }
    if (!res.ok) throw new Error(`Unduh gagal: HTTP ${res.status}`)
    const length = Number(res.headers.get('content-length') || 0)
    if (length && length > maxBytes) {
      const err = new Error(`File terlalu besar (${(length / 1048576).toFixed(1)} MB)`)
      err.code = 'TOO_BIG'
      throw err
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length > maxBytes) {
      const err = new Error(`File terlalu besar (${(buffer.length / 1048576).toFixed(1)} MB)`)
      err.code = 'TOO_BIG'
      throw err
    }
    return { buffer, contentType: res.headers.get('content-type') || '', size: buffer.length, url: current }
  }
  throw new Error('Terlalu banyak redirect')
}

// Jalankan fn di folder temp acak; folder selalu dihapus di akhir.
// Dua bentuk panggilan sah: withTempDir(fn) dan withTempDir('prefix-', fn).
// Bentuk kedua dipakai beberapa plugin (playcall, hdvid, imgtools,
// resizevideo); dulu string prefix dianggap sebagai fn dan melempar
// "fn is not a function" saat dipanggil.
export async function withTempDir(prefixOrFn, maybeFn) {
  const fn = typeof prefixOrFn === 'function' ? prefixOrFn : maybeFn
  const prefix = typeof prefixOrFn === 'string' ? prefixOrFn : 'kana-'
  if (typeof fn !== 'function') throw new TypeError('withTempDir butuh fungsi callback')
  const dir = await mkdtemp(join(tmpdir(), prefix))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
