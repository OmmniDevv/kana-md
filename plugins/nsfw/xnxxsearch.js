// Cari dan unduh video dewasa dari xnxx.com (situs publik dewasa).
// Port perilaku RYO-YAMADA-MD plugins/nsfw/xnxx.js atas perintah owner
// 2026-11-05 (NSFW dewasa jadi fitur premium), ditulis ulang gaya KANA:
// gerbang konfirmasi 18+ sekali simpan (pola kategori nsfw), gerbang
// premium dari config, hasil pencarian disimpan per pemanggil lalu
// dipilih dengan subperintah ambil (bukan URL mentah seperti RYO).
import { sendButtons } from '../../src/ui/buttons.js'
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { searchXnxx, detailXnxx, isXnxxUrl, isMp4Buffer } from '../../src/scrapers/xnxx/xnxx.js'

export const config = {
  name: "xnxxsearch",
  alias: ["xnxxdl", "xnxx"],
  category: "nsfw",
  description: { id: "Cari dan unduh video dewasa dari xnxx.com (premium, khusus 18+, chat pribadi)", en: "Search and download adult videos from xnxx.com (premium, 18+ only, private chat)" },
  usage: ".xnxxsearch <kata kunci>",
  example: ".xnxxsearch anime",
  cooldown: 15,
  isPrivate: true,
  premium: true,
}

