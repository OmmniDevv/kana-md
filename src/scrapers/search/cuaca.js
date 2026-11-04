// Scraper cuaca Open-Meteo (tanpa API key): geocoding nama kota lalu
// prakiraan saat ini dan harian. Modul mengembalikan weather_code mentah;
// pemetaan kode ke teks bahasa dilakukan plugin lewat kunci i18n.
import { retry, withBreaker } from '../runner.js'

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'

export function parseGeocoding(json) {
  const first = json?.results?.[0]
  if (!first) return null
  return {
    name: first.name,
    admin1: first.admin1 || '',
    country: first.country || '',
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone || 'auto',
  }
}

export function parseForecast(json) {
  if (!json?.current) return null
  const daily = json.daily || {}
  const days = (daily.time || []).map((date, i) => ({
    date,
    max: daily.temperature_2m_max?.[i] ?? null,
    min: daily.temperature_2m_min?.[i] ?? null,
    precipitationProbability: daily.precipitation_probability_max?.[i] ?? null,
  }))
  return {
    current: {
      temperature: json.current.temperature_2m ?? null,
      humidity: json.current.relative_humidity_2m ?? null,
      weatherCode: json.current.weather_code ?? null,
      windSpeed: json.current.wind_speed_10m ?? null,
    },
    daily: days.slice(0, 3),
    timezone: json.timezone || '',
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Open-Meteo balas HTTP ${res.status}`)
  return res.json()
}

export async function getWeather(cityQuery) {
  const city = String(cityQuery || '').trim()
  if (!city) throw new Error('Nama kota wajib diisi')
  return withBreaker('open-meteo', () =>
    retry(async () => {
      const geo = parseGeocoding(
        await fetchJson(`${GEO_BASE}?name=${encodeURIComponent(city)}&count=1&language=id`)
      )
      if (!geo) return null
      const params = new URLSearchParams({
        latitude: String(geo.latitude),
        longitude: String(geo.longitude),
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
      })
      const forecast = parseForecast(await fetchJson(`${FORECAST_BASE}?${params}`))
      if (!forecast) throw new Error('Data prakiraan kosong')
      return { place: geo, ...forecast }
    })
  )
}
