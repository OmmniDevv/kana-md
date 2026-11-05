import { komikindoSearch } from '../../src/scrapers/kindb/wp-sites.js'

export const config = {
  name: 'komikindo',
  alias: [],
  category: 'anime',
  description: { id: 'Cari komik dan manhwa di Komikindo', en: 'Search comics and manhwa on Komikindo' },
  usage: '.komikindo <judul komik>',
  example: '.komikindo solo leveling',
  cooldown: 10,
}

export const i18n = {
  id: {
    "komikindo": {
      hint: '╭─❏ 🔍 「 *KOMIKINDO* 」\n┊ Tulis kata kuncinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.komikindo solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu di Komikindo~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 📚 「 *KOMIKINDO: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: Komikindo\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
  en: {
    "komikindo": {
      hint: '╭─❏ 🔍 「 *KOMIKINDO* 」\n┊ Write the keyword first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.komikindo solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no result for *{q}* on Komikindo~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 📚 「 *KOMIKINDO: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: Komikindo\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
}

export const test = { input: '.komikindo solo leveling', expect: /Solo Leveling/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('komikindo.hint'))
  try {
    const rows = await komikindoSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('komikindo.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('komikindo.line', { n: i + 1, title: r.title, url: r.url })).join('\n')
    return ctx.reply(ctx.t('komikindo.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('komikindo.fail', { message: err.message }))
  }
}
