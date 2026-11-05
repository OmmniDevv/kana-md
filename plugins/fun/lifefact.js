import { sendButtons } from '../../src/ui/buttons.js'

// Lifefact: fakta statistik kehidupan dihitung lokal dari tanggal
// lahir, mengikuti seksi tampilan padanan Elaina-MD (dasar,
// kardiovaskular, pernapasan, metabolisme, perbandingan hidup,
// catatan). Semua angka adalah estimasi dari rata rata umum, bukan
// data medis. Tidak ada panggilan API luar.
export const config = {
  name: 'lifefact',
  alias: ['funfacthidup', 'livefunfact'],
  category: 'fun',
  description: { id: 'Fakta statistik kehidupan dari tanggal lahir, dihitung lokal', en: 'Life statistics facts from a birth date, computed locally' },
  usage: '.lifefact <YYYY-MM-DD>',
  example: '.lifefact 2002-01-11',
  cooldown: 5,
}

export const WORLD_LIFE_EXPECTANCY = 73
const HEART_RATE_PER_MINUTE = 72
const BREATHS_PER_MINUTE = 16
const TIDAL_VOLUME_L = 0.5
const OXYGEN_FRACTION = 0.05
const CO2_FRACTION = 0.04
const CALORIES_PER_DAY = 2000
const BLOOD_PER_BEAT_L = 0.07

export const i18n = {
  id: {
    lifefact: {
      title: 'Fakta Kehidupan',
      usage: '╭─❏ 📅 「 *FAKTA KEHIDUPAN* 」\n┊ Tulis tanggal lahirmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.lifefact 2002-01-11*\n┊ ꜰᴏʀᴍᴀᴛ: *YYYY-MM-DD*\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *TANGGAL TIDAK VALID* 」\n┊ Tanggalnya tidak nyata atau masih di masa depan nih~\n┊ ᴄᴏɴᴛᴏʜ: *.lifefact 2002-01-11*\n╰━━━━━━━',
      result:
        '╭─❏ 🧠 「 *FAKTA KEHIDUPAN* 」\n┊ 📅 ᴛᴀɴɢɢᴀʟ ʟᴀʜɪʀ: *{birth}*\n┊\n┊ 📅 *Informasi Dasar*\n┊ • Umur: {years} tahun\n┊ • Hari hidup: {days} hari\n┊ • Jam hidup: {hours} jam\n┊ • Menit hidup: {minutes} menit\n┊ • Detik hidup: {seconds} detik\n┊\n┊ ❤️ *Sistem Kardiovaskular* (estimasi)\n┊ • Total detak jantung: {heartBeats}\n┊ • Darah dipompa: {bloodPumped} liter\n┊\n┊ 🫁 *Sistem Pernapasan* (estimasi)\n┊ • Total napas: {breaths}\n┊ • Oksigen dikonsumsi: {oxygen} liter\n┊ • CO2 dihasilkan: {co2} liter\n┊\n┊ 🔥 *Ringkasan Metabolisme* (estimasi)\n┊ • Kalori terbakar: {calories} kcal\n┊ • Energi dihasilkan: {energyKj} kJ\n┊\n┊ 🌍 *Perbandingan Kehidupan*\n┊ • Rata-rata harapan hidup dunia: {expectancy} tahun\n┊ • Persentase hidup dijalani: {percent}%\n┊ • Estimasi sisa umur: {remaining} tahun\n┊\n┊ ⚠️ *Catatan Medis*\n┊ Semua angka di atas adalah estimasi kasar dari rata rata umum (detak 72 per menit, napas 16 per menit, kalori 2000 per hari), bukan diagnosis atau data medis pribadi.\n╰━━━━━━━',
      btnAgain: 'Hitung Lagi',
    },
  },
  en: {
    lifefact: {
      title: 'Life Facts',
      usage: '╭─❏ 📅 「 *LIFE FACTS* 」\n┊ Write your birth date first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.lifefact 2002-01-11*\n┊ ꜰᴏʀᴍᴀᴛ: *YYYY-MM-DD*\n╰━━━━━━━',
      invalid: '╭─❏ 💦 「 *INVALID DATE* 」\n┊ That date is not real or is still in the future~\n┊ ᴇxᴀᴍᴘʟᴇ: *.lifefact 2002-01-11*\n╰━━━━━━━',
      result:
        '╭─❏ 🧠 「 *LIFE FACTS* 」\n┊ 📅 ʙɪʀᴛʜ ᴅᴀᴛᴇ: *{birth}*\n┊\n┊ 📅 *Basic Information*\n┊ • Age: {years} years\n┊ • Days alive: {days} days\n┊ • Hours alive: {hours} hours\n┊ • Minutes alive: {minutes} minutes\n┊ • Seconds alive: {seconds} seconds\n┊\n┊ ❤️ *Cardiovascular System* (estimate)\n┊ • Total heart beats: {heartBeats}\n┊ • Blood pumped: {bloodPumped} liters\n┊\n┊ 🫁 *Respiratory System* (estimate)\n┊ • Total breaths: {breaths}\n┊ • Oxygen consumed: {oxygen} liters\n┊ • CO2 produced: {co2} liters\n┊\n┊ 🔥 *Metabolism Summary* (estimate)\n┊ • Calories burned: {calories} kcal\n┊ • Energy produced: {energyKj} kJ\n┊\n┊ 🌍 *Life Comparison*\n┊ • World life expectancy average: {expectancy} years\n┊ • Percentage of life lived: {percent}%\n┊ • Estimated remaining years: {remaining} years\n┊\n┊ ⚠️ *Medical Note*\n┊ All numbers above are rough estimates from general averages (72 heart beats per minute, 16 breaths per minute, 2000 calories per day), not a diagnosis or personal medical data.\n╰━━━━━━━',
      btnAgain: 'Compute Again',
    },
  },
}

