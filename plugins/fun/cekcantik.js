import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekcantik',
  alias: ['cantik'],
  category: 'fun',
  description: { id: 'Cek persen kecantikan seseorang dari namanya, buat hiburan', en: 'Check how beautiful someone is from their name, just for fun' },
  usage: '.cekcantik <nama> atau kosongkan untuk dirimu',
  example: '.cekcantik Budi',
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
    cekcantik: {
      title: 'Cek Kecantikan 🌷',
      result: 'Tingkat kecantikan {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Cantiknya tipe kalem, tidak perlu banyak gaya sudah manis~',
      mid: 'Cantik natural nih, makin dilihat makin manis~',
      high: 'Cantiknya menonjol! Pantes banyak yang melirik~',
      max: 'CANTIK PARAH! Levelnya sudah seperti tokoh utama drama~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekcantik: {
      title: 'Beauty Check 🌷',
      result: 'Beauty level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'The calm type of beauty, sweet without much styling~',
      mid: 'Natural beauty, sweeter the longer you look~',
      high: 'Striking beauty! No wonder people glance~',
      max: 'EXTREMELY BEAUTIFUL! Main character of a drama level~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekcantik', expect: /kecantikan|beauty/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:cantik`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekcantik.result', {
    name: target,
    percent,
    comment: ctx.t(`cekcantik.${band}`),
    disclaimer: ctx.t('cekcantik.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekcantik.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekcantik.btnAgain'), id: '.cekcantik' },
      { text: ctx.t('cekcantik.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
