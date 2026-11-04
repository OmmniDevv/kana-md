import { komikSearch } from '../../src/scrapers/komik/komikcast.js'

export const config = {
  name: 'komik',
  alias: ['manga', 'komikcast'],
  category: 'search',
  description: { id: 'Cari komik di Komikcast', en: 'Search comics on Komikcast' },
  usage: '.komik <judul komik>',
  example: '.komik solo leveling',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    komik: {
      needQuery: 'Ketik judul komiknya dulu yaa, contoh: .komik solo leveling~',
      notFound: 'Mouu, komiknya nggak ketemu. Coba judul lain ya~',
      failed: 'Mouu, pencarian komik gagal: {message}. Sumbernya kadang ngambek, coba lagi nanti ya~',
      header: 'Hasil komik buat "{query}":',
      item: '{n}. {title}\n{url}',
    },
  },
  en: {
    komik: {
      needQuery: 'Type the comic title first, example: .komik solo leveling~',
      notFound: 'Mouu, the comic was not found. Try another title~',
      failed: 'Mouu, comic search failed: {message}. The source acts up sometimes, try again later~',
      header: 'Comic results for "{query}":',
      item: '{n}. {title}\n{url}',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('komik.needQuery'))
  let search
  try {
    search = await komikSearch(query)
  } catch (err) {
    return ctx.reply(ctx.t('komik.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('komik.notFound'))
  const lines = [ctx.t('komik.header', { query })]
  search.results.slice(0, 8).forEach((comic, i) => {
    lines.push(ctx.t('komik.item', { n: i + 1, title: comic.title, url: comic.url }))
  })
  await ctx.reply(lines.join('\n'))
}
