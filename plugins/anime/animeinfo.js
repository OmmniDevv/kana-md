import { searchAnime } from '../../src/scrapers/search/anime.js'

export const config = {
  name: 'animeinfo',
  alias: [],
  category: 'anime',
  description: { id: 'Info detail satu anime dari MyAnimeList: skor, episode, status, dan sinopsis', en: 'Detailed info on one anime from MyAnimeList: score, episodes, status, and synopsis' },
  usage: '.animeinfo <judul anime>',
  example: '.animeinfo naruto',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    animeinfo: {
      hint: '╭─❏ 🎌 「 *INFO ANIME* 」\n┊ Tulis judul animenya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.animeinfo naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, anime *{q}* tidak ketemu di MyAnimeList~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil info anime: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🎌 「 *{title}* 」\n┊ ꜱᴋᴏʀ: *⭐ {score}*\n┊ ᴇᴘɪꜱᴏᴅᴇ: *{count}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ꜱɪɴᴏᴘꜱɪꜱ: {synopsis}\n┊ ᴅᴇᴛᴀɪʟ: {url}\n╰━━━━━━━',
      unknown: 'belum diketahui',
      noSynopsis: 'Sinopsis belum tersedia.',
    },
  },
  en: {
    animeinfo: {
      hint: '╭─❏ 🎌 「 *ANIME INFO* 」\n┊ Write the anime title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.animeinfo naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, anime *{q}* was not found on MyAnimeList~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch anime info: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🎌 「 *{title}* 」\n┊ ꜱᴄᴏʀᴇ: *⭐ {score}*\n┊ ᴇᴘɪꜱᴏᴅᴇꜱ: *{count}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ꜱʏɴᴏᴘꜱɪꜱ: {synopsis}\n┊ ᴅᴇᴛᴀɪʟꜱ: {url}\n╰━━━━━━━',
      unknown: 'unknown yet',
      noSynopsis: 'Synopsis not available yet.',
    },
  },
}

export const test = { input: '.animeinfo naruto', expect: /Naruto/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('animeinfo.hint'))
  try {
    const { results } = await searchAnime(q, { type: 'anime', limit: 1 })
    const top = results?.[0]
    if (!top) return ctx.reply(ctx.t('animeinfo.notfound', { q }))
    return ctx.reply(ctx.t('animeinfo.card', {
      title: top.title,
      score: top.score ?? '-',
      count: top.count ?? ctx.t('animeinfo.unknown'),
      status: top.status || '-',
      synopsis: top.synopsis || ctx.t('animeinfo.noSynopsis'),
      url: top.url || 'https://myanimelist.net',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('animeinfo.fail', { message: err.message }))
  }
}
