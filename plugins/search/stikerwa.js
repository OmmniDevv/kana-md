import { downloadBuffer } from '../../src/scrapers/runner.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendSticker } from '../maker/sticker.js'

// Cari paket stiker WhatsApp di GetStickerPack (getstickerpack.com,
// publik tanpa kunci) dan kirim beberapa stiker dari paket teratas.
export const config = {
  name: 'stikerwa',
  alias: ['stickerwa', 'caristiker'],
  category: 'search',
  description: { id: 'Cari paket stiker WhatsApp dan kirim stikernya', en: 'Search WhatsApp sticker packs and send their stickers' },
  usage: '.stikerwa <kata kunci>',
  example: '.stikerwa kucing',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    stikerwa: {
      needQuery: '╭─❏ 🧩 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.stikerwa kucing*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PAKET TIDAK KETEMU* 」\n┊ Mouu, nggak ada paket stiker buat kata kunci itu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL STIKER* 」\n┊ Mouu, gagal ambil stikernya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🧩 「 *PAKET STIKER* 」\n┊ ɴᴀᴍᴀ ᴘᴀᴋᴇᴛ: *{name}*\n┊ 🔗 {link}\n╰━━━━━━━',
    },
  },
  en: {
    stikerwa: {
      needQuery: '╭─❏ 🧩 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.stikerwa cat*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PACK NOT FOUND* 」\n┊ Mouu, no sticker pack for those keywords~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH STICKERS* 」\n┊ Mouu, failed to fetch the stickers: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🧩 「 *STICKER PACK* 」\n┊ ᴘᴀᴄᴋ ɴᴀᴍᴇ: *{name}*\n┊ 🔗 {link}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.stikerwa kucing', expect: /PAKET STIKER|STICKER PACK/ }

// Urai halaman pencarian menjadi daftar paket { slug, name }.
export function parsePackSearch(html, limit = 5) {
  const out = []
  const seen = new Set()
  const re = /href="\/stickers\/([a-z0-9-]+)"[^>]*>([^<]{2,60})</gi
  for (const m of String(html || '').matchAll(re)) {
    if (seen.has(m[1])) continue
    seen.add(m[1])
    out.push({ slug: m[1], name: m[2].trim() })
    if (out.length >= limit) break
  }
  return out
}

// Urai halaman paket menjadi URL gambar stiker.
export function parsePackImages(html, limit = 8) {
  const out = []
  const seen = new Set()
  const re = /https?:\/\/[^"'\s)]+\.(?:webp|png)(?:\?[^"'\s)]*)?/gi
  for (const m of String(html || '').matchAll(re)) {
    const url = m[0]
    if (!/(sticker|uploads|storage|pack)/i.test(url)) continue
    if (/(logo|icon|avatar|banner)/i.test(url)) continue
    if (seen.has(url)) continue
    seen.add(url)
    out.push(url)
    if (out.length >= limit) break
  }
  return out
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`GetStickerPack HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { fetchPage = fetchHtml } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('stikerwa.needQuery'))
  try {
    const packs = parsePackSearch(await fetchPage(`https://getstickerpack.com/stickers?search=${encodeURIComponent(q)}`))
    if (!packs.length) return ctx.reply(ctx.t('stikerwa.notFound'))
    const pack = packs[0]
    const images = parsePackImages(await fetchPage(`https://getstickerpack.com/stickers/${pack.slug}`))
    if (!images.length) return ctx.reply(ctx.t('stikerwa.notFound'))
    await ctx.reply(ctx.t('stikerwa.caption', { name: pack.name, link: `https://getstickerpack.com/stickers/${pack.slug}` }))
    let sent = 0
    for (const url of images) {
      if (sent >= 5) break
      try {
        const { buffer } = await downloadBuffer(url, { maxBytes: 8 * 1024 * 1024, timeout: 30000 })
        const webp = await toStickerWebp(buffer)
        await sendSticker(ctx, webp)
        sent += 1
      } catch {}
    }
    if (!sent) return ctx.reply(ctx.t('stikerwa.failed', { message: 'stiker gagal dikonversi' }))
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('stikerwa.failed', { message: err.message }))
  }
}
