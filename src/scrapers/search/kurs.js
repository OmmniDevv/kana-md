// Scraper kurs mata uang lewat open.er-api.com (gratis tanpa key).
// Hasil di-cache di memori selama 1 jam per mata uang dasar.
import { withBreaker } from '../runner.js'

const BASE = 'https://open.er-api.com/v6/latest'
const CACHE_TTL_MS = 60 * 60 * 1000
const cache = new Map()

export function parseRatesResponse(json) {
  if (!json || json.result !== 'success' || !json.rates) return null
  return {
    base: json.base_code,
    rates: json.rates,
    updated: json.time_last_update_utc || '',
  }
}

export function convertAmount(ratesData, amount, to) {
  if (!ratesData?.rates) return null
  const target = String(to || '').toUpperCase()
  const rate = ratesData.rates[target]
  if (typeof rate !== 'number') return null
  const value = Number(amount)
  if (!Number.isFinite(value)) return null
  return { rate, result: value * rate, from: ratesData.base, to: target, amount: value }
}

export async function getRates(base = 'USD') {
  const code = String(base || 'USD').toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) throw new Error('Kode mata uang tidak valid')
  const hit = cache.get(code)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data
  const data = await withBreaker('er-api', async () => {
    const res = await fetch(`${BASE}/${code}`, {
      signal: AbortSignal.timeout(20000),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`ER-API balas HTTP ${res.status}`)
    const parsed = parseRatesResponse(await res.json())
    if (!parsed) throw new Error('Respons kurs tidak dikenal')
    return parsed
  })
  cache.set(code, { at: Date.now(), data })
  return data
}
