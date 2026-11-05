
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "wa-canvas",
  alias: [],
  category: "fun",
  description: { id: "Buat fake WhatsApp profile card", en: "KANA version of the Elaina-MD wa-canvas feature, rewritten in KANA style" },
  usage: ".wa-canvas",
  example: ".wa-canvas",
  cooldown: 5,
}

export const i18n = {
  id: {
    "wa-canvas": {
      title: "Cek wa-canvas",
      result: "╭─❏ 🔮 「 *CEK WA-CANVAS* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ʜᴀꜱɪʟ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Masih kecil nih, tapi potensinya ada kok~",
      mid: "Lumayan, di tengah tengah, kadang muncul kadang tidak~",
      high: "Tinggi nih! Kelihatan banget dari auranya~",
      max: "PARAH, level maksimal! Sudah level legenda~",
      disclaimer: "Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "wa-canvas": {
      title: "wa-canvas check",
      result: "╭─❏ 🔮 「 *WA-CANVAS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʀᴇꜱᴜʟᴛ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
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
export const test = { input: '.wa-canvas Budi', expect: /cek|check/i }
export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(target.toLowerCase() + ':wa-canvas')
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('wa-canvas.result', { name: target, percent, comment: ctx.t('wa-canvas.' + band), disclaimer: ctx.t('wa-canvas.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('wa-canvas.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('wa-canvas.btnAgain'), id: '.wa-canvas' }], textFallback: body })
}
