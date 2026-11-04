import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'film',
  alias: ['movie', 'carifilm'],
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
      needQuery: '╭─❏ 🎬 「 *CARI FILM* 」\n┊ Ketik judulnya dulu yaa~\n┊ Contoh: *.film breaking bad*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *JUDUL TIDAK KETEMU* 」\n┊ Mouu, judul *{query}* nggak ketemu di TVMaze~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian film gagal: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 🎬 「 *{name}* 」',
      meta: '┊ ɢᴇɴʀᴇ: *{genres}*\n┊ ʀᴀᴛɪɴɢ: *{rating}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*',
      noSummary: 'Ringkasan belum tersedia.',
      others: '┊ ʜᴀꜱɪʟ ʟᴀɪɴ: {names}',
      btnOther: '{name}',
    },
  },
  en: {
    film: {
      needQuery: '╭─❏ 🎬 「 *MOVIE SEARCH* 」\n┊ Type a title first~\n┊ Example: *.film breaking bad*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TITLE NOT FOUND* 」\n┊ Mouu, title *{query}* was not found on TVMaze~\n┊ Try another title~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SEARCH FAILED* 」\n┊ Mouu, movie search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🎬 「 *{name}* 」',
      meta: '┊ ɢᴇɴʀᴇꜱ: *{genres}*\n┊ ʀᴀᴛɪɴɢ: *{rating}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*',
      noSummary: 'No summary available yet.',
      others: '┊ ᴏᴛʜᴇʀ ʀᴇꜱᴜʟᴛꜱ: {names}',
      btnOther: '{name}',
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

export const test = { input: '.film Breaking Bad', expect: /Breaking Bad/i }

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
    `┊ ${summary}`,
  ]
  if (others.length) lines.push(ctx.t('film.others', { names: others.map((s) => s.name).join(', ') }))
  lines.push('╰━━━━━━━')
  const body = lines.join('\n')
  const replies = others.slice(0, 3).map((s) => ({
    text: ctx.t('film.btnOther', { name: String(s.name).slice(0, 20) }),
    id: `.film ${s.name}`,
  }))
  if (!replies.length) return ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
