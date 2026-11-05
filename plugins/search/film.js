
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'

// Film: cari serial/film di TVMaze, tampilkan daftar bernomor sebagai
// sesi reply-router (kind film). Balas nomor untuk detail judul itu.
// TVMaze tidak menyediakan tautan unduh, jadi detail yang dikirim adalah
// ringkasan, genre, rating, status, jaringan, dan tautan situs resmi
// bila ada, apa adanya dari sumbernya.
export const config = {
  name: 'film',
  alias: ['carifilm'],
  category: 'search',
  description: { id: 'Cari info serial TV dan film dari TVMaze, balas nomor untuk detailnya', en: 'Search TV show and series info from TVMaze, reply with a number for details' },
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
      list: '╭─❏ 🎬 「 *HASIL FILM: {query}* 」\n┊ {rows}\n┊\n┊ Balas (reply) pesan ini dengan nomornya buat lihat detailnya yaa~\n╰━━━━━━━',
      row: '┊ {n}. *{name}* ({year}) ⭐ {rating}',
      detail: '╭─❏ 🎬 「 *{name}* 」\n┊ ɢᴇɴʀᴇ: *{genres}*\n┊ ʀᴀᴛɪɴɢ: *{rating}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ᴊᴀʀɪɴɢᴀɴ: *{network}*\n┊ {summary}\n┊ ꜱɪᴛᴜꜱ ʀᴇꜱᴍɪ: {site}\n╰━━━━━━━',
      noSummary: 'Ringkasan belum tersedia.',
      badNumber: '╭─❏ 🎬 「 *NOMOR TIDAK VALID* 」\n┊ Pilih nomor 1 sampai {count} yaa~\n╰━━━━━━━',
    },
  },
  en: {
    film: {
      needQuery: '╭─❏ 🎬 「 *MOVIE SEARCH* 」\n┊ Type a title first~\n┊ Example: *.film breaking bad*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TITLE NOT FOUND* 」\n┊ Mouu, title *{query}* was not found on TVMaze~\n┊ Try another title~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SEARCH FAILED* 」\n┊ Mouu, movie search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      list: '╭─❏ 🎬 「 *MOVIE RESULTS: {query}* 」\n┊ {rows}\n┊\n┊ Reply to this message with the number to see its details~\n╰━━━━━━━',
      row: '┊ {n}. *{name}* ({year}) ⭐ {rating}',
      detail: '╭─❏ 🎬 「 *{name}* 」\n┊ ɢᴇɴʀᴇꜱ: *{genres}*\n┊ ʀᴀᴛɪɴɢ: *{rating}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ɴᴇᴛᴡᴏʀᴋ: *{network}*\n┊ {summary}\n┊ ᴏꜰꜰɪᴄɪᴀʟ ꜱɪᴛᴇ: {site}\n╰━━━━━━━',
      noSummary: 'No summary available yet.',
      badNumber: '╭─❏ 🎬 「 *INVALID NUMBER* 」\n┊ Pick a number from 1 to {count}~\n╰━━━━━━━',
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

// Bentuk mentah TVMaze jadi daftar bersih yang aman disimpan di sesi.
export function normalizeFilmResults(results, limit = 10) {
  return (Array.isArray(results) ? results : [])
    .map((r) => r?.show)
    .filter(Boolean)
    .slice(0, limit)
    .map((show) => ({
      name: show.name || '-',
      genres: Array.isArray(show.genres) ? show.genres : [],
      rating: show.rating?.average ?? '-',
      status: show.status || '-',
      network: show.network?.name || show.webChannel?.name || '-',
      premiered: show.premiered || '',
      summary: stripHtml(show.summary),
      officialSite: show.officialSite || '',
      url: show.url || '',
    }))
}

async function searchFilmTvMaze(query) {
  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
  const { buffer } = await downloadBuffer(url, { timeout: 20000 })
  return normalizeFilmResults(JSON.parse(buffer.toString('utf8')))
}

export const filmDeps = { search: searchFilmTvMaze }
export const FILM_KIND = 'film'

export function formatFilmDetail(t, show) {
  return t('film.detail', {
    name: show.name,
    genres: show.genres?.length ? show.genres.join(', ') : '-',
    rating: show.rating ?? '-',
    status: show.status || '-',
    network: show.network || '-',
    summary: (show.summary || '').slice(0, 900) || t('film.noSummary'),
    site: show.officialSite || show.url || '-',
  })
}

export async function deliverFilmPick(ctx, binding, index) {
  const films = binding?.data?.films ?? []
  if (!films.length) return false
  if (!Number.isInteger(index) || index < 1 || index > films.length) {
    await ctx.reply(ctx.t('film.badNumber', { count: films.length }))
    return true
  }
  await clearReply(ctx.storage, ctx.chat)
  await ctx.reply(formatFilmDetail(ctx.t, films[index - 1]))
  return true
}

export const test = { input: '.film Breaking Bad', expect: /hasil film|movie results/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('film.needQuery'))
  let films
  try {
    films = await filmDeps.search(query)
  } catch (err) {
    return ctx.reply(ctx.t('film.failed', { message: err.message }))
  }
  if (!films?.length) return ctx.reply(ctx.t('film.notFound', { query }))
  const rows = films.map((s, i) => ctx.t('film.row', { n: i + 1, name: s.name, year: (s.premiered || '').slice(0, 4) || '-', rating: s.rating ?? '-' })).join('\n')
  const body = ctx.t('film.list', { query, rows })
  const sent = await ctx.sock.sendMessage(ctx.chat, { text: body }, { quoted: ctx.raw })
  const messageId = sent?.key?.id
  if (messageId) {
    await bindReply(ctx.storage, ctx.chat, {
      kind: FILM_KIND,
      messageId,
      ownerDigits: ctx.senderDigits,
      data: { query, films },
    })
  }
  return sent
}

registerReplyKind(FILM_KIND, async (ctx, binding) => {
  const index = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isInteger(index)) return false
  return deliverFilmPick(ctx, binding, index)
})
