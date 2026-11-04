import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'film',
  alias: ['movie'],
  category: 'search',
  description: { id: 'Cari info serial TV dan film dari TVMaze', en: 'Search TV show and series info from TVMaze' },
  usage: '.film <judul>',
  example: '.film breaking bad',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    film: {
      needQuery: 'Ketik judulnya dulu yaa, contoh: .film breaking bad~ 🎬',
      notFound: 'Mouu, judul "{query}" nggak ketemu di TVMaze. Coba judul lain ya~',
      failed: 'Mouu, pencarian film gagal: {message}. Coba lagi nanti ya~',
      header: '🎬 {name}',
      meta: 'Genre: {genres} | Rating: {rating} | Status: {status}',
      noSummary: 'Ringkasan belum tersedia.',
      others: 'Hasil lain: {names}',
      btnOther: '{name}',
      btnMenu: 'Menu Pencarian',
    },
  },
  en: {
    film: {
      needQuery: 'Type a title first, example: .film breaking bad~ 🎬',
      notFound: 'Mouu, title "{query}" was not found on TVMaze. Try another title~',
      failed: 'Mouu, movie search failed: {message}. Try again later~',
      header: '🎬 {name}',
      meta: 'Genres: {genres} | Rating: {rating} | Status: {status}',
      noSummary: 'No summary available yet.',
      others: 'Other results: {names}',
      btnOther: '{name}',
      btnMenu: 'Search Menu',
    },
  },
}

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('film.needQuery'))
  let results
  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
    const { buffer } = await downloadBuffer(url, { timeout: 20000 })
    results = JSON.parse(buffer.toString('utf8'))
  } catch (err) {
    return ctx.reply(ctx.t('film.failed', { message: err.message }))
  }
  if (!Array.isArray(results) || !results.length) return ctx.reply(ctx.t('film.notFound', { query }))
  const show = results[0]?.show
  if (!show) return ctx.reply(ctx.t('film.notFound', { query }))
  const summary = stripHtml(show.summary).slice(0, 900) || ctx.t('film.noSummary')
  const others = results.slice(1, 6).map((r) => r?.show).filter(Boolean)
  const lines = [
    ctx.t('film.header', { name: show.name }),
    ctx.t('film.meta', {
      genres: Array.isArray(show.genres) && show.genres.length ? show.genres.join(', ') : '-',
      rating: show.rating?.average ?? '-',
      status: show.status || '-',
    }),
    '',
    summary,
  ]
  if (others.length) lines.push('', ctx.t('film.others', { names: others.map((s) => s.name).join(', ') }))
  const body = lines.join('\n')
  const replies = others.slice(0, 3).map((s) => ({
    text: ctx.t('film.btnOther', { name: String(s.name).slice(0, 20) }),
    id: `.film ${s.name}`,
  }))
  replies.push({ text: ctx.t('film.btnMenu'), id: '.menu search' })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
