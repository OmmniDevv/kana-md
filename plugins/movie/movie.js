import { omdbSearch, omdbDetail } from '../../src/scrapers/kindb/omdb.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'movie',
  alias: ['imdb', 'filmget', 'movieku'],
  category: 'movie',
  description: { id: 'Cari detail film dan serial dari OMDb/IMDb: rating, genre, durasi, sutradara, pemain, dan plot', en: 'Search movie and series details from OMDb/IMDb: rating, genre, runtime, director, cast, and plot' },
  usage: '.movie <judul film>',
  example: '.movie inception',
  cooldown: 8,
}

export const i18n = {
  id: {
    movie: {
      hint: '╭─❏ 🎬 「 *CARI FILM* 」\n┊ Tulis judul filmnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.movie inception*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, film *{q}* tidak ketemu di OMDb~\n┊ Coba judul bahasa Inggrisnya yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian film gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🎬 「 *{title} ({year})* 」\n┊ ʀᴀᴛɪɴɢ ɪᴍᴅʙ: *⭐ {rating}*\n┊ ɢᴇɴʀᴇ: *{genre}*\n┊ ᴅᴜʀᴀꜱɪ: *{runtime}*\n┊ ꜱᴜᴛʀᴀᴅᴀʀᴀ: *{director}*\n┊ ᴘᴇᴍᴀɪɴ: {actors}\n┊ ᴘʟᴏᴛ: {plot}\n┊ ɪᴍᴅʙ: {url}\n╰━━━━━━━',
      listTitle: '╭─❏ 🎬 「 *HASIL FILM: {q}* 」\n{list}\n┊ ᴋᴇᴛɪᴋ *.movie <judul persisnya>* buat detail yaa~\n╰━━━━━━━',
      listLine: '┊ {n}. *{title}* ({year}) [{type}]',
    },
  },
  en: {
    movie: {
      hint: '╭─❏ 🎬 「 *MOVIE SEARCH* 」\n┊ Write the movie title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.movie inception*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, movie *{q}* was not found on OMDb~\n┊ Try its English title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, movie search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🎬 「 *{title} ({year})* 」\n┊ ɪᴍᴅʙ ʀᴀᴛɪɴɢ: *⭐ {rating}*\n┊ ɢᴇɴʀᴇ: *{genre}*\n┊ ʀᴜɴᴛɪᴍᴇ: *{runtime}*\n┊ ᴅɪʀᴇᴄᴛᴏʀ: *{director}*\n┊ ᴄᴀꜱᴛ: {actors}\n┊ ᴘʟᴏᴛ: {plot}\n┊ ɪᴍᴅʙ: {url}\n╰━━━━━━━',
      listTitle: '╭─❏ 🎬 「 *MOVIE RESULTS: {q}* 」\n{list}\n┊ ᴛʏᴘᴇ *.movie <exact title>* for details~\n╰━━━━━━━',
      listLine: '┊ {n}. *{title}* ({year}) [{type}]',
    },
  },
}

export const test = { input: '.movie inception', expect: /Inception/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('movie.hint'))
  try {
    const detail = await omdbDetail(q)
    if (detail) {
      const card = ctx.t('movie.card', {
        title: detail.title, year: detail.year, rating: detail.rating ?? '-',
        genre: detail.genre, runtime: detail.runtime, director: detail.director,
        actors: detail.actors, plot: detail.plot || '-', url: detail.url,
      })
      if (detail.poster) {
        try {
          const buf = (await downloadBuffer(detail.poster, { maxBytes: 4 * 1024 * 1024 })).buffer
          return await sendImage(ctx, buf, { caption: card })
        } catch { /* poster gagal: kirim teks saja */ }
      }
      return ctx.reply(card)
    }
    const rows = await omdbSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('movie.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('movie.listLine', { n: i + 1, title: r.title, year: r.year, type: r.type })).join('\n')
    return ctx.reply(ctx.t('movie.listTitle', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('movie.fail', { message: err.message }))
  }
}
