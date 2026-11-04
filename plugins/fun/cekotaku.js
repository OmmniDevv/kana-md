import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekotaku',
  alias: ['otaku'],
  category: 'fun',
  description: { id: 'Cek persen jiwa otaku seseorang, buat hiburan saja', en: 'Check how much of an otaku someone is, just for fun' },
  usage: '.cekotaku <nama> atau kosongkan untuk dirimu',
  example: '.cekotaku Budi',
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
    cekotaku: {
      title: 'Cek Otaku 🌸',
      result: '╭─❏ 🌸 「 *CEK OTAKU* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴊɪᴡᴀ ᴏᴛᴀᴋᴜ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Nonton anime cuma yang lagi viral saja~',
      mid: 'Setengah otaku, ada beberapa waifu dan husbu simpanan~',
      high: 'Otaku terdeteksi! Hafal opening anime lebih dari lagu kebangsaan~',
      max: 'OTAKU SEJATI! Kamarnya sudah seperti toko merchandise~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekotaku: {
      title: 'Otaku Check 🌸',
      result: '╭─❏ 🌸 「 *OTAKU CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴏᴛᴀᴋᴜ ꜱᴏᴜʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Only watches the viral anime titles~',
      mid: 'Half otaku, keeps a few waifu and husbu~',
      high: 'Otaku detected! Knows anime openings better than the anthem~',
      max: 'TRUE OTAKU! The room looks like a merchandise store~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekotaku', expect: /otaku/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:otaku`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekotaku.result', {
    name: target,
    percent,
    comment: ctx.t(`cekotaku.${band}`),
    disclaimer: ctx.t('cekotaku.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekotaku.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekotaku.btnAgain'), id: '.cekotaku' },
    ],
    textFallback: body,
  })
}
