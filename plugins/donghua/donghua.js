import { searchAnime } from '../../src/scrapers/search/anime.js'

export const config = {
  name: 'donghua',
  alias: [],
  category: 'donghua',
  description: { id: 'Cari donghua (animasi Tiongkok) di MyAnimeList: skor, episode, status, dan sinopsis. Situs Anichin tidak terjangkau dari server, jadi datanya dari MyAnimeList', en: 'Search donghua (Chinese animation) on MyAnimeList: score, episodes, status, and synopsis. The Anichin site is unreachable from the server, so data comes from MyAnimeList' },
  usage: '.donghua <judul donghua>',
  example: '.donghua link click',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    donghua: {
      hint: '╭─❏ 🐉 「 *CARI DONGHUA* 」\n┊ Tulis judul donghuanya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.donghua link click*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, donghua *{q}* tidak ketemu di MyAnimeList~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian donghua gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🐉 「 *{title}* 」\n┊ ꜱᴋᴏʀ: *⭐ {score}*\n┊ ᴇᴘɪꜱᴏᴅᴇ: *{count}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ꜱɪɴᴏᴘꜱɪꜱ: {synopsis}\n┊ ᴅᴇᴛᴀɪʟ: {url}\n╰━━━━━━━',
      unknown: 'belum diketahui',
      noSynopsis: 'Sinopsis belum tersedia.',
    },
  },
  en: {
    donghua: {
      hint: '╭─❏ 🐉 「 *DONGHUA SEARCH* 」\n┊ Write the donghua title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.donghua link click*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, donghua *{q}* was not found on MyAnimeList~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, donghua search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🐉 「 *{title}* 」\n┊ ꜱᴄᴏʀᴇ: *⭐ {score}*\n┊ ᴇᴘɪꜱᴏᴅᴇꜱ: *{count}*\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n┊ ꜱʏɴᴏᴘꜱɪꜱ: {synopsis}\n┊ ᴅᴇᴛᴀɪʟꜱ: {url}\n╰━━━━━━━',
      unknown: 'unknown yet',
      noSynopsis: 'Synopsis not available yet.',
    },
  },
}

export const test = { input: '.donghua link click', expect: /Link Click|Shiguang|MyAnimeList/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('donghua.hint'))
  try {
    const { results } = await searchAnime(q, { type: 'anime', limit: 1 })
    const top = results?.[0]
    if (!top) return ctx.reply(ctx.t('donghua.notfound', { q }))
    return ctx.reply(ctx.t('donghua.card', {
      title: top.title,
      score: top.score ?? '-',
      count: top.count ?? ctx.t('donghua.unknown'),
      status: top.status || '-',
      synopsis: top.synopsis || ctx.t('donghua.noSynopsis'),
      url: top.url || 'https://myanimelist.net',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('donghua.fail', { message: err.message }))
  }
}
