import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "animereco",
  alias: [],
  category: "anime",
  description: { id: "Rekomendasi anime dari MyAnimeList: sebutkan genre (action, comedy, romance, dll) atau kosongkan untuk top rating", en: "Anime recommendations from MyAnimeList: name a genre (action, comedy, romance, etc) or leave empty for top rated" },
  usage: ".animereco [genre]",
  example: ".animereco comedy",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "animereco": {
      "title": "╭─❏ {emoji} 「 *REKOMENDASI ANIME: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, data *{q}* lagi kosong dari MyAnimeList~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "animereco": {
      "title": "╭─❏ {emoji} 「 *ANIME RECOMMENDATIONS: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, the *{q}* data from MyAnimeList is empty right now~\n┊ Try again later~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".animereco comedy", expect: /⭐ \d\.\d\d/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  try {
    let rows = null
    if (q) rows = await malByGenre(q, 10)
    if (!rows) rows = await malTopAnime(10)
    if (!rows.length) return ctx.reply(ctx.t('animereco.notfound', { q: q || 'top rating' }))
    const list = rows.map((r, i) => ctx.t('animereco.line', { n: i + 1, title: r.title, score: r.score ?? '-' })).join('\n')
    return ctx.reply(ctx.t('animereco.title', { emoji: '🎌', q: q || 'Top Rating', list }))
  } catch (err) {
    return ctx.reply(ctx.t('animereco.fail', { message: err.message }))
  }
}
