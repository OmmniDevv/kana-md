import { getWeather } from '../../src/scrapers/search/cuaca.js'

export const config = {
  name: 'cuaca',
  alias: ['weather'],
  category: 'search',
  description: { id: 'Cek cuaca kota dari Open-Meteo', en: 'Check city weather from Open-Meteo' },
  usage: '.cuaca <nama kota>',
  example: '.cuaca Jakarta',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    cuaca: {
      needCity: 'Ketik nama kotanya dulu yaa, contoh: .cuaca Jakarta~',
      notFound: 'Mouu, kota "{city}" nggak ketemu. Coba ejaan lain ya~',
      failed: 'Mouu, cek cuaca gagal: {message}. Coba lagi nanti ya~',
      header: 'Cuaca di {place}, {country}',
      now: 'Sekarang: {condition}, {temp}°C',
      humidity: 'Kelembaban: {value}%',
      wind: 'Angin: {value} km/jam',
      forecastHeader: 'Prakiraan 3 hari ke depan:',
      day: '{date}: {min}°C sampai {max}°C, peluang hujan {rain}%',
      cond: {
        clear: 'cerah',
        cloudy: 'berawan',
        fog: 'berkabut',
        drizzle: 'gerimis',
        rain: 'hujan',
        snow: 'salju',
        heavyRain: 'hujan deras',
        thunderstorm: 'badai petir',
        unknown: 'tidak diketahui',
      },
    },
  },
  en: {
    cuaca: {
      needCity: 'Type the city name first, example: .cuaca Jakarta~',
      notFound: 'Mouu, the city "{city}" was not found. Try another spelling~',
      failed: 'Mouu, weather check failed: {message}. Try again later~',
      header: 'Weather in {place}, {country}',
      now: 'Now: {condition}, {temp}°C',
      humidity: 'Humidity: {value}%',
      wind: 'Wind: {value} km/h',
      forecastHeader: 'Forecast for the next 3 days:',
      day: '{date}: {min}°C to {max}°C, rain chance {rain}%',
      cond: {
        clear: 'clear',
        cloudy: 'cloudy',
        fog: 'foggy',
        drizzle: 'drizzle',
        rain: 'rain',
        snow: 'snow',
        heavyRain: 'heavy rain',
        thunderstorm: 'thunderstorm',
        unknown: 'unknown',
      },
    },
  },
}

export function weatherGroup(code) {
  if (code === 0) return 'clear'
  if (code >= 1 && code <= 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'heavyRain'
  if (code >= 95 && code <= 99) return 'thunderstorm'
  return 'unknown'
}

const round = (value) => (typeof value === 'number' ? Math.round(value) : '-')

export async function handler(ctx) {
  const city = ctx.text.trim()
  if (!city) return ctx.reply(ctx.t('cuaca.needCity'))
  let weather
  try {
    weather = await getWeather(city)
  } catch (err) {
    return ctx.reply(ctx.t('cuaca.failed', { message: err.message }))
  }
  if (!weather) return ctx.reply(ctx.t('cuaca.notFound', { city }))
  const place = [weather.place.name, weather.place.admin1].filter(Boolean).join(', ')
  const lines = [
    ctx.t('cuaca.header', { place, country: weather.place.country }),
    ctx.t('cuaca.now', {
      condition: ctx.t(`cuaca.cond.${weatherGroup(weather.current.weatherCode)}`),
      temp: round(weather.current.temperature),
    }),
    ctx.t('cuaca.humidity', { value: weather.current.humidity ?? '-' }),
    ctx.t('cuaca.wind', { value: round(weather.current.windSpeed) }),
  ]
  if (weather.daily.length) {
    lines.push(ctx.t('cuaca.forecastHeader'))
    for (const day of weather.daily) {
      lines.push(
        ctx.t('cuaca.day', {
          date: day.date,
          min: round(day.min),
          max: round(day.max),
          rain: day.precipitationProbability ?? '-',
        })
      )
    }
  }
  await ctx.reply(lines.join('\n'))
}
