
import { deliverMusicPick, getMusicBinding } from './carimusik.js'

// Getmusik: ambil audio dari sesi carimusik yang masih aktif di chat ini
// (binding reply-router yang sama, kind carimusik). .getmusik <nomor>
// adalah jalur perintahnya; jalur utamanya tetap reply nomor ke pesan
// daftar carimusik.
export const config = {
  name: "getmusik",
  alias: ["dlmusik", "downloadmusik"],
  category: "search",
  description: { id: "Download lagu dari hasil carimusik terakhir di chat ini", en: "Download a song from the latest carimusik results in this chat" },
  usage: ".getmusik <nomor>",
  example: ".getmusik 1",
  cooldown: 5,
}

export const i18n = {
  id: {
    "getmusik": {
      hint: "╭─❏ 🎵 「 *GETMUSIK* 」\n┊ Tulis nomor lagunya dari hasil *.carimusik* yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.getmusik 1*\n╰━━━━━━━",
      noSession: "╭─❏ 🎵 「 *BELUM ADA SESI MUSIK* 」\n┊ Cari lagunya dulu pakai *.carimusik <judul>* yaa, lalu pilih nomornya~\n╰━━━━━━━",
      notOwner: "╭─❏ 🎵 「 *GETMUSIK* 」\n┊ Sesi musik ini punya pencari pertamanya, minta dia yang memilih yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "getmusik": {
      hint: "╭─❏ 🎵 「 *GETMUSIK* 」\n┊ Write the song number from *.carimusik* results~\n┊ ᴇxᴀᴍᴘʟᴇ: *.getmusik 1*\n╰━━━━━━━",
      noSession: "╭─❏ 🎵 「 *NO MUSIC SESSION YET* 」\n┊ Search first with *.carimusik <title>*, then pick a number~\n╰━━━━━━━",
      notOwner: "╭─❏ 🎵 「 *GETMUSIK* 」\n┊ This music session belongs to its first searcher, ask them to pick~\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.getmusik 1', expect: /getmusik|musik|music/i }
export async function handler(ctx) {
  const index = parseInt(ctx.args[0], 10)
  if (!Number.isInteger(index)) return ctx.reply(ctx.t('getmusik.hint'))
  const binding = await getMusicBinding(ctx)
  if (!binding) return ctx.reply(ctx.t('getmusik.noSession'))
  if (binding.ownerDigits && ctx.senderDigits !== binding.ownerDigits) return ctx.reply(ctx.t('getmusik.notOwner'))
  return deliverMusicPick(ctx, binding, index)
}
