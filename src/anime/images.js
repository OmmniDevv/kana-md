// Gambar dan reaksi anime SFW dari nekos.best (API publik tanpa kunci).
// Pengganti waifu.pics yang domainnya mati dan dibajak situs judi
// (terverifikasi 2026-11-04). Semua kategori di sini SFW.
import { downloadBuffer } from '../scrapers/runner.js'
import { toGifPlaybackMp4 } from '../services/gif-video.js'

const BASE = 'https://nekos.best/api/v2'

export async function fetchNekos(category) {
  const res = await fetch(`${BASE}/${category}`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`nekos.best membalas HTTP ${res.status}`)
  const data = await res.json()
  const item = data?.results?.[0]
  if (!item?.url) throw new Error('nekos.best tidak memberi hasil')
  return item
}

export function animeImageHandler(category, { gif = false } = {}) {
  return async function handler(ctx) {
    try {
      const item = await fetchNekos(category)
      const media = await downloadBuffer(item.url, { maxBytes: 16 * 1024 * 1024 })
      const source = item.anime_name || item.artist_name || ''
      const caption = source ? ctx.t(`${category}.caption`, { source }) : ctx.t(`${category}.captionPlain`)
      if (gif || item.url.endsWith('.gif')) {
        // Sumber nekos.best untuk kategori GIF adalah GIF asli (GIF89a);
        // pesan video WhatsApp wajib MP4, jadi konversi dulu atau GIF
        // tidak bisa diputar di HP (temuan tes live 2026-11-05).
        const mp4 = await toGifPlaybackMp4(media.buffer)
        await ctx.sock.sendMessage(ctx.chat, { video: mp4, gifPlayback: true, caption }, { quoted: ctx.raw })
        return undefined
      }
      const { sendImage } = await import('../ui/media.js')
      return sendImage(ctx, media.buffer, { caption })
    } catch (err) {
      return ctx.reply(ctx.t(`${category}.fail`, { error: err.message }))
    }
  }
}

export function reactionHandler(category) {
  return async function handler(ctx) {
    try {
      const item = await fetchNekos(category)
      const media = await downloadBuffer(item.url, { maxBytes: 16 * 1024 * 1024 })
      const target = ctx.mentionedJids?.[0]
      const caption = target
        ? ctx.t(`${category}.captionTarget`, { from: ctx.senderDigits, to: target.split('@')[0] })
        : ctx.t(`${category}.captionSelf`)
      const mp4 = await toGifPlaybackMp4(media.buffer)
      await ctx.sock.sendMessage(ctx.chat, {
        video: mp4,
        gifPlayback: true,
        caption,
        mentions: target ? [target] : [],
      }, { quoted: ctx.raw })
      return undefined
    } catch (err) {
      return ctx.reply(ctx.t(`${category}.fail`, { error: err.message }))
    }
  }
}