export const test = { input: '.lifefact 2002-01-11', expect: /fakta kehidupan|life facts/i }

const fmtInt = (n) => Math.round(n).toLocaleString('id-ID')
const fmtDecimal = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Hitung fakta kehidupan dari tanggal lahir YYYY-MM-DD. Mengembalikan
// null bila format salah, tanggal tidak nyata, atau tanggal di masa
// depan. now bisa disuntik buat tes.
export function computeLifeFacts(birthStr, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthStr || '')) return null
  const [y, m, d] = birthStr.split('-').map(Number)
  const birthMs = Date.UTC(y, m - 1, d)
  const check = new Date(birthMs)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null
  if (birthMs > now.getTime()) return null

  const seconds = Math.floor((now.getTime() - birthMs) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  let years = now.getUTCFullYear() - y
  const birthdayThisYear = Date.UTC(now.getUTCFullYear(), m - 1, d)
  if (now.getTime() < birthdayThisYear) years -= 1

  const heartBeats = minutes * HEART_RATE_PER_MINUTE
  const breaths = minutes * BREATHS_PER_MINUTE
  const airVolumeL = breaths * TIDAL_VOLUME_L
  const yearsExact = days / 365.25
  return {
    birth: birthStr,
    years,
    days,
    hours,
    minutes,
    seconds,
    heartBeats,
    bloodPumped: heartBeats * BLOOD_PER_BEAT_L,
    breaths,
    oxygen: airVolumeL * OXYGEN_FRACTION,
    co2: airVolumeL * CO2_FRACTION,
    calories: days * CALORIES_PER_DAY,
    energyKj: days * CALORIES_PER_DAY * 4.184,
    expectancy: WORLD_LIFE_EXPECTANCY,
    percent: (yearsExact / WORLD_LIFE_EXPECTANCY) * 100,
    remaining: Math.max(0, WORLD_LIFE_EXPECTANCY - yearsExact),
  }
}

export function formatLifeFacts(t, facts) {
  return t('lifefact.result', {
    birth: facts.birth,
    years: fmtInt(facts.years),
    days: fmtInt(facts.days),
    hours: fmtInt(facts.hours),
    minutes: fmtInt(facts.minutes),
    seconds: fmtInt(facts.seconds),
    heartBeats: fmtInt(facts.heartBeats),
    bloodPumped: fmtInt(facts.bloodPumped),
    breaths: fmtInt(facts.breaths),
    oxygen: fmtInt(facts.oxygen),
    co2: fmtInt(facts.co2),
    calories: fmtInt(facts.calories),
    energyKj: fmtInt(facts.energyKj),
    expectancy: fmtInt(facts.expectancy),
    percent: fmtDecimal(facts.percent),
    remaining: fmtDecimal(facts.remaining),
  })
}

export async function handler(ctx) {
  const birthStr = (ctx.text || '').trim()
  if (!birthStr) return ctx.reply(ctx.t('lifefact.usage'))
  const facts = computeLifeFacts(birthStr)
  if (!facts) return ctx.reply(ctx.t('lifefact.invalid'))
  const body = formatLifeFacts(ctx.t, facts)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('lifefact.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('lifefact.btnAgain'), id: '.lifefact' }],
    textFallback: body,
  })
}
