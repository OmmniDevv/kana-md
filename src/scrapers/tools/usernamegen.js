// Generator username dari API Nexray (endpoint /tools/usernamegen,
// tanpa kunci, terverifikasi hidup dari VM ini: balas
// {status:true, result:{result:[...daftar username...]}}).
// Argumen mengikuti pola Elaina: nama | tema | mode.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const USERNAMEGEN_URL = 'https://api.nexray.eu.cc/tools/usernamegen'

export const USERNAME_THEMES = [
  'action',
  'adventure',
  'fantasy',
  'historical',
  'horror',
  'mythology',
  'nature',
  'sci-fi',
  'strategy',
]

export const USERNAME_MODES = ['instans', 'ai']

// Urai jawaban Nexray menjadi daftar username bersih (string non
// kosong, tanpa duplikat).
export function parseUsernames(json) {
  if (!json || typeof json !== 'object') return []
  let list = []
  if (Array.isArray(json?.result?.result)) list = json.result.result
  else if (Array.isArray(json?.result)) list = json.result
  else if (Array.isArray(json?.usernames)) list = json.usernames
  const out = []
  const seen = new Set()
  for (const item of list) {
    const name = String(item ?? '').trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

// Normalisasi tema dan mode: nilai di luar daftar resmi jatuh ke
// bawaan Elaina (tema action, mode instans).
export function normalizeTheme(theme) {
  const t = String(theme || '').trim().toLowerCase()
  return USERNAME_THEMES.includes(t) ? t : 'action'
}

export function normalizeMode(mode) {
  const m = String(mode || '').trim().toLowerCase()
  return USERNAME_MODES.includes(m) ? m : 'instans'
}

export async function getUsernames(name, { theme = 'action', mode = 'instans', fetchImpl = fetch } = {}) {
  const cleanName = String(name || '').trim()
  if (!cleanName) throw new Error('Nama untuk usernamegen kosong')
  const params = new URLSearchParams({
    name: cleanName,
    mode: normalizeMode(mode),
    theme: normalizeTheme(theme),
  })
  return withBreaker('nexray-usernamegen', () =>
    retry(async () => {
      const res = await fetchImpl(`${USERNAMEGEN_URL}?${params}`, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Nexray balas HTTP ${res.status}`)
      const usernames = parseUsernames(await res.json())
      if (!usernames.length) throw new Error('Nexray tidak mengembalikan daftar username')
      return usernames
    })
  )
}
