import { searchAnime } from '../../src/scrapers/search/anime.js'

export const config = {
  name: 'animelink',
  alias: [],
  category: 'anime',
  description: { id: 'Tautan nonton dan detail anime: halaman MyAnimeList plus tautan pencarian di platform resmi', en: 'Watch and detail links for an anime: its MyAnimeList page plus search links on official platforms' },
  usage: '.animelink <judul anime>',
  example: '.animelink naruto',
  cooldown: 8,
}

export const i18n = {
  id: {
    animelink: {
      hint: '╭─❏ 🔗 「 *TAUTAN ANIME* 」\n┊ Tulis judul animenya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.animelink naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, anime *{q}* tidak ketemu di MyAnimeList~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil tautan anime: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🔗 「 *TAUTAN: {title}* 」\n┊ ᴅᴇᴛᴀɪʟ ᴍʏᴀɴɪᴍᴇʟɪꜱᴛ: {mal}\n┊ ɴᴏɴᴛᴏɴ ᴅɪ ᴄʀᴜɴᴄʜʏʀᴏʟʟ: {crunchy}\n┊ ᴛʀᴀɪʟᴇʀ ᴅɪ ʏᴏᴜᴛᴜʙᴇ: {yt}\n┊ ᴋᴇᴛᴇʀꜱᴇᴅɪᴀᴀɴ ᴛɪᴀᴘ ᴘʟᴀᴛꜰᴏʀᴍ ʙᴇʀɢᴀɴᴛᴜɴɢ ᴡɪʟᴀʏᴀʜ ʏᴀᴀ~\n╰━━━━━━━',
    },
  },
  en: {
    animelink: {
      hint: '╭─❏ 🔗 「 *ANIME LINKS* 」\n┊ Write the anime title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.animelink naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, anime *{q}* was not found on MyAnimeList~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch anime links: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🔗 「 *LINKS: {title}* 」\n┊ ᴍʏᴀɴɪᴍᴇʟɪꜱᴛ ᴅᴇᴛᴀɪʟꜱ: {mal}\n┊ ᴡᴀᴛᴄʜ ᴏɴ ᴄʀᴜɴᴄʜʏʀᴏʟʟ: {crunchy}\n┊ ᴛʀᴀɪʟᴇʀꜱ ᴏɴ ʏᴏᴜᴛᴜʙᴇ: {yt}\n┊ ᴘʟᴀᴛꜰᴏʀᴍ ᴀᴠᴀɪʟᴀʙɪʟɪᴛʏ ᴅᴇᴘᴇɴᴅꜱ ᴏɴ ʏᴏᴜʀ ʀᴇɢɪᴏɴ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.animelink naruto', expect: /Naruto|myanimelist/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('animelink.hint'))
  try {
    const { results } = await searchAnime(q, { type: 'anime', limit: 1 })
    const top = results?.[0]
    if (!top) return ctx.reply(ctx.t('animelink.notfound', { q }))
    const enc = encodeURIComponent(top.title)
    return ctx.reply(ctx.t('animelink.card', {
      title: top.title,
      mal: top.url || 'https://myanimelist.net',
      crunchy: 'https://www.crunchyroll.com/search?q=' + enc,
      yt: 'https://www.youtube.com/results?search_query=' + enc + '+trailer',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('animelink.fail', { message: err.message }))
  }
}
