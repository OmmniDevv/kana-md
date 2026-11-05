// Kurs mata uang IDR dari API publik gratis (tanpa kunci), diverifikasi
// bisa dijangkau dari VM: open.er-api.com (utama) dan
// api.exchangerate-api.com v4 (cadangan). Hasil di-cache 1 jam di memori.
// Mengembalikan kurs per 1 unit mata asing dalam IDR + tanggal kurs dari
// sumbernya. Bila kedua sumber mati, mengembalikan null supaya pemanggil
// membalas jujur tanpa mengarang angka.
const CACHE_MS = 3600_000
let cache = null

export function parseRates(json) {
  const rates = json?.rates
  if (!rates || !rates.SAR || !rates.JPY) return null
  const date = json.time_last_update_utc
    ? String(json.time_last_update_utc).slice(0, 16)
    : (json.date ?? '')
  return {
    SAR: 1 / Number(rates.SAR),
    JPY: 1 / Number(rates.JPY),
    date,
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

export async function getIdrRates(fetcher = fetchJson) {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value
  const sources = [
    'https://open.er-api.com/v6/latest/IDR',
    'https://api.exchangerate-api.com/v4/latest/IDR',
  ]
  for (const url of sources) {
    try {
      const parsed = parseRates(await fetcher(url))
      if (parsed) {
        cache = { at: Date.now(), value: parsed }
        return parsed
      }
    } catch {
      // coba sumber berikutnya
    }
  }
  return null
}

export function convertIdr(amountIdr, idrPerUnit) {
  return amountIdr / idrPerUnit
}

export function convertToIdr(amountForeign, idrPerUnit) {
  return amountForeign * idrPerUnit
}
