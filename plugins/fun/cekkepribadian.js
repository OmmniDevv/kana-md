import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkepribadian',
  alias: [],
  category: 'fun',
  description: { id: 'Cek tipe kepribadian seseorang dari namanya, buat hiburan', en: 'Check someone personality type reading, just for fun' },
  usage: '.cekkepribadian <nama> atau kosongkan untuk dirimu',
  example: '.cekkepribadian Budi',
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
    cekkepribadian: {
      title: 'Cek Kepribadian 🪞',
      result: 'Kekuatan kepribadian {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Kepribadiannya kalem dan misterius, susah ditebak~',
      mid: 'Kepribadiannya seimbang, enak diajak kerja sama~',
      high: 'Kepribadiannya kuat dan gampang diingat orang~',
      max: 'KEPRIBADIAN BINTANG UTAMA! Semua mata otomatis tertuju~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekkepribadian: {
      title: 'Personality Check 🪞',
      result: 'Personality strength of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'A calm and mysterious personality, hard to read~',
      mid: 'A balanced personality, easy to work with~',
      high: 'A strong personality that people easily remember~',
      max: 'MAIN STAR PERSONALITY! All eyes automatically turn~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekkepribadian', expect: /kepribadian|personality/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:pribadi`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekkepribadian.result', {
    name: target,
    percent,
    comment: ctx.t(`cekkepribadian.${band}`),
    disclaimer: ctx.t('cekkepribadian.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekkepribadian.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekkepribadian.btnAgain'), id: '.cekkepribadian' },
      { text: ctx.t('cekkepribadian.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
