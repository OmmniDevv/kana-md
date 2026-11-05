// Cari GIF di Tenor lewat halaman pencarian publik tenor.com (scraper,
// tanpa kunci API), unduh GIF pertama yang bisa diambil, ubah ke MP4,
// lalu kirim sebagai video gifPlayback. GIF asli dalam pesan video tidak
// bisa diputar WhatsApp, jadi konversi MP4 wajib (lihat services/gif-video).
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { toGifPlaybackMp4 } from '../../src/services/gif-video.js'

export const config = {
  name: 'tenor',
  alias: ['gif', 'carigif'],
  category: 'search',
  description: { id: 'Cari GIF dari Tenor', en: 'Search GIFs from Tenor' },
  usage: '.tenor <kata kunci>',
  example: '.tenor kucing',
  cooldown: 5,
}

export const i18n = {
  id: {
    tenor: {
      hint: '╭─❏ 🎞️ 「 *TENOR GIF* 」\n┊ Tulis kata kunci GIF yang mau dicari dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.tenor kucing*\n╰━━━━━━━',
      caption: '🎞️ GIF *{q}* dari Tenor~',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, GIF untuk *{q}* tidak ketemu di Tenor~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian GIF-nya gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
    },
  },
  en: {
    tenor: {
      hint: '╭─❏ 🎞️ 「 *TENOR GIF* 」\n┊ Write the GIF keyword to search first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.tenor cat*\n╰━━━━━━━',
      caption: '🎞️ GIF *{q}* from Tenor~',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no GIF for *{q}* on Tenor~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the GIF search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tenor kucing', expect: /GIF/i }

export async function scrapeTenorGifUrls(query) {
  const slug = encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g, '-'))
  const res = await fetch(`https://tenor.com/search/${slug}-gifs`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' },
  })
  if (!res.ok) throw new Error('Tenor membalas HTTP ' + res.status)
  const html = await res.text()
  const urls = [...html.matchAll(/https:\/\/media1\.tenor\.com\/m\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+\.gif/g)].map((m) => m[0])
  return [...new Set(urls)]
}

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('tenor.hint'))
  try {
    const urls = await scrapeTenorGifUrls(q)
    if (!urls.length) return ctx.reply(ctx.t('tenor.notfound', { q }))
    let lastErr = null
    for (const url of urls.slice(0, 3)) {
      try {
        const media = await downloadBuffer(url, { maxBytes: 16 * 1024 * 1024 })
        const mp4 = await toGifPlaybackMp4(media.buffer)
        await ctx.sock.sendMessage(ctx.chat, { video: mp4, gifPlayback: true, caption: ctx.t('tenor.caption', { q }) }, { quoted: ctx.raw })
        return undefined
      } catch (err) {
        lastErr = err
      }
    }
    throw lastErr || new Error('Semua hasil Tenor gagal diunduh')
  } catch (err) {
    return ctx.reply(ctx.t('tenor.fail', { message: err.message }))
  }
}
