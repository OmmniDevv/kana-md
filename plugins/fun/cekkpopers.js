import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkpopers',
  alias: ['kpop'],
  category: 'fun',
  description: { id: 'Cek persen jiwa K-Popers seseorang, buat hiburan saja', en: 'Check how much of a K-Pop fan someone is, just for fun' },
  usage: '.cekkpopers <nama> atau kosongkan untuk dirimu',
  example: '.cekkpopers Budi',
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
    cekkpopers: {
      title: 'Cek K-Popers 🎤',
      result: 'Jiwa K-Popers {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Dengarnya cuma kalau lagi lewat di kafe~',
      mid: 'Suka beberapa grup, playlistnya campur-campur~',
      high: 'K-Popers terdeteksi! Hafal koreografi lebih dari nama tetangga~',
      max: 'K-POPERS GARIS KERAS! Lightstick selalu siap di tas~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekkpopers: {
      title: 'K-Pop Check 🎤',
      result: 'K-Pop soul of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Only hears it when passing by a cafe~',
      mid: 'Likes a few groups, the playlist is mixed~',
      high: 'K-Popper detected! Knows choreographies better than neighbors names~',
      max: 'HARDCORE K-POPPER! The lightstick is always ready in the bag~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekkpopers', expect: /kpop|k-pop/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:kpop`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekkpopers.result', {
    name: target,
    percent,
    comment: ctx.t(`cekkpopers.${band}`),
    disclaimer: ctx.t('cekkpopers.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekkpopers.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekkpopers.btnAgain'), id: '.cekkpopers' },
      { text: ctx.t('cekkpopers.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
