
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "tembak",
  alias: [],
  category: "fun",
  description: { id: "Fitur tembak versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD tembak feature, rewritten in KANA style" },
  usage: ".tembak",
  example: ".tembak",
  cooldown: 5,
}

export const i18n = {
  id: {
    "tembak": {
      title: "Cek tembak",
      result: "╭─❏ 🔮 「 *CEK TEMBAK* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ʜᴀꜱɪʟ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Masih kecil nih, tapi potensinya ada kok~",
      mid: "Lumayan, di tengah tengah, kadang muncul kadang tidak~",
      high: "Tinggi nih! Kelihatan banget dari auranya~",
      max: "PARAH, level maksimal! Sudah level legenda~",
      disclaimer: "Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "tembak": {
      title: "tembak check",
      result: "╭─❏ 🔮 「 *TEMBAK CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʀᴇꜱᴜʟᴛ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
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
export const test = { input: '.tembak Budi', expect: /cek|check/i }
export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(target.toLowerCase() + ':tembak')
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('tembak.result', { name: target, percent, comment: ctx.t('tembak.' + band), disclaimer: ctx.t('tembak.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tembak.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('tembak.btnAgain'), id: '.tembak' }], textFallback: body })
}
