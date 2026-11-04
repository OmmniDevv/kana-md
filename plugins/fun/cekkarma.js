import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkarma',
  alias: ['karma'],
  category: 'fun',
  description: { id: 'Cek persen saldo karma seseorang, buat hiburan saja', en: 'Check someone karma balance reading, just for fun' },
  usage: '.cekkarma <nama> atau kosongkan untuk dirimu',
  example: '.cekkarma Budi',
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
    cekkarma: {
      title: 'Cek Karma ☯️',
      result: 'Saldo karma {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Karma lagi seret, hati-hati kalau mau iseng ke orang~',
      mid: 'Karmanya seimbang, baik dibalas baik juga~',
      high: 'Karmanya bagus, sering nolong orang diam-diam nih~',
      max: 'KARMA EMAS! Tabungan kebaikannya tidak habis-habis~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekkarma: {
      title: 'Karma Check ☯️',
      result: 'Karma balance of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Karma is low, be careful before pranking anyone~',
      mid: 'Balanced karma, good returns good~',
      high: 'Good karma, secretly helps people often~',
      max: 'GOLDEN KARMA! An endless savings of good deeds~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekkarma', expect: /karma/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:karma`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekkarma.result', {
    name: target,
    percent,
    comment: ctx.t(`cekkarma.${band}`),
    disclaimer: ctx.t('cekkarma.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekkarma.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekkarma.btnAgain'), id: '.cekkarma' },
      { text: ctx.t('cekkarma.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
