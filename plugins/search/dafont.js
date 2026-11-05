
import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'
import { fontSearch } from '../../src/scrapers/font/dafont.js'

// Dafont: cari font lewat scraper DaFont KANA (src/scrapers/font/dafont.js,
// hasilnya punya preview, author, downloads, license, downloadUrl).
// Daftar ditampilkan sebagai sesi reply-router (kind dafont); balas
// nomor untuk menerima GAMBAR PRATINJAU font itu dengan caption detail
// dan tautan unduhnya, seperti dafontAnswerHandler di Elaina.
export const config = {
  name: "dafont",
  alias: ["daffont", "carifont"],
  category: "search",
  description: { id: "Cari font di DaFont, balas nomor untuk gambar pratinjaunya", en: "Search fonts on DaFont, reply with a number for its preview image" },
  usage: ".dafont <nama font>",
  example: ".dafont horror",
  cooldown: 5,
}

export const i18n = {
  id: {
    "dafont": {
      hint: "╭─❏ 🔤 「 *DAFONT* 」\n┊ Tulis nama fontnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.dafont horror*\n╰━━━━━━━",
      list: "╭─❏ 🔤 「 *HASIL FONT: {q}* 」\n┊ {rows}\n┊\n┊ Balas (reply) pesan ini dengan nomornya buat lihat pratinjaunya yaa~\n╰━━━━━━━",
      row: "┊ {n}. *{title}* oleh {author} (unduhan {downloads})",
      detail: "╭─❏ 🔤 「 *{title}* 」\n┊ ᴀᴜᴛʜᴏʀ: *{author}*\n┊ ᴜɴᴅᴜʜᴀɴ: *{downloads}*\n┊ ʟɪꜱᴇɴꜱɪ: *{license}*\n┊ ʜᴀʟᴀᴍᴀɴ: {url}\n┊ ᴜɴᴅᴜʜ ꜰɪʟᴇ: {download}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, font untuk *{q}* tidak ketemu~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      badNumber: "╭─❏ 🔤 「 *NOMOR TIDAK VALID* 」\n┊ Pilih nomor 1 sampai {count} yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "dafont": {
      hint: "╭─❏ 🔤 「 *DAFONT* 」\n┊ Write the font name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.dafont horror*\n╰━━━━━━━",
      list: "╭─❏ 🔤 「 *FONT RESULTS: {q}* 」\n┊ {rows}\n┊\n┊ Reply to this message with the number to see its preview~\n╰━━━━━━━",
      row: "┊ {n}. *{title}* by {author} ({downloads} downloads)",
      detail: "╭─❏ 🔤 「 *{title}* 」\n┊ ᴀᴜᴛʜᴏʀ: *{author}*\n┊ ᴅᴏᴡɴʟᴏᴀᴅꜱ: *{downloads}*\n┊ ʟɪᴄᴇɴꜱᴇ: *{license}*\n┊ ᴘᴀɢᴇ: {url}\n┊ ꜰɪʟᴇ ᴅᴏᴡɴʟᴏᴀᴅ: {download}\n╰━━━━━━━",
      notfound: "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no font for *{q}*~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      badNumber: "╭─❏ 🔤 「 *INVALID NUMBER* 」\n┊ Pick a number from 1 to {count}~\n╰━━━━━━━",
    },
  },
}

export const dafontDeps = { search: fontSearch }
export const DAFONT_KIND = 'dafont'

export function formatDafontDetail(t, f) {
  return t('dafont.detail', {
    title: f.title, author: f.author || '-', downloads: f.downloads ?? '-', license: f.license || '-',
    url: f.url || '-', download: f.downloadUrl || '-',
  })
}

export async function deliverDafontPick(ctx, binding, index) {
  const fonts = binding?.data?.fonts ?? []
  if (!fonts.length) return false
  if (!Number.isInteger(index) || index < 1 || index > fonts.length) {
    await ctx.reply(ctx.t('dafont.badNumber', { count: fonts.length }))
    return true
  }
  const f = fonts[index - 1]
  await clearReply(ctx.storage, ctx.chat)
  const caption = formatDafontDetail(ctx.t, f)
  if (f.preview) {
    await ctx.sock.sendMessage(ctx.chat, { image: { url: f.preview }, caption }, { quoted: ctx.raw })
  } else {
    await ctx.reply(caption)
  }
  return true
}

export const test = { input: '.dafont horror', expect: /hasil font|font results/i }
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('dafont.hint'))
  let result
  try {
    result = await dafontDeps.search(q)
  } catch (err) {
    return ctx.reply(ctx.t('dafont.fail', { message: err.message }))
  }
  const fonts = (result?.results ?? []).slice(0, 10)
  if (!fonts.length) return ctx.reply(ctx.t('dafont.notfound', { q }))
  const rows = fonts.map((f, i) => ctx.t('dafont.row', { n: i + 1, title: f.title, author: f.author || '-', downloads: f.downloads ?? '-' })).join('\n')
  const body = ctx.t('dafont.list', { q, rows })
  const sent = await ctx.sock.sendMessage(ctx.chat, { text: body }, { quoted: ctx.raw })
  const messageId = sent?.key?.id
  if (messageId) {
    await bindReply(ctx.storage, ctx.chat, {
      kind: DAFONT_KIND,
      messageId,
      ownerDigits: ctx.senderDigits,
      data: { query: q, fonts },
    })
  }
  return sent
}

registerReplyKind(DAFONT_KIND, async (ctx, binding) => {
  const index = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isInteger(index)) return false
  return deliverDafontPick(ctx, binding, index)
})
