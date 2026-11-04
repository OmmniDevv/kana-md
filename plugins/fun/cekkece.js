import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkece',
  alias: ['kece'],
  category: 'fun',
  description: { id: 'Cek persen kece seseorang, buat hiburan saja', en: 'Check how cool someone is, just for fun' },
  usage: '.cekkece <nama> atau kosongkan untuk dirimu',
  example: '.cekkece Budi',
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
    cekkece: {
      title: 'Cek Kece 🆒',
      result: 'Tingkat kece {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Kecenya masih disembunyikan, belum mode tampil~',
      mid: 'Cukup kece, apalagi kalau outfitnya lagi pas~',
      high: 'Kece parah, auranya langsung terasa begitu masuk ruangan~',
      max: 'KECE MAKSIMAL! Definisi keren yang berjalan~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekkece: {
      title: 'Coolness Check 🆒',
      result: 'Coolness level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Coolness still hidden, not in show mode yet~',
      mid: 'Cool enough, especially with the right outfit~',
      high: 'Super cool, the aura hits the moment they enter the room~',
      max: 'MAXIMUM COOL! The walking definition of cool~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekkece', expect: /kece|cool/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:kece`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekkece.result', {
    name: target,
    percent,
    comment: ctx.t(`cekkece.${band}`),
    disclaimer: ctx.t('cekkece.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekkece.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekkece.btnAgain'), id: '.cekkece' },
      { text: ctx.t('cekkece.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
