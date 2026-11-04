import { searchSongs } from '../../src/scrapers/youtube/youtube.js'

export const config = {
  name: 'yts',
  alias: ['ytsearch'],
  category: 'download',
  description: { id: 'Cari video di YouTube, tampilkan daftar hasil', en: 'Search YouTube videos, show result list' },
  usage: '.yts <kata kunci>',
  example: '.yts tutorial gitar akustik',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    yts: {
      needQuery: 'Ketik kata kuncinya dulu yaa, contoh: .yts tutorial gitar akustik~',
      notFound: 'Mouu, nggak ada hasil buat kata kunci itu. Coba kata lain ya~',
      failed: 'Mouu, pencarian gagal: {message}. Coba lagi nanti ya~',
      header: 'Hasil pencarian YouTube buat "{query}":',
      item: '{n}. {title} ({duration})\n{url}',
    },
  },
  en: {
    yts: {
      needQuery: 'Type the keywords first, example: .yts acoustic guitar tutorial~',
      notFound: 'Mouu, no results for those keywords. Try others~',
      failed: 'Mouu, search failed: {message}. Try again later~',
      header: 'YouTube search results for "{query}":',
      item: '{n}. {title} ({duration})\n{url}',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('yts.needQuery'))
  let search
  try {
    search = await searchSongs(query, 5)
  } catch (err) {
    return ctx.reply(ctx.t('yts.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('yts.notFound'))
  const lines = [ctx.t('yts.header', { query })]
  search.results.forEach((video, i) => {
    lines.push(ctx.t('yts.item', { n: i + 1, title: video.title || '-', duration: video.durationText || '-', url: video.url || '-' }))
  })
  await ctx.reply(lines.join('\n'))
}
