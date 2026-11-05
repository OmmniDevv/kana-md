import { malTopAnime, malTopManga, malSeasonNow, malByGenre, malSearchCharacters, MAL_GENRES } from '../../src/scrapers/kindb/mal.js'

export const config = {
  name: "character",
  alias: [],
  category: "anime",
  description: { id: "Cari profil karakter anime di MyAnimeList", en: "Search anime character profiles on MyAnimeList" },
  usage: ".character <nama karakter>",
  example: ".character luffy",
  cooldown: 10,
}

export const i18n = {
  "id": {
    "character": {
      "hint": "╭─❏ 👤 「 *KARAKTER ANIME* 」\n┊ Tulis nama karakternya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *{ex}*\n╰━━━━━━━",
      "title": "╭─❏ {emoji} 「 *KARAKTER ANIME: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}*\n┊ {url}",
      "notfound": "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, karakter *{q}* tidak ketemu di MyAnimeList~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil datanya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━"
    }
  },
  "en": {
    "character": {
      "hint": "╭─❏ 👤 「 *ANIME CHARACTERS* 」\n┊ Write the character name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *{ex}*\n╰━━━━━━━",
      "title": "╭─❏ {emoji} 「 *ANIME CHARACTERS: {q}* 」\n{list}\n╰━━━━━━━",
      "line": "┊ {n}. *{title}*\n┊ {url}",
      "notfound": "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, character *{q}* was not found on MyAnimeList~\n╰━━━━━━━",
      "fail": "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the data: *{message}*\n┊ Try again later~\n╰━━━━━━━"
    }
  }
}

export const test = { input: ".character luffy", expect: /Luffy|myanimelist\.net\/character/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('character.hint', { ex: '.character luffy' }))
  try {
    const rows = await malSearchCharacters(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('character.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('character.line', { n: i + 1, title: r.name, url: r.url })).join('\n')
    return ctx.reply(ctx.t('character.title', { emoji: '🎌', q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('character.fail', { message: err.message }))
  }
}
