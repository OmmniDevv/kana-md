
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "coba",
  alias: [],
  category: "fun",
  description: { id: "Coba tanyakan sesuatu ke bot", en: "KANA version of the Elaina-MD coba feature, rewritten in KANA style" },
  usage: ".coba",
  example: ".coba",
  cooldown: 5,
}

export const i18n = {
  id: {
    "coba": {
      title: "Cek coba",
      result: "╭─❏ 🔮 「 *CEK COBA* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ʜᴀꜱɪʟ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Masih kecil nih, tapi potensinya ada kok~",
      mid: "Lumayan, di tengah tengah, kadang muncul kadang tidak~",
      high: "Tinggi nih! Kelihatan banget dari auranya~",
      max: "PARAH, level maksimal! Sudah level legenda~",
      disclaimer: "Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "coba": {
      title: "coba check",
      result: "╭─❏ 🔮 「 *COBA CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʀᴇꜱᴜʟᴛ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Still small, but the potential is there~",
      mid: "Decent, in the middle, sometimes it shows sometimes not~",
      high: "High! It really shows from the aura~",
      max: "EXTREME, maximum level! Legendary tier~",
      disclaimer: "Just for fun, the percent is KANA playful name reading, not a real measure~",
      btnAgain: "Check Again",
    },
  },
}

export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}
export const test = { input: '.coba Budi', expect: /cek|check/i }
export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(target.toLowerCase() + ':coba')
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('coba.result', { name: target, percent, comment: ctx.t('coba.' + band), disclaimer: ctx.t('coba.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('coba.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('coba.btnAgain'), id: '.coba' }], textFallback: body })
}
