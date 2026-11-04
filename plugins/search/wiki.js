import { getWikiSummary } from '../../src/scrapers/search/wiki.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

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
      header: '{title}',
      body: '{description}\n\n{extract}\n\nSumber: {url}',
      btnGambar: 'Cari gambar',
      btnMenu: 'Menu pencarian',
    },
  },
  en: {
    wiki: {
      needQuery: 'Type the article title first, example: .wiki Indonesia~',
      notFound: 'Mouu, the article was not found on Wikipedia. Try another title~',
      failed: 'Mouu, Wikipedia search failed: {message}. Try again later~',
      header: '{title}',
      body: '{description}\n\n{extract}\n\nSource: {url}',
      btnGambar: 'Search images',
      btnMenu: 'Search menu',
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
  if (summary.thumbnail) {
    try {
      const media = await downloadBuffer(summary.thumbnail, { maxBytes: MAX_IMAGE_BYTES })
      if (media.contentType.startsWith('image/')) {
        await sendImage(ctx, media.buffer, { caption: ctx.t('wiki.header', { title: summary.title }) })
      }
    } catch {
      // gambar gagal diunduh: lanjut kirim teks saja
    }
  }
  const body = ctx.t('wiki.body', {
    description: summary.description || '',
    extract: summary.extract,
    url: summary.url || '-',
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('wiki.header', { title: summary.title }),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('wiki.btnGambar'), id: `.gambar ${summary.title}` },
      { text: ctx.t('wiki.btnMenu'), id: '.menu search' },
    ],
    textFallback: `${summary.title}\n${body}`,
  })
}
