// Scraper jadwal sholat myQuran (API publik tanpa key).
// KONTRAK INTI: scheduler mengimpor getPrayerSchedule(cityQuery, dateStr)
// dengan dateStr 'YYYY-MM-DD' dan mengharapkan objek
// { imsak, subuh, dzuhur, ashar, maghrib, isya } berisi string 'HH:mm'
// atau null bila gagal. Jangan ubah tanda tangan ini.
import { retry, withBreaker } from '../runner.js'

const BASE = 'https://api.myquran.com/v2/sholat'

export function parseScheduleResponse(json) {
  const jadwal = json?.data?.jadwal
  if (!jadwal || typeof jadwal !== 'object') return null
  const pick = (key) => (typeof jadwal[key] === 'string' && /^\d{2}:\d{2}/.test(jadwal[key]) ? jadwal[key].slice(0, 5) : null)
  const times = {
    imsak: pick('imsak'),
    subuh: pick('subuh'),
    dzuhur: pick('dzuhur'),
    ashar: pick('ashar'),
    maghrib: pick('maghrib'),
    isya: pick('isya'),
  }
  if (Object.values(times).some((v) => v === null)) return null
  return times
}

export function parseCitySearch(json) {
  const first = json?.data?.[0]
  if (!first?.id) return null
  return { id: String(first.id), name: first.lokasi || '' }
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`myQuran balas HTTP ${res.status}`)
  return res.json()
}

async function fetchScheduleRaw(cityQuery, dateStr) {
  const city = parseCitySearch(await fetchJson(`${BASE}/kota/cari/${encodeURIComponent(cityQuery)}`))
  if (!city) return null
  const [yyyy, mm, dd] = String(dateStr).split('-')
  if (!yyyy || !mm || !dd) return null
  const json = await fetchJson(`${BASE}/jadwal/${city.id}/${yyyy}/${mm}/${dd}`)
  const times = parseScheduleResponse(json)
  if (!times) return null
  const jadwal = json.data.jadwal
  return {
    city,
    times,
    extra: {
      terbit: jadwal.terbit || '',
      dhuha: jadwal.dhuha || '',
      dateLabel: jadwal.tanggal || '',
    },
  }
}

export async function getPrayerSchedule(cityQuery, dateStr) {
  const city = String(cityQuery || '').trim()
  if (!city || !dateStr) return null
  try {
    const raw = await withBreaker('myquran', () => retry(() => fetchScheduleRaw(city, dateStr), { retries: 1 }))
    return raw?.times ?? null
  } catch {
    return null
  }
}

// Info lengkap untuk plugin .sholat (nama kota resmi + label tanggal).
export async function getPrayerInfo(cityQuery, dateStr) {
  const city = String(cityQuery || '').trim()
  if (!city || !dateStr) return null
  const raw = await withBreaker('myquran', () => retry(() => fetchScheduleRaw(city, dateStr)))
  return raw
}
