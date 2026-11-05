import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "animelatest",
  alias: [],
  category: "anime",
  description: { id: "Anime terbaru yang sedang tayang musim ini dari MyAnimeList, lengkap dengan genre dan skor", en: "Latest anime airing this season from MyAnimeList, with genres and scores" },
  usage: ".animelatest",
  example: ".animelatest",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "animelatest": {
      "title": "╭─❏ {emoji} 「 *ANIME MUSIM INI: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score} {genres}",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, data *{q}* lagi kosong dari MyAnimeList~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "animelatest": {
      "title": "╭─❏ {emoji} 「 *THIS SEASON ANIME: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score} {genres}",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, the *{q}* data from MyAnimeList is empty right now~\n┊ Try again later~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".animelatest", expect: /⭐ \d\.\d\d/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  try {
    const rows = await malSeasonNow(10)
    if (!rows.length) return ctx.reply(ctx.t('animelatest.notfound', { q: q || '-' }))
    const list = rows.map((r, i) => ctx.t('animelatest.line', { n: i + 1, title: r.title, score: r.score ?? '-', genres: r.genres && r.genres.length ? '[' + r.genres.join(', ') + ']' : '' })).join('\n')
    return ctx.reply(ctx.t('animelatest.title', { emoji: '🎌', q: q || 'MyAnimeList', list }))
  } catch (err) {
    return ctx.reply(ctx.t('animelatest.fail', { message: err.message }))
  }
}
