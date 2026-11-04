import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekintrovert',
  alias: ['introvert'],
  category: 'fun',
  description: { id: 'Cek persen introvert seseorang dari namanya, buat hiburan', en: 'Check how introverted someone is, just for fun' },
  usage: '.cekintrovert <nama> atau kosongkan untuk dirimu',
  example: '.cekintrovert Budi',
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
    cekintrovert: {
      title: 'Cek Introvert 🔋',
      result: 'Tingkat introvert {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Ekstrovert garis keras, baterai sosialnya tidak habis-habis~',
      mid: 'Ambivert nih, bisa rame bisa kalem tergantung suasana~',
      high: 'Introvert terdeteksi, kamar dan headphone adalah surga~',
      max: 'INTROVERT SEJATI! Keluar rumah cuma kalau sangat terpaksa~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekintrovert: {
      title: 'Introvert Check 🔋',
      result: 'Introvert level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Hardcore extrovert, the social battery never runs out~',
      mid: 'Ambivert, can be loud or calm depending on the mood~',
      high: 'Introvert detected, a room and headphones are heaven~',
      max: 'TRUE INTROVERT! Leaves the house only when absolutely forced~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekintrovert', expect: /introvert/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:introvert`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekintrovert.result', {
    name: target,
    percent,
    comment: ctx.t(`cekintrovert.${band}`),
    disclaimer: ctx.t('cekintrovert.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekintrovert.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekintrovert.btnAgain'), id: '.cekintrovert' },
      { text: ctx.t('cekintrovert.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
