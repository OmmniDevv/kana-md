
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "cekhoki",
  alias: [],
  category: "cek",
  description: { id: "Cek seberapa hoki kamu", en: "KANA version of the Elaina-MD cekhoki feature, rewritten in KANA style" },
  usage: ".cekhoki",
  example: ".cekhoki",
  cooldown: 5,
}

export const i18n = {
  id: {
    "cekhoki": {
      title: "Cek hoki",
      result: "╭─❏ 🔮 「 *CEK HOKI* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ʜᴀꜱɪʟ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Masih kecil nih, tapi potensinya ada kok~",
      mid: "Lumayan, di tengah tengah, kadang muncul kadang tidak~",
      high: "Tinggi nih! Kelihatan banget dari auranya~",
      max: "PARAH, level maksimal! Sudah level legenda~",
      disclaimer: "Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "cekhoki": {
      title: "hoki check",
      result: "╭─❏ 🔮 「 *HOKI CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʀᴇꜱᴜʟᴛ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
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
export const test = { input: '.cekhoki Budi', expect: /cek|check/i }
export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(target.toLowerCase() + ':cekhoki')
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekhoki.result', { name: target, percent, comment: ctx.t('cekhoki.' + band), disclaimer: ctx.t('cekhoki.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('cekhoki.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('cekhoki.btnAgain'), id: '.cekhoki' }], textFallback: body })
}
