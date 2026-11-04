import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekoverpower',
  alias: ['overpower'],
  category: 'fun',
  description: { id: 'Cek persen overpower seseorang ala tokoh anime, buat hiburan', en: 'Check how overpowered someone is like an anime character, just for fun' },
  usage: '.cekoverpower <nama> atau kosongkan untuk dirimu',
  example: '.cekoverpower Budi',
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
    cekoverpower: {
      title: 'Cek Overpower 💥',
      result: 'Tingkat overpower {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Masih karakter figuran, perlu latihan arc dulu~',
      mid: 'Setara tokoh pendukung penting, lumayan bisa diandalkan~',
      high: 'Overpower terdeteksi! Lawan saja sampai malas menyerang~',
      max: 'OVERPOWER MAKSIMAL! Sekali kedip, boss terakhir langsung tumbang~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekoverpower: {
      title: 'Overpower Check 💥',
      result: 'Overpower level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Still a background character, needs a training arc~',
      mid: 'Equal to an important side character, quite reliable~',
      high: 'Overpowered detected! Even enemies get lazy to attack~',
      max: 'MAXIMUM OVERPOWERED! One blink and the final boss falls~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekoverpower', expect: /overpower/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:overpower`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekoverpower.result', {
    name: target,
    percent,
    comment: ctx.t(`cekoverpower.${band}`),
    disclaimer: ctx.t('cekoverpower.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekoverpower.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekoverpower.btnAgain'), id: '.cekoverpower' },
      { text: ctx.t('cekoverpower.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
