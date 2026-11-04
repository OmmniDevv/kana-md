import { komikSearch } from '../../src/scrapers/komik/komikcast.js'
import { sendButtons } from '../../src/ui/buttons.js'

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
      btnAgain: 'Cari lagi',
      btnMenu: 'Menu pencarian',
      followUp: 'Lanjutan: .komik {query} • .menu search',
    },
  },
  en: {
    komik: {
      needQuery: 'Type the comic title first, example: .komik solo leveling~',
      notFound: 'Mouu, the comic was not found. Try another title~',
      failed: 'Mouu, comic search failed: {message}. The source acts up sometimes, try again later~',
      header: 'Comic results for "{query}":',
      item: '{n}. {title}\n{url}',
      btnAgain: 'Search again',
      btnMenu: 'Search menu',
      followUp: 'Next: .komik {query} • .menu search',
    },
  },
}

export const test = { input: '.komik Solo Leveling', expect: /Hasil komik/i }

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
  // Plugin ini tidak punya mode baca/detail per judul, jadi tombolnya cukup
  // cari ulang + menu pencarian.
  lines.push(ctx.t('komik.followUp', { query }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('komik.btnAgain'), id: `.komik ${query}` },
      { text: ctx.t('komik.btnMenu'), id: '.menu search' },
    ],
    textFallback: body,
  })
}
