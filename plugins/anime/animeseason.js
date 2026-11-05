import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "animeseason",
  alias: [],
  category: "anime",
  description: { id: "Info lengkap anime musim ini dari MyAnimeList: jumlah judul, rata-rata skor, dan daftar teratas", en: "Complete info on this season anime from MyAnimeList: title count, average score, and top list" },
  usage: ".animeseason",
  example: ".animeseason",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "animeseason": {
      "title": "╭─❏ {emoji} 「 *ANIME MUSIM INI: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "stats": "┊ ᴛᴏᴛᴀʟ: *{count}* ᴀɴɪᴍᴇ ┊ ʀᴀᴛᴀ-ʀᴀᴛᴀ ꜱᴋᴏʀ: *{avg}*",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, data *{q}* lagi kosong dari MyAnimeList~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "animeseason": {
      "title": "╭─❏ {emoji} 「 *THIS SEASON ANIME: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}* ⭐ {score}",
      "stats": "┊ ᴛᴏᴛᴀʟ: *{count}* ᴀɴɪᴍᴇ ┊ ᴀᴠᴇʀᴀɢᴇ ꜱᴄᴏʀᴇ: *{avg}*",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, the *{q}* data from MyAnimeList is empty right now~\n┊ Try again later~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".animeseason", expect: /⭐ \d\.\d\d/ }

export async function handler(ctx) {
  try {
    const rows = await malSeasonNow(15)
    if (!rows.length) return ctx.reply(ctx.t('animeseason.notfound', { q: 'musim ini' }))
    const scored = rows.filter((r) => typeof r.score === 'number')
    const avg = scored.length ? (scored.reduce((a, r) => a + r.score, 0) / scored.length).toFixed(2) : '-'
    const list = rows.map((r, i) => ctx.t('animeseason.line', { n: i + 1, title: r.title, score: r.score ?? '-' })).join('\n')
    const stats = ctx.t('animeseason.stats', { count: rows.length, avg })
    return ctx.reply(ctx.t('animeseason.title', { emoji: '🎌', q: 'MyAnimeList', list: stats + '\n' + list }))
  } catch (err) {
    return ctx.reply(ctx.t('animeseason.fail', { message: err.message }))
  }
}
