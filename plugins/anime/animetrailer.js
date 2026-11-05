import { searchSongs } from '../../src/scrapers/youtube/youtube.js'

export const config = {
  name: 'animetrailer',
  alias: [],
  category: 'anime',
  description: { id: 'Cari trailer dan PV anime di YouTube', en: 'Search anime trailers and PVs on YouTube' },
  usage: '.animetrailer <judul anime>',
  example: '.animetrailer naruto',
  cooldown: 8,
}

export const i18n = {
  id: {
    animetrailer: {
      hint: '╭─❏ 🎬 「 *TRAILER ANIME* 」\n┊ Tulis judul animenya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.animetrailer naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, trailer untuk *{q}* tidak ketemu di YouTube~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian trailer gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 🎬 「 *TRAILER: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: YouTube\n╰━━━━━━━',
      line: '┊ {n}. *{title}* ({dur})\n┊ {url}',
    },
  },
  en: {
    animetrailer: {
      hint: '╭─❏ 🎬 「 *ANIME TRAILER* 」\n┊ Write the anime title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.animetrailer naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no trailer for *{q}* found on YouTube~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, trailer search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 🎬 「 *TRAILERS: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: YouTube\n╰━━━━━━━',
      line: '┊ {n}. *{title}* ({dur})\n┊ {url}',
    },
  },
}

export const test = { input: '.animetrailer naruto', expect: /Naruto|YouTube|TRAILER/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('animetrailer.hint'))
  try {
    const query = /trailer|pv/i.test(q) ? q : q + ' anime official trailer'
    const res = await searchSongs(query, 5)
    const rows = (res?.results || []).filter((v) => v.id || v.url)
    if (!rows.length) return ctx.reply(ctx.t('animetrailer.notfound', { q }))
    const list = rows.map((v, i) => ctx.t('animetrailer.line', {
      n: i + 1,
      title: v.title || '-',
      dur: v.durationText || '-',
      url: v.url || ('https://www.youtube.com/watch?v=' + v.id),
    })).join('\n')
    return ctx.reply(ctx.t('animetrailer.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('animetrailer.fail', { message: err.message }))
  }
}
