// Scraper gempa BMKG: data terbuka TEWS (autogempa.json dan
// gempaterkini.json), tanpa API key.
import { retry, withBreaker } from '../runner.js'

const BASE = 'https://data.bmkg.go.id/DataMKG/TEWS'

export function normalizeGempa(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    date: raw.Tanggal || '',
    time: raw.Jam || '',
    datetime: raw.DateTime || '',
    magnitude: raw.Magnitude || '',
    depth: raw.Kedalaman || '',
    region: raw.Wilayah || '',
    potential: raw.Potensi || '',
    felt: raw.Dirasakan || '',
    coordinates: raw.Coordinates || '',
    shakemapUrl: raw.Shakemap ? `${BASE}/${raw.Shakemap}` : null,
  }
}

export function parseLatestGempa(json) {
  return normalizeGempa(json?.Infogempa?.gempa)
}

export function parseGempaList(json, limit = 5) {
  const list = json?.Infogempa?.gempa
  if (!Array.isArray(list)) return []
  return list.map(normalizeGempa).filter(Boolean).slice(0, limit)
}

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`, {
    signal: AbortSignal.timeout(20000),
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`BMKG balas HTTP ${res.status}`)
  return res.json()
}

export async function getLatestGempa() {
  return withBreaker('bmkg', () => retry(async () => parseLatestGempa(await fetchJson('autogempa.json'))))
}

export async function getGempaList(limit = 5) {
  return withBreaker('bmkg', () => retry(async () => parseGempaList(await fetchJson('gempaterkini.json'), limit)))
}
