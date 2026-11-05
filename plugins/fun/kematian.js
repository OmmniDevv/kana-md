import { sendButtons } from '../../src/ui/buttons.js'

// Kematian: ramalan kematian lucu seperti padanan Elaina-MD. Nama dari
// argumen atau pushName, tanggal acak di masa mendatang, dan penyebab
// acak dari daftar penyebab lucu. Murni hiburan, murni Math.random.
export const config = {
  name: 'kematian',
  alias: [],
  category: 'fun',
  description: { id: 'Ramalan kematian lucu: tanggal dan penyebab acak', en: 'Funny death fortune: random date and cause' },
  usage: '.kematian <nama>',
  example: '.kematian Budi',
  cooldown: 5,
}

export const DEATH_CAUSES = [
  'keracunan cilok expired 😵',
  'ditabrak mobil odading 😩',
  'terpeleset di kamar mandi pas nyanyi dangdut 🚿🎤',
  'kecanduan scrolling TikTok 48 jam nonstop 📱',
  'ngambek sama bot sendiri terus putus asa 😭',
  'kelamaan jomblo sampai badan menghilang 🫥',
  'makan mie pakai kopi dan susu 🤢',
  'diculik alien terus dikira bahan eksperimen 👽',
  'dipukul karma karena suka nyolong meme 🙃',
  'ketawa ngakak sampai lupa napas 😂',
]

export const i18n = {
  id: {
    kematian: {
      title: 'Ramalan Kematian',
      result: '╭─❏ 💀 「 *RAMALAN KEMATIAN* 」\n┊ 📛 ɴᴀᴍᴀ: *{name}*\n┊ 🗓️ ᴛᴀɴɢɢᴀʟ: *{date}*\n┊ ⚰️ ᴘᴇɴʏᴇʙᴀʙ: *{cause}*\n┊\n┊ _Cuma ramalan iseng buat hiburan yaa, bukan beneran~_\n╰━━━━━━━',
      btnAgain: 'Ramalan Lagi',
    },
  },
  en: {
    kematian: {
      title: 'Death Fortune',
      result: '╭─❏ 💀 「 *DEATH FORTUNE* 」\n┊ 📛 ɴᴀᴍᴇ: *{name}*\n┊ 🗓️ ᴅᴀᴛᴇ: *{date}*\n┊ ⚰️ ᴄᴀᴜꜱᴇ: *{cause}*\n┊\n┊ _Just a playful fortune for fun, not real~_\n╰━━━━━━━',
      btnAgain: 'Fortune Again',
    },
  },
}

export const test = { input: '.kematian Budi', expect: /ramalan kematian|death fortune/i }

// Tanggal acak wajar di masa mendatang: 1 sampai 70 tahun dari
// sekarang, hari dan bulan dipilih acak dan selalu tanggal nyata.
export function randomDeathDate(rng = Math.random, now = new Date()) {
  const year = now.getFullYear() + 1 + Math.floor(rng() * 70)
  const month = Math.floor(rng() * 12)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const day = 1 + Math.floor(rng() * daysInMonth)
  return new Date(year, month, day)
}

export function formatDeathDate(date, lang = 'id') {
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function pickDeathCause(rng = Math.random) {
  return DEATH_CAUSES[Math.min(DEATH_CAUSES.length - 1, Math.floor(rng() * DEATH_CAUSES.length))]
}

export async function handler(ctx) {
  const name = (ctx.text || '').trim().slice(0, 60) || ctx.pushName || ctx.senderDigits
  const date = formatDeathDate(randomDeathDate(), ctx.lang)
  const body = ctx.t('kematian.result', { name, date, cause: pickDeathCause() })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kematian.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('kematian.btnAgain'), id: '.kematian' }],
    textFallback: body,
  })
}
