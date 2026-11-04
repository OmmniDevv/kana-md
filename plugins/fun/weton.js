import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'weton',
  alias: ['wetonjawa'],
  category: 'fun',
  description: { id: 'Hitung weton (hari dan pasaran Jawa) dari tanggal lahir', en: 'Find the weton (day and Javanese pasaran) of a birth date' },
  usage: '.weton <DD-MM-YYYY>',
  example: '.weton 17-08-1945',
  cooldown: 3,
}

// Pasaran berurutan mulai dari jangkar: 17 Agustus 1945 adalah Jumat Legi
// (hari proklamasi, terdokumentasi luas). Selisih hari dari jangkar dimod 5
// memetakan pasaran berikutnya: Legi, Pahing, Pon, Wage, Kliwon.
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']
const ANCHOR_UTC = Date.UTC(1945, 7, 17)
const DAY_MS = 86400000

// Fungsi murni: kembalikan { dayIndex (0=Minggu), pasaran } atau null bila
// format tanggal tidak valid atau tanggalnya tidak nyata.
export function wetonOf(dateStr) {
  const m = String(dateStr ?? '').trim().match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1) return null
  const utc = Date.UTC(year, month - 1, day)
  const check = new Date(utc)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null
  const diffDays = Math.round((utc - ANCHOR_UTC) / DAY_MS)
  const pasaran = PASARAN[((diffDays % 5) + 5) % 5]
  return { dayIndex: check.getUTCDay(), pasaran }
}

export const i18n = {
  id: {
    weton: {
      usage: 'Tulis tanggalnya format DD-MM-YYYY yaa, contoh: .weton 17-08-1945~',
      title: 'Weton Kamu 🌙',
      result: 'Tanggal {date} itu hari {day}, pasarannya {pasaran}.\nJadi weton kamu: {day} {pasaran}!\n\nSifat umum versi tradisi: {trait}\n\n{disclaimer}',
      disclaimer: 'Catatan: sifat weton ini kepercayaan tradisi dan cuma buat hiburan yaa, bukan penentu nasib~ (≧▽≦)',
      days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      traits: {
        Legi: 'manis tutur katanya, ramah, dan gampang bikin orang nyaman di dekatnya.',
        Pahing: 'semangatnya besar, ambisius, dan suka jadi yang terdepan.',
        Pon: 'tenang, suka ketertiban, dan pinter ngatur banyak hal pelan-pelan.',
        Wage: 'setia, pendiam di luar tapi perasa, dan tekun kalau sudah niat.',
        Kliwon: 'peka, penuh ide, dan punya daya tarik alami di pergaulan.',
      },
      btnAgain: 'Cek Tanggal Lain',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    weton: {
      usage: 'Write the date in DD-MM-YYYY format, example: .weton 17-08-1945~',
      title: 'Your Weton 🌙',
      result: '{date} was a {day}, with pasaran {pasaran}.\nSo your weton is: {day} {pasaran}!\n\nGeneral traits by tradition: {trait}\n\n{disclaimer}',
      disclaimer: 'Note: weton traits are traditional belief and just for fun, not a fate decider~ (≧▽≦)',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      traits: {
        Legi: 'sweet spoken, friendly, and easily makes people comfortable around them.',
        Pahing: 'big spirited, ambitious, and likes to be at the front.',
        Pon: 'calm, order loving, and good at arranging many things step by step.',
        Wage: 'loyal, quiet on the outside but sensitive, and persistent once committed.',
        Kliwon: 'perceptive, full of ideas, and naturally charming in social circles.',
      },
      btnAgain: 'Check Another Date',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.weton 17-08-1945', expect: /weton/i }

export async function handler(ctx) {
  const dateStr = (ctx.args[0] || '').trim()
  const result = wetonOf(dateStr)
  if (!result) return ctx.reply(ctx.t('weton.usage'))
  const days = i18n[ctx.lang]?.weton?.days ?? i18n.id.weton.days
  const dayName = days[result.dayIndex]
  const body = ctx.t('weton.result', {
    date: dateStr,
    day: dayName,
    pasaran: result.pasaran,
    trait: ctx.t(`weton.traits.${result.pasaran}`),
    disclaimer: ctx.t('weton.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('weton.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('weton.btnAgain'), id: '.weton 17-08-1945' },
    ],
    textFallback: body,
  })
}
