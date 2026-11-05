// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent, membalas "CEK PINSEARCH 76%" tanpa pencarian apa
// pun. Sekarang pencarian Pinterest NYATA memakai scraper repo
// (src/scrapers/pinterest/pinterest.js, sesi id.pinterest.com) yang
// terverifikasi dari VM dengan kata kunci asli: hasil pin asli kembali
// dan gambarnya terunduh valid. Gambar teratas dikirim sebagai gambar,
// lengkap dengan tautan halaman pin aslinya.
import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'pinsearch',
  alias: ['searchpin'],
  category: 'fun',
  description: { id: 'Cari gambar di Pinterest dan kirim hasil teratas beserta tautan pin aslinya', en: 'Search Pinterest images and send the top results with their original pin links' },
  usage: '.pinsearch <kata kunci>',
  example: '.pinsearch kucing',
  cooldown: 10,
}

export const i18n = {
  id: {
    pinsearch: {
      needQuery: '╭─❏ 📌 「 *PINSEARCH* 」\n┊ Ketik kata kuncinya yaa, contoh: *.pinsearch kucing*\n╰━━━━━━━',
      notFound: '╭─❏ 📌 「 *PINSEARCH* 」\n┊ Tidak ada pin buat kata kunci *{q}*~\n╰━━━━━━━',
      failed: '╭─❏ 📌 「 *PINSEARCH GAGAL* 」\n┊ Pencarian Pinterest gagal: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINSEARCH: {q}* 」\n┊ {sent} gambar dari {total} hasil\n┊ Pin asli:\n┊ {links}\n╰━━━━━━━',
    },
  },
  en: {
    pinsearch: {
      needQuery: '╭─❏ 📌 「 *PINSEARCH* 」\n┊ Type the keywords please, example: *.pinsearch cat*\n╰━━━━━━━',
      notFound: '╭─❏ 📌 「 *PINSEARCH* 」\n┊ No pins for the keywords *{q}*~\n╰━━━━━━━',
      failed: '╭─❏ 📌 「 *PINSEARCH FAILED* 」\n┊ Pinterest search failed: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 📌 「 *PINSEARCH: {q}* 」\n┊ {sent} images from {total} results\n┊ Original pins:\n┊ {links}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pinsearch kucing', expect: /PINSEARCH/i }

const MAX_SEND = 3

export async function handler(ctx, { search = pinterestSearch, download = downloadBuffer } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('pinsearch.needQuery'))
  let result
  try {
    result = await search(q, { limit: 10 })
  } catch (err) {
    return ctx.reply(ctx.t('pinsearch.failed', { message: err.message }))
  }
  const pins = (result?.results ?? []).filter((p) => p.image)
  if (!pins.length) return ctx.reply(ctx.t('pinsearch.notFound', { q }))
  const picked = pins.slice(0, MAX_SEND)
  const buffers = []
  for (const pin of picked) {
    try {
      const { buffer } = await download(pin.image, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 })
      buffers.push(buffer)
    } catch {}
  }
  if (!buffers.length) return ctx.reply(ctx.t('pinsearch.failed', { message: 'semua gambar gagal diunduh' }))
  const links = picked.slice(0, buffers.length).map((p) => p.url).join('\n┊ ')
  for (let i = 0; i < buffers.length; i += 1) {
    const caption = i === 0 ? ctx.t('pinsearch.caption', { q, sent: buffers.length, total: pins.length, links }) : undefined
    await sendImage(ctx, buffers[i], { caption })
  }
  return undefined
}
