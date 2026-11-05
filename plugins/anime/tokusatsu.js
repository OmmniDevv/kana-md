import { tokusatsuSearch } from '../../src/scrapers/kindb/wp-sites.js'

export const config = {
  name: 'tokusatsu',
  alias: [],
  category: 'anime',
  description: { id: 'Cari serial dan episode tokusatsu (Kamen Rider, Super Sentai, Ultraman) di TokusatsuIndo', en: 'Search tokusatsu series and episodes (Kamen Rider, Super Sentai, Ultraman) on TokusatsuIndo' },
  usage: '.tokusatsu <judul>',
  example: '.tokusatsu kamen rider',
  cooldown: 10,
}

export const i18n = {
  id: {
    "tokusatsu": {
      hint: '╭─❏ 🔍 「 *TOKUSATSU* 」\n┊ Tulis kata kuncinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.tokusatsu kamen rider*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, hasil untuk *{q}* tidak ketemu di TokusatsuIndo~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 🦸 「 *TOKUSATSU: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: TokusatsuIndo\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
  en: {
    "tokusatsu": {
      hint: '╭─❏ 🔍 「 *TOKUSATSU* 」\n┊ Write the keyword first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.tokusatsu kamen rider*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no result for *{q}* on TokusatsuIndo~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 🦸 「 *TOKUSATSU: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: TokusatsuIndo\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
    },
  },
}

export const test = { input: '.tokusatsu kamen rider', expect: /Kamen Rider/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('tokusatsu.hint'))
  try {
    const rows = await tokusatsuSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('tokusatsu.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('tokusatsu.line', { n: i + 1, title: r.title, url: r.url })).join('\n')
    return ctx.reply(ctx.t('tokusatsu.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('tokusatsu.fail', { message: err.message }))
  }
}
