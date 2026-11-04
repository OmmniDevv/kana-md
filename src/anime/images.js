// Gambar dan reaksi anime SFW dari nekos.best (API publik tanpa kunci).
// Pengganti waifu.pics yang domainnya mati dan dibajak situs judi
// (terverifikasi 2026-11-04). Semua kategori di sini SFW.
import { downloadBuffer } from '../scrapers/runner.js'

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
        await ctx.sock.sendMessage(ctx.chat, { video: media.buffer, gifPlayback: true, caption }, { quoted: ctx.raw })
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
      await ctx.sock.sendMessage(ctx.chat, {
        video: media.buffer,
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
