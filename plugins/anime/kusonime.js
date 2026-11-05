import { kusonimeSearch } from '../../src/scrapers/kindb/wp-sites.js'

export const config = {
  name: 'kusonime',
  alias: [],
  category: 'anime',
  description: { id: 'Cari anime batch subtitle Indonesia di Kusonime', en: 'Search batch anime with Indonesian subtitles on Kusonime' },
  usage: '.kusonime <judul anime>',
  example: '.kusonime naruto',
  cooldown: 10,
}

export const i18n = {
  id: {
    "kusonime": {
      hint: '╭─❏ 🔍 「 *KUSONIME* 」\n┊ Tulis kata kuncinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kusonime naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu di Kusonime~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 🎌 「 *KUSONIME: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: Kusonime\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
  en: {
    "kusonime": {
      hint: '╭─❏ 🔍 「 *KUSONIME* 」\n┊ Write the keyword first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kusonime naruto*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no result for *{q}* on Kusonime~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 🎌 「 *KUSONIME: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: Kusonime\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
}

export const test = { input: '.kusonime naruto', expect: /Naruto/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('kusonime.hint'))
  try {
    const rows = await kusonimeSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('kusonime.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('kusonime.line', { n: i + 1, title: r.title, url: r.url })).join('\n')
    return ctx.reply(ctx.t('kusonime.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('kusonime.fail', { message: err.message }))
  }
}
