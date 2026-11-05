import { komikSearch } from '../../src/scrapers/komik/komikcast.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'komik',
  alias: ['komikcast', 'carikomik'],
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
      needQuery: '╭─❏ 📚 「 *CARI KOMIK* 」\n┊ Ketik judul komiknya dulu yaa~\n┊ Contoh: *.komik solo leveling*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *KOMIK TIDAK KETEMU* 」\n┊ Mouu, komiknya nggak ketemu~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian komik gagal: *{message}*\n┊ Sumbernya kadang ngambek, coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 📚 「 *HASIL KOMIK: {query}* 」',
      item: '┊ {n}. *{title}*\n┊ {url}',
      btnAgain: 'Cari lagi',
      followUp: '╰━━━━━━━',
    },
  },
  en: {
    komik: {
      needQuery: '╭─❏ 📚 「 *COMIC SEARCH* 」\n┊ Type the comic title first~\n┊ Example: *.komik solo leveling*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *COMIC NOT FOUND* 」\n┊ Mouu, the comic was not found~\n┊ Try another title~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SEARCH FAILED* 」\n┊ Mouu, comic search failed: *{message}*\n┊ The source acts up sometimes, try again later~\n╰━━━━━━━',
      header: '╭─❏ 📚 「 *COMIC RESULTS: {query}* 」',
      item: '┊ {n}. *{title}*\n┊ {url}',
      btnAgain: 'Search again',
      followUp: '╰━━━━━━━',
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
    ],
    textFallback: body,
  })
}
