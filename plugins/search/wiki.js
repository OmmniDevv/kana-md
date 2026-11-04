import { getWikiSummary } from '../../src/scrapers/search/wiki.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { buildFakeTroliQuoted, coverJpeg300, sendQuotedText } from '../../src/ui/fake-thumb.js'

export const config = {
  name: 'wiki',
  alias: ['wikipedia'],
  category: 'search',
  description: { id: 'Cari ringkasan artikel Wikipedia', en: 'Search a Wikipedia article summary' },
  usage: '.wiki <judul artikel>',
  example: '.wiki Indonesia',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    wiki: {
      needQuery: 'Ketik judul artikelnya dulu yaa, contoh: .wiki Indonesia~',
      notFound: 'Mouu, artikelnya nggak ketemu di Wikipedia. Coba judul lain ya~',
      failed: 'Mouu, pencarian Wikipedia gagal: {message}. Coba lagi nanti ya~',
      body: '*{title}*\n{description}\n\n{extract}\n\nSumber: {url}',
    },
  },
  en: {
    wiki: {
      needQuery: 'Type the article title first, example: .wiki Indonesia~',
      notFound: 'Mouu, the article was not found on Wikipedia. Try another title~',
      failed: 'Mouu, Wikipedia search failed: {message}. Try again later~',
      body: '*{title}*\n{description}\n\n{extract}\n\nSource: {url}',
    },
  },
}

export const test = { input: '.wiki Indonesia', expect: /Indonesia/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('wiki.needQuery'))
  let summary
  try {
    summary = await getWikiSummary(query)
  } catch (err) {
    return ctx.reply(ctx.t('wiki.failed', { message: err.message }))
  }
  if (!summary) return ctx.reply(ctx.t('wiki.notFound'))
  const body = ctx.t('wiki.body', {
    title: summary.title,
    description: summary.description || '',
    extract: summary.extract,
    url: summary.url || '-',
  })
  // Pola fake image (perintah user 2026-11-04): gambar artikel TIDAK dikirim
  // sebagai pesan gambar asli terpisah. Gambar dijadikan thumbnail palsu
  // pada SATU pesan teks lewat fake quoted troli, seperti pola menu.
  // Artikel tanpa gambar atau gambar gagal diunduh: kirim teks saja.
  let quoted = null
  if (summary.thumbnail) {
    try {
      const media = await downloadBuffer(summary.thumbnail, { maxBytes: MAX_IMAGE_BYTES })
      if (media.contentType.startsWith('image/')) {
        quoted = buildFakeTroliQuoted({
          itemCount: 1,
          thumbnail: coverJpeg300(media.buffer),
          message: summary.title,
          orderTitle: summary.title,
        })
      }
    } catch {
      quoted = null
    }
  }
  return sendQuotedText(ctx.sock, ctx.chat, body, { quoted })
}
