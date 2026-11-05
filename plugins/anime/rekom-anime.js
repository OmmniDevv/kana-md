import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "rekom-anime",
  alias: [],
  category: "anime",
  description: { id: "Satu rekomendasi anime pilihan dari daftar top MyAnimeList, berganti setiap hari", en: "One anime pick from the MyAnimeList top list, rotating daily" },
  usage: ".rekom-anime",
  example: ".rekom-anime",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "rekom-anime": {
      "card": "╭─❏ 🎲 「 *REKOMENDASI ANIME HARI INI* 」\n┊ *{title}*\n┊ ʀᴀɴᴋɪɴɢ ᴍᴀʟ: *#{rank}*\n┊ ꜱᴋᴏʀ: *⭐ {score}*\n┊ ᴅᴇᴛᴀɪʟ: {url}\n╰━━━━━━━",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, data *{q}* lagi kosong dari MyAnimeList~\n┊ Coba lagi nanti yaa~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "rekom-anime": {
      "card": "╭─❏ 🎲 「 *TODAY ANIME PICK* 」\n┊ *{title}*\n┊ ᴍᴀʟ ʀᴀɴᴋɪɴɢ: *#{rank}*\n┊ ꜱᴄᴏʀᴇ: *⭐ {score}*\n┊ ᴅᴇᴛᴀɪʟꜱ: {url}\n╰━━━━━━━",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, the *{q}* data from MyAnimeList is empty right now~\n┊ Try again later~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".rekom-anime", expect: /⭐|MyAnimeList/i }

export async function handler(ctx) {
  try {
    const rows = await malTopAnime(25)
    if (!rows.length) return ctx.reply(ctx.t('rekom-anime.notfound', { q: 'top anime' }))
    const seed = Math.floor(Date.now() / 86400000) + String(ctx.senderDigits || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const pick = rows[seed % rows.length]
    return ctx.reply(ctx.t('rekom-anime.card', { title: pick.title, score: pick.score ?? '-', rank: pick.rank, url: pick.url }))
  } catch (err) {
    return ctx.reply(ctx.t('rekom-anime.fail', { message: err.message }))
  }
}
