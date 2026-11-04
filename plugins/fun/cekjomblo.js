import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekjomblo',
  alias: ['jomblo'],
  category: 'fun',
  description: { id: 'Cek persen kejombloan seseorang, buat hiburan saja', en: 'Check how single someone is, just for fun' },
  usage: '.cekjomblo <nama> atau kosongkan untuk dirimu',
  example: '.cekjomblo Budi',
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
    cekjomblo: {
      title: 'Cek Jomblo 💔',
      result: 'Tingkat kejombloan {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Aman, sudah ada yang nemenin tiap hari~',
      mid: 'Setengah jomblo, ada gebetan tapi belum jelas~',
      high: 'Jomblo terdeteksi akut, guling jadi saksi bisu tiap malam~',
      max: 'JOMBLO LEGENDARIS! Statusnya sudah seperti monumen~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekjomblo: {
      title: 'Single Check 💔',
      result: 'Singleness level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Safe, someone accompanies every day~',
      mid: 'Half single, there is a crush but nothing official~',
      high: 'Acute single detected, the bolster is a silent witness every night~',
      max: 'LEGENDARY SINGLE! The status is basically a monument~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekjomblo', expect: /jomblo|single/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:jomblo`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekjomblo.result', {
    name: target,
    percent,
    comment: ctx.t(`cekjomblo.${band}`),
    disclaimer: ctx.t('cekjomblo.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekjomblo.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekjomblo.btnAgain'), id: '.cekjomblo' },
      { text: ctx.t('cekjomblo.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
