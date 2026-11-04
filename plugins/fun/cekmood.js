import { sendButtons } from '../../src/ui/buttons.js'
import { wibDateString } from '../../src/services/user-service.js'

export const config = {
  name: 'cekmood',
  alias: ['stress'],
  category: 'fun',
  description: { id: 'Cek persen mood kamu hari ini, buat hiburan', en: 'Check your mood percent for today, just for fun' },
  usage: '.cekmood',
  example: '.cekmood',
  cooldown: 3,
}

// Hash deterministik kecil jadi persen 0 sampai 100. Duplikasi disengaja
// di tiap plugin cek-* supaya plugin tetap mandiri satu file.
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    cekmood: {
      title: 'Cek Mood 🌸',
      result: 'Mood {name} hari ini: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Lagi mendung yaa... istirahat bentar, minum air, KANA temenin kok (´• ω •`) 💕',
      mid: 'Moodnya lumayan nih, cukup buat jalan santai hari ini~ ✨',
      high: 'Moodnya bagus banget! Cocok buat ngerjain hal yang kamu suka~ (≧▽≦)',
      max: 'Uwahh moodnya meledak positif! Hari ini harimu banget~ 🎉💖',
      disclaimer: 'Ini cuma hiburan yaa, persennya dari ramalan iseng KANA, bukan ukuran perasaan beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekmood: {
      title: 'Mood Check 🌸',
      result: '{name} mood today: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'A bit cloudy today... take a short rest, drink some water, KANA is here with you (´• ω •`) 💕',
      mid: 'Your mood is decent, enough for a chill day~ ✨',
      high: 'Your mood is great! Perfect for doing things you love~ (≧▽≦)',
      max: 'Whoaa your mood is bursting with positivity! Today is your day~ 🎉💖',
      disclaimer: 'This is just for fun, the percent comes from KANA playful reading, not a real measure of feelings~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekmood', expect: /mood/i }

export async function handler(ctx) {
  const percent = hashPercent(`${ctx.senderDigits}:mood:${wibDateString()}`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekmood.result', {
    name: ctx.pushName || ctx.senderDigits,
    percent,
    comment: ctx.t(`cekmood.${band}`),
    disclaimer: ctx.t('cekmood.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekmood.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekmood.btnAgain'), id: '.cekmood' },
    ],
    textFallback: body,
  })
}
