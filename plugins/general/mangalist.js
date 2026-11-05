import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "mangalist",
  alias: [],
  category: "general",
  description: { id: "Daftar manga dengan skor tertinggi sepanjang masa dari MyAnimeList", en: "Highest scored manga of all time from MyAnimeList" },
  usage: ".mangalist",
  example: ".mangalist",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "mangalist": {
      "title": "╭─❏ {emoji} 「 *TOP MANGA: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, data *{q}* lagi kosong dari MyAnimeList~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "mangalist": {
      "title": "╭─❏ {emoji} 「 *TOP MANGA: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, the *{q}* data from MyAnimeList is empty right now~\n┊ Try again later~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".mangalist", expect: /Berserk|One Piece|Vagabond|Monster|JoJo/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  try {
    const rows = await malTopManga(10)
    if (!rows.length) return ctx.reply(ctx.t('mangalist.notfound', { q: q || '-' }))
    const list = rows.map((r, i) => ctx.t('mangalist.line', { n: i + 1, title: r.title, score: r.score ?? '-' })).join('\n')
    return ctx.reply(ctx.t('mangalist.title', { emoji: '🎌', q: q || 'MyAnimeList', list }))
  } catch (err) {
    return ctx.reply(ctx.t('mangalist.fail', { message: err.message }))
  }
}
