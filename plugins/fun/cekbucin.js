import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekbucin',
  alias: ['bucin', 'bucin2'],
  category: 'fun',
  description: { id: 'Cek persen bucin seseorang ke pasangannya, buat hiburan', en: 'Check how much of a love slave someone is, just for fun' },
  usage: '.cekbucin <nama> atau kosongkan untuk dirimu',
  example: '.cekbucin Budi',
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
    cekbucin: {
      title: 'Cek Bucin 💘',
      result: 'Tingkat bucin {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Aman, masih pakai logika kalau urusan cinta~',
      mid: 'Mulai agak bucin nih kalau lagi sayang-sayangnya~',
      high: 'Bucin terdeteksi! Apa kata sayang, langsung gas~',
      max: 'BUCIN AKUT! Dunia serasa milik berdua, yang lain ngontrak~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekbucin: {
      title: 'Love Slave Check 💘',
      result: 'Love slave level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Safe, still uses logic when it comes to love~',
      mid: 'Getting a bit love-blind when deeply in love~',
      high: 'Love slave detected! Whatever the partner says, goes~',
      max: 'CRITICAL LOVE SLAVE! The world belongs to the two of them~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekbucin', expect: /bucin|love slave/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:bucin`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekbucin.result', {
    name: target,
    percent,
    comment: ctx.t(`cekbucin.${band}`),
    disclaimer: ctx.t('cekbucin.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekbucin.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekbucin.btnAgain'), id: '.cekbucin' },
    ],
    textFallback: body,
  })
}
