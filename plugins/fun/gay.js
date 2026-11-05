
import { pickRandomMember } from './randomtag.js'

// Gay: pilih satu member grup secara ACAK lalu tag beneran pakai mentions,
// seperti Elaina-MD (isGroup, peserta dari metadata grup). Persennya acak
// murni Math.random, bukan hash nama. Khusus grup.
export const config = {
  name: "gay",
  alias: ["howgay"],
  category: "fun",
  description: { id: "Menunjuk member paling gay di grup", en: "Point at the gayest group member" },
  usage: ".gay",
  example: ".gay",
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    "gay": {
      title: "Cek gay",
      result: "╭─❏ 🔮 「 *CEK GAY* 」\n┊ ɴᴀᴍᴀ: *@{name}*\n┊ ʜᴀꜱɪʟ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Masih kecil nih, tapi potensinya ada kok~",
      mid: "Lumayan, di tengah tengah, kadang muncul kadang tidak~",
      high: "Tinggi nih! Kelihatan banget dari auranya~",
      max: "PARAH, level maksimal! Sudah level legenda~",
      disclaimer: "Ini cuma hiburan yaa, persennya acak iseng KANA, bukan ukuran beneran~",
      empty: "╭─❏ 🔮 「 *CEK GAY* 」\n┊ Hmm, tidak ada member lain yang bisa dipilih di grup ini~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *CEK GAY GAGAL* 」\n┊ Mouu, data grupnya gagal diambil: *{message}*\n╰━━━━━━━",
      btnAgain: "Cek Lagi",
    },
  },
  en: {
    "gay": {
      title: "gay check",
      result: "╭─❏ 🔮 「 *GAY CHECK* 」\n┊ ɴᴀᴍᴇ: *@{name}*\n┊ ʀᴇꜱᴜʟᴛ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}",
      low: "Still small, but the potential is there~",
      mid: "Decent, in the middle, sometimes it shows sometimes not~",
      high: "High! It really shows from the aura~",
      max: "EXTREME, maximum level! Legendary tier~",
      disclaimer: "Just for fun, the percent is a random playful reading, not a real measure~",
      empty: "╭─❏ 🔮 「 *GAY CHECK* 」\n┊ Hmm, there is no other member to pick in this group~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAY CHECK FAILED* 」\n┊ Mouu, group data failed to load: *{message}*\n╰━━━━━━━",
      btnAgain: "Check Again",
    },
  },
}

export function pickGayPercent(rng = Math.random) {
  return Math.min(100, Math.floor(rng() * 101))
}

export const test = { input: '.gay', expect: /cek|check/i }
export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try {
      meta = await ctx.getGroupMetadata()
    } catch (err) {
      return ctx.reply(ctx.t('gay.fail', { message: err.message }))
    }
  }
  const picked = pickRandomMember(meta?.participants ?? [], { botJid: ctx.botJid })
  if (!picked) return ctx.reply(ctx.t('gay.empty'))
  const digits = picked.split('@')[0].split(':')[0].replace(/\D/g, '')
  const percent = pickGayPercent()
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('gay.result', { name: digits, percent, comment: ctx.t('gay.' + band), disclaimer: ctx.t('gay.disclaimer') })
  return ctx.sock.sendMessage(ctx.chat, { text: body, mentions: [picked] }, { quoted: ctx.raw })
}
