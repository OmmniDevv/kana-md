import { getWeather } from '../../src/scrapers/search/cuaca.js'

export const config = {
  name: 'cuaca',
  alias: [],
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
      needCity: '╭─❏ 🌤️ 「 *CEK CUACA* 」\n┊ Ketik nama kotanya dulu yaa~\n┊ Contoh: *.cuaca Jakarta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *KOTA TIDAK KETEMU* 」\n┊ Mouu, kota *{city}* nggak ketemu~\n┊ Coba ejaan lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *CEK CUACA GAGAL* 」\n┊ Mouu, cek cuaca gagal: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 🌤️ 「 *CUACA DI {place}, {country}* 」',
      now: '┊ ꜱᴇᴋᴀʀᴀɴɢ: *{condition}, {temp}°C*',
      humidity: '┊ ᴋᴇʟᴇᴍʙᴀʙᴀɴ: *{value}%*',
      wind: '┊ ᴀɴɢɪɴ: *{value} km/jam*',
      forecastHeader: '┊ ᴘʀᴀᴋɪʀᴀᴀɴ 3 ʜᴀʀɪ ᴋᴇ ᴅᴇᴘᴀɴ:',
      day: '┊ {date}: *{min}°C* sampai *{max}°C*, peluang hujan *{rain}%*',
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
      needCity: '╭─❏ 🌤️ 「 *WEATHER CHECK* 」\n┊ Type the city name first~\n┊ Example: *.cuaca Jakarta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CITY NOT FOUND* 」\n┊ Mouu, the city *{city}* was not found~\n┊ Try another spelling~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *WEATHER CHECK FAILED* 」\n┊ Mouu, weather check failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🌤️ 「 *WEATHER IN {place}, {country}* 」',
      now: '┊ ɴᴏᴡ: *{condition}, {temp}°C*',
      humidity: '┊ ʜᴜᴍɪᴅɪᴛʏ: *{value}%*',
      wind: '┊ ᴡɪɴᴅ: *{value} km/h*',
      forecastHeader: '┊ ꜰᴏʀᴇᴄᴀꜱᴛ ꜰᴏʀ ᴛʜᴇ ɴᴇxᴛ 3 ᴅᴀʏꜱ:',
      day: '┊ {date}: *{min}°C* to *{max}°C*, rain chance *{rain}%*',
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

export const test = { input: '.cuaca Jakarta', expect: /Cuaca di Jakarta/i }

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
  lines.push('╰━━━━━━━')
  await ctx.reply(lines.join('\n'))
}