export const i18n = {
  id: {
    "xnxxsearch": {
      gate: "╭─❏ 🔞 「 *KONTEN DEWASA* 」\n┊ Fitur ini khusus *18 tahun ke atas*, cuma bisa di chat pribadi.\n┊ Kalau kamu memang sudah 18+, pencet tombol di bawah buat konfirmasi sekali saja yaa~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *KONFIRMASI TERSIMPAN* 」\n┊ Siap, konfirmasi 18+ kamu sudah KANA simpan~\n┊ Ketik lagi *.xnxxsearch* buat memakai fiturnya yaa~\n╰━━━━━━━",
      btnConfirm: "Saya sudah 18+",
      hint: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ Tulis kata kuncinya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.xnxxsearch kata kunci*\n╰━━━━━━━",
      results: "╭─❏ 🔞 「 *XNXX: {query}* 」\n┊ Total: *{count} video*\n┊\n{lines}\n┊\n┊ Pencet tombol nomornya buat mengunduh, atau ketik *.xnxxsearch ambil <nomor>*\n╰━━━━━━━",
      btnTake: "Unduh {n}",
      notfound: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ Tidak ada video yang cocok buat kata kunci itu~\n╰━━━━━━━",
      ambilHint: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ Cari dulu yaa, hasil terakhir kamu tidak ketemu atau nomornya di luar daftar~\n┊ ᴄᴏɴᴛᴏʜ: *.xnxxsearch ambil 1*\n╰━━━━━━━",
      downloading: "╭─❏ 🔞 「 *MENGUNDUH* 」\n┊ Sebentar, videonya lagi KANA unduh: *{title}*\n╰━━━━━━━",
      caption: "🎬 *{title}*\nSumber: xnxx.com",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "xnxxsearch": {
      gate: "╭─❏ 🔞 「 *ADULT CONTENT* 」\n┊ This feature is for *18 years and older* only, private chat only.\n┊ If you are really 18+, tap the button below to confirm once~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *CONFIRMATION SAVED* 」\n┊ Got it, your 18+ confirmation is saved~\n┊ Type *.xnxxsearch* again to use the feature~\n╰━━━━━━━",
      btnConfirm: "I am 18 or older",
      hint: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ Write a keyword please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.xnxxsearch keyword*\n╰━━━━━━━",
      results: "╭─❏ 🔞 「 *XNXX: {query}* 」\n┊ Total: *{count} videos*\n┊\n{lines}\n┊\n┊ Tap a number button to download, or type *.xnxxsearch take <number>*\n╰━━━━━━━",
      btnTake: "Download {n}",
      notfound: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ No videos match that keyword~\n╰━━━━━━━",
      ambilHint: "╭─❏ 🔞 「 *XNXXSEARCH* 」\n┊ Search first please, your last results are gone or the number is out of range~\n┊ ᴇxᴀᴍᴘʟᴇ: *.xnxxsearch take 1*\n╰━━━━━━━",
      downloading: "╭─❏ 🔞 「 *DOWNLOADING* 」\n┊ One sec, KANA is downloading the video: *{title}*\n╰━━━━━━━",
      caption: "🎬 *{title}*\nSource: xnxx.com",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed: *{message}*\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.xnxxsearch anime', expect: /KONTEN DEWASA|ADULT CONTENT|XNXX:/ }

async function downloadAndSend(ctx, pageUrl) {
  const detail = await withBreaker('xnxx', () => detailXnxx(pageUrl))
  await ctx.reply(ctx.t('xnxxsearch.downloading', { title: detail.title }))
  const candidates = [detail.videos.high, detail.videos.low, detail.videos.hls].filter(Boolean)
  let lastError = null
  for (const fileUrl of candidates) {
    if (/\.m3u8($|\?)/i.test(fileUrl)) continue
    try {
      const media = await withBreaker('xnxx', () => downloadBuffer(fileUrl, { maxBytes: MAX_VIDEO_BYTES, timeout: 180000 }))
      if (!isMp4Buffer(media.buffer)) throw new Error('Berkas unduhan bukan mp4')
      return await sendVideo(ctx, media.buffer, { caption: ctx.t('xnxxsearch.caption', { title: detail.title }) })
    } catch (err) {
      lastError = err
    }
  }
  throw lastError ?? new Error('Tidak ada berkas video yang bisa diunduh')
}

export async function handler(ctx) {
  const key = 'adult18:' + ctx.senderDigits
  const saved = await ctx.storage.get('kv', key)
  if ((ctx.args[0] || '').toLowerCase() === 'dewasa') {
    await ctx.storage.set('kv', key, { confirmedAt: Date.now() })
    return ctx.reply(ctx.t('xnxxsearch.confirmed'))
  }
  if (!saved) {
    const body = ctx.t('xnxxsearch.gate')
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('xnxxsearch.btnConfirm'), id: '.xnxxsearch dewasa' }], textFallback: body })
  }
  const sub = (ctx.args[0] || '').toLowerCase()
  try {
    if (sub === 'ambil' || sub === 'take') {
      const n = Number.parseInt(ctx.args[1] ?? '', 10)
      const last = await ctx.storage.get('kv', 'xnxx:last:' + ctx.senderDigits)
      const item = last && Array.isArray(last.results) ? last.results[n - 1] : null
      if (!item) return ctx.reply(ctx.t('xnxxsearch.ambilHint'))
      return await downloadAndSend(ctx, item.url)
    }
    const q = (ctx.text || '').trim()
    if (!q) return ctx.reply(ctx.t('xnxxsearch.hint'))
    if (/^https?:\/\/\S+$/i.test(q) && isXnxxUrl(q)) {
      return await downloadAndSend(ctx, q)
    }
    const results = await withBreaker('xnxx', () => searchXnxx(q, { limit: 10 }))
    if (!results.length) return ctx.reply(ctx.t('xnxxsearch.notfound'))
    await ctx.storage.set('kv', 'xnxx:last:' + ctx.senderDigits, { at: Date.now(), query: q, results })
    const lines = results
      .map((r, i) => `┊ *${i + 1}.* ${r.title}${r.duration || r.resolution ? `\n┊     ${[r.duration, r.resolution].filter(Boolean).join(' • ')}` : ''}`)
      .join('\n')
    const body = ctx.t('xnxxsearch.results', { query: q, count: results.length, lines })
    const replies = results.slice(0, 5).map((_, i) => ({ text: ctx.t('xnxxsearch.btnTake', { n: i + 1 }), id: `.xnxxsearch ambil ${i + 1}` }))
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  } catch (err) {
    return ctx.reply(ctx.t('xnxxsearch.fail', { message: err.message }))
  }
}
