import { searchImages } from '../../src/scrapers/search/gambar.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gambar',
  alias: ['image', 'img'],
  category: 'search',
  description: { id: 'Cari gambar di Bing dan kirim hasil pertama', en: 'Search images on Bing and send the first result' },
  usage: '.gambar <kata kunci>',
  example: '.gambar kucing lucu',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    gambar: {
      needQuery: 'Ketik kata kuncinya dulu yaa, contoh: .gambar kucing lucu~',
      notFound: 'Mouu, nggak ada gambar buat kata kunci itu. Coba kata lain ya~',
      failed: 'Mouu, pencarian gambar gagal: {message}. Coba lagi nanti ya~',
      caption: 'Gambar buat "{query}"',
      moreHeader: 'Tautan gambar lain buat "{query}":',
      item: '{n}. {url}',
      btnAgain: 'Cari lagi',
      btnPinterest: 'Cari di Pinterest',
    },
  },
  en: {
    gambar: {
      needQuery: 'Type the keywords first, example: .gambar cute cat~',
      notFound: 'Mouu, no images for those keywords. Try others~',
      failed: 'Mouu, image search failed: {message}. Try again later~',
      caption: 'Image for "{query}"',
      moreHeader: 'More image links for "{query}":',
      item: '{n}. {url}',
      btnAgain: 'Search again',
      btnPinterest: 'Search on Pinterest',
    },
  },
}

export const test = { input: '.gambar', expect: /kata kunci/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('gambar.needQuery'))
  let search
  try {
    search = await searchImages(query, { limit: 5 })
  } catch (err) {
    return ctx.reply(ctx.t('gambar.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('gambar.notFound'))
  let sent = false
  for (const url of search.results.slice(0, 3)) {
    try {
      const media = await downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES })
      if (!media.contentType.startsWith('image/')) continue
      await sendImage(ctx, media.buffer, { caption: ctx.t('gambar.caption', { query }) })
      sent = true
      break
    } catch {
      // coba gambar berikutnya
    }
  }
  const lines = []
  if (!sent) lines.push(ctx.t('gambar.caption', { query }))
  if (search.results.length > 1) {
    lines.push(ctx.t('gambar.moreHeader', { query }))
    search.results.forEach((url, i) => lines.push(ctx.t('gambar.item', { n: i + 1, url })))
  }
  const body = lines.join('\n')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('gambar.btnAgain'), id: `.gambar ${query}` },
      { text: ctx.t('gambar.btnPinterest'), id: `.pinterest ${query}` },
    ],
    textFallback: body,
  })
}
