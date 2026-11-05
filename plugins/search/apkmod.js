
import { bindReply, clearReply, getReplyBinding, registerReplyKind } from '../../src/ui/reply-router.js'
import { searchApkmod } from '../../src/scrapers/search/apkmod.js'

// Apkmod: cari aplikasi (scraper tanpa kunci di
// src/scrapers/search/apkmod.js), tampilkan daftar bernomor, simpan
// sebagai binding reply-router (kind apkmod). Balas nomor untuk detail
// dan tautan unduh aplikasi itu; .apkmod-get <nomor> jalur perintahnya.
export const config = {
  name: "apkmod",
  alias: ["modapk2", "apkpremium"],
  category: "search",
  description: { id: "Cari aplikasi, balas nomor untuk detail dan tautan unduhnya", en: "Search apps, reply with a number for its detail and download link" },
  usage: ".apkmod <kata kunci>",
  example: ".apkmod vpn",
  cooldown: 5,
}

export const i18n = {
  id: {
    "apkmod": {
      hint: "╭─❏ 📱 「 *APKMOD* 」\n┊ Tulis nama aplikasinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.apkmod vpn*\n╰━━━━━━━",
      list: "╭─❏ 📱 「 *HASIL APK: {q}* 」\n┊ {rows}\n┊\n┊ Balas (reply) pesan ini dengan nomornya, atau pakai *.apkmod-get <nomor>* yaa~\n╰━━━━━━━",
      row: "┊ {n}. *{name}*{extra}",
      detail: "╭─❏ 📱 「 *{name}* 」\n┊ ᴘᴀᴋᴇᴛ: *{pkg}*\n┊ ꜱᴜᴍʙᴇʀ: *{source}*\n┊ ʜᴀʟᴀᴍᴀɴ: {url}\n┊ ᴜɴᴅᴜʜ: {download}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      badNumber: "╭─❏ 📱 「 *NOMOR TIDAK VALID* 」\n┊ Pilih nomor 1 sampai {count} yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "apkmod": {
      hint: "╭─❏ 📱 「 *APKMOD* 」\n┊ Write the app name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.apkmod vpn*\n╰━━━━━━━",
      list: "╭─❏ 📱 「 *APK RESULTS: {q}* 」\n┊ {rows}\n┊\n┊ Reply to this message with the number, or use *.apkmod-get <number>*~\n╰━━━━━━━",
      row: "┊ {n}. *{name}*{extra}",
      detail: "╭─❏ 📱 「 *{name}* 」\n┊ ᴘᴀᴄᴋᴀɢᴇ: *{pkg}*\n┊ ꜱᴏᴜʀᴄᴇ: *{source}*\n┊ ᴘᴀɢᴇ: {url}\n┊ ᴅᴏᴡɴʟᴏᴀᴅ: {download}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no result for *{q}*~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      badNumber: "╭─❏ 📱 「 *INVALID NUMBER* 」\n┊ Pick a number from 1 to {count}~\n╰━━━━━━━",
    },
  },
}

export const apkmodDeps = { search: searchApkmod }
export const APKMOD_KIND = 'apkmod'

export function formatApkmodList(t, q, apps) {
  const rows = apps.map((a, i) => t('apkmod.row', { n: i + 1, name: a.name, extra: a.version ? ` (${a.version})` : '' })).join('\n')
  return t('apkmod.list', { q, rows })
}

export function formatApkmodDetail(t, app) {
  return t('apkmod.detail', { name: app.name, pkg: app.package || '-', source: app.source || '-', url: app.url || '-', download: app.downloadUrl || app.url || '-' })
}

// Kirim detail pilihan nomor dari binding sesi apkmod.
export async function deliverApkmodPick(ctx, binding, index) {
  const apps = binding?.data?.apps ?? []
  if (!apps.length) return false
  if (!Number.isInteger(index) || index < 1 || index > apps.length) {
    await ctx.reply(ctx.t('apkmod.badNumber', { count: apps.length }))
    return true
  }
  await clearReply(ctx.storage, ctx.chat)
  await ctx.reply(formatApkmodDetail(ctx.t, apps[index - 1]))
  return true
}

export async function getApkmodBinding(ctx) {
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  return binding?.kind === APKMOD_KIND ? binding : null
}

export const test = { input: '.apkmod vpn', expect: /apkmod|hasil apk|apk results/i }
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('apkmod.hint'))
  let apps
  try {
    apps = await apkmodDeps.search(q)
  } catch (err) {
    return ctx.reply(ctx.t('apkmod.fail', { message: err.message }))
  }
  if (!apps?.length) return ctx.reply(ctx.t('apkmod.notfound', { q }))
  const body = formatApkmodList(ctx.t, q, apps)
  const sent = await ctx.sock.sendMessage(ctx.chat, { text: body }, { quoted: ctx.raw })
  const messageId = sent?.key?.id
  if (messageId) {
    await bindReply(ctx.storage, ctx.chat, {
      kind: APKMOD_KIND,
      messageId,
      ownerDigits: ctx.senderDigits,
      data: { query: q, apps },
    })
  }
  return sent
}

registerReplyKind(APKMOD_KIND, async (ctx, binding) => {
  const index = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isInteger(index)) return false
  return deliverApkmodPick(ctx, binding, index)
})
