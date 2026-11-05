// Data superhero dari dataset akabab superhero-api (all.json,
// terverifikasi hidup dari VM ini: array sekitar 730 hero dengan
// powerstats, appearance, biography, work, connections, images).
// Pengganti API lolhuman Elaina yang butuh API key berbayar. Dataset
// diunduh sekali lalu disimpan di cache memori modul.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const SUPERHERO_API_URL = 'https://akabab.github.io/superhero-api/api/all.json'

let cachedHeroes = null

export function clearSuperheroCache() {
  cachedHeroes = null
}

// Cari hero dari daftar: exact match dulu (case-insensitive), lalu
// substring. Mengembalikan hero atau null.
export function findHeroInList(heroes, query) {
  if (!Array.isArray(heroes) || !query) return null
  const q = String(query).trim().toLowerCase()
  if (!q) return null
  const exact = heroes.find((h) => String(h?.name || '').trim().toLowerCase() === q)
  if (exact) return exact
  return heroes.find((h) => String(h?.name || '').toLowerCase().includes(q)) || null
}

export async function fetchAllHeroes({ fetchImpl = fetch } = {}) {
  if (cachedHeroes) return cachedHeroes
  const heroes = await withBreaker('akabab-superhero', () =>
    retry(async () => {
      const res = await fetchImpl(SUPERHERO_API_URL, {
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Dataset superhero balas HTTP ${res.status}`)
      const json = await res.json()
      if (!Array.isArray(json) || !json.length) throw new Error('Dataset superhero kosong')
      return json
    })
  )
  cachedHeroes = heroes
  return heroes
}

export async function findHero(query, { fetchImpl = fetch } = {}) {
  const heroes = await fetchAllHeroes({ fetchImpl })
  return findHeroInList(heroes, query)
}
