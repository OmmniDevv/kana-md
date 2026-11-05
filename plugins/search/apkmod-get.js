
import { deliverApkmodPick, getApkmodBinding } from './apkmod.js'

// Apkmod-get: ambil detail aplikasi dari sesi .apkmod aktif di chat ini
// (binding reply-router yang sama, kind apkmod). Jalur utamanya tetap
// reply nomor ke pesan daftar apkmod.
export const config = {
  name: "apkmod-get",
  alias: ["apkmodget", "getapkmod"],
  category: "search",
  description: { id: "Ambil detail aplikasi dari hasil apkmod terakhir di chat ini", en: "Get an app detail from the latest apkmod results in this chat" },
  usage: ".apkmod-get <nomor>",
  example: ".apkmod-get 1",
  cooldown: 5,
}

export const i18n = {
  id: {
    "apkmod-get": {
      hint: "╭─❏ 📱 「 *APKMOD-GET* 」\n┊ Tulis nomor aplikasinya dari hasil *.apkmod* yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.apkmod-get 1*\n╰━━━━━━━",
      noSession: "╭─❏ 📱 「 *BELUM ADA SESI APK* 」\n┊ Cari aplikasinya dulu pakai *.apkmod <nama>* yaa, lalu pilih nomornya~\n╰━━━━━━━",
      notOwner: "╭─❏ 📱 「 *APKMOD-GET* 」\n┊ Sesi ini punya pencari pertamanya, minta dia yang memilih yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "apkmod-get": {
      hint: "╭─❏ 📱 「 *APKMOD-GET* 」\n┊ Write the app number from *.apkmod* results~\n┊ ᴇxᴀᴍᴘʟᴇ: *.apkmod-get 1*\n╰━━━━━━━",
      noSession: "╭─❏ 📱 「 *NO APK SESSION YET* 」\n┊ Search first with *.apkmod <name>*, then pick a number~\n╰━━━━━━━",
      notOwner: "╭─❏ 📱 「 *APKMOD-GET* 」\n┊ This session belongs to its first searcher, ask them to pick~\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.apkmod-get 1', expect: /apkmod/i }
export async function handler(ctx) {
  const index = parseInt(ctx.args[0], 10)
  if (!Number.isInteger(index)) return ctx.reply(ctx.t('apkmod-get.hint'))
  const binding = await getApkmodBinding(ctx)
  if (!binding) return ctx.reply(ctx.t('apkmod-get.noSession'))
  if (binding.ownerDigits && ctx.senderDigits !== binding.ownerDigits) return ctx.reply(ctx.t('apkmod-get.notOwner'))
  return deliverApkmodPick(ctx, binding, index)
}
