import { searchAnime } from '../../src/scrapers/search/anime.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'anime',
  alias: ['animeinfo'],
  category: 'search',
  description: { id: 'Cari info anime atau manga (awali manga: untuk manga)', en: 'Search anime or manga info (prefix manga: for manga)' },
  usage: '.anime <judul> atau .anime manga: <judul>',
  example: '.anime naruto',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    anime: {
      needQuery: 'Ketik judulnya dulu yaa, contoh: .anime naruto atau .anime manga: one piece~',
      notFound: 'Mouu, judul itu nggak ketemu di MyAnimeList. Coba judul lain ya~',
      failed: 'Mouu, pencarian anime gagal: {message}. Sumber Jikan kadang sibuk, coba lagi nanti ya~',
      title: '{title}',
      score: 'Skor: {score}',
      countAnime: 'Episode: {count}',
      countManga: 'Bab: {count}',
      status: 'Status: {status}',
      synopsis: 'Sinopsis: {synopsis}',
      url: 'Detail: {url}',
      unknown: 'belum diketahui',
      otherHeader: 'Hasil lain:',
      otherItem: '{n}. {title}',
    },
  },
  en: {
    anime: {
      needQuery: 'Type the title first, example: .anime naruto or .anime manga: one piece~',
      notFound: 'Mouu, that title was not found on MyAnimeList. Try another title~',
      failed: 'Mouu, anime search failed: {message}. The Jikan source is busy sometimes, try again later~',
      title: '{title}',
      score: 'Score: {score}',
      countAnime: 'Episodes: {count}',
      countManga: 'Chapters: {count}',
      status: 'Status: {status}',
      synopsis: 'Synopsis: {synopsis}',
      url: 'Details: {url}',
      unknown: 'unknown yet',
      otherHeader: 'Other results:',
      otherItem: '{n}. {title}',
    },
  },
}

export const test = { input: '.anime Naruto', expect: /Naruto/i }

export async function handler(ctx) {
  const raw = ctx.text.trim()
  if (!raw) return ctx.reply(ctx.t('anime.needQuery'))
  const mangaMatch = raw.match(/^manga:\s*(.+)$/i)
  const type = mangaMatch ? 'manga' : 'anime'
  const query = mangaMatch ? mangaMatch[1].trim() : raw
  let search
  try {
    search = await searchAnime(query, { type, limit: 5 })
  } catch (err) {
    return ctx.reply(ctx.t('anime.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('anime.notFound'))
  const first = search.results[0]
  if (first.image) {
    try {
      const media = await downloadBuffer(first.image, { maxBytes: MAX_IMAGE_BYTES })
      if (media.contentType.startsWith('image/')) await sendImage(ctx, media.buffer, {})
    } catch {
      // poster gagal diunduh: lanjut teks saja
    }
  }
  const lines = [
    ctx.t('anime.title', { title: first.title }),
    ctx.t('anime.score', { score: first.score ?? ctx.t('anime.unknown') }),
    ctx.t(type === 'manga' ? 'anime.countManga' : 'anime.countAnime', { count: first.count ?? ctx.t('anime.unknown') }),
    ctx.t('anime.status', { status: first.status || ctx.t('anime.unknown') }),
  ]
  if (first.synopsis) lines.push(ctx.t('anime.synopsis', { synopsis: first.synopsis }))
  lines.push(ctx.t('anime.url', { url: first.url || '-' }))
  const others = search.results.slice(1, 5)
  if (others.length) {
    lines.push(ctx.t('anime.otherHeader'))
    others.forEach((entry, i) => lines.push(ctx.t('anime.otherItem', { n: i + 2, title: entry.title })))
  }
  const body = lines.join('\n')
  const replies = others.slice(0, 4).map((entry) => ({
    text: entry.title.slice(0, 20),
    id: `.anime ${type === 'manga' ? 'manga: ' : ''}${entry.title}`.slice(0, 120),
  }))
  if (replies.length) {
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  } else {
    await ctx.reply(body)
  }
}
