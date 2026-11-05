import { dongengSearch, dongengRead } from '../../src/scrapers/kindb/dongeng.js'

export const config = {
  name: 'dongeng',
  alias: [],
  category: 'internet',
  description: { id: 'Cari dan baca dongeng anak dari 1000dongeng.com: sebutkan kata kunci untuk daftar cerita, atau tempel tautan ceritanya untuk membaca isi lengkap', en: 'Search and read children folktales from 1000dongeng.com: give a keyword for the story list, or paste a story link to read the full text' },
  usage: '.dongeng <kata kunci atau tautan cerita>',
  example: '.dongeng kancil',
  cooldown: 8,
}

export const i18n = {
  id: {
    dongeng: {
      hint: '╭─❏ 📖 「 *DONGENG* 」\n┊ Tulis kata kunci ceritanya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.dongeng kancil*\n┊ ʙᴀᴄᴀ ɪꜱɪ: *.dongeng <tautan cerita>*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, dongeng *{q}* tidak ketemu di 1000dongeng~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil dongeng: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 📖 「 *DONGENG: {q}* 」\n{list}\n┊ ʙᴀᴄᴀ ɪꜱɪɴʏᴀ: *.dongeng <tautan dari daftar>*\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
      story: '╭─❏ 📖 「 *{title}* 」\n┊ {text}\n╰━━━━━━━',
    },
  },
  en: {
    dongeng: {
      hint: '╭─❏ 📖 「 *FOLKTALES* 」\n┊ Write the story keyword first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.dongeng kancil*\n┊ ʀᴇᴀᴅ ꜰᴜʟʟ: *.dongeng <story link>*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no tale for *{q}* on 1000dongeng~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the tale: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 📖 「 *FOLKTALES: {q}* 」\n{list}\n┊ ʀᴇᴀᴅ ꜰᴜʟʟ ᴛᴇxᴛ: *.dongeng <link from the list>*\n╰━━━━━━━',
      line: '┊ {n}. *{title}*\n┊ {url}',
      story: '╭─❏ 📖 「 *{title}* 」\n┊ {text}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.dongeng kancil', expect: /Kancil/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('dongeng.hint'))
  try {
    if (/^https?:\/\//i.test(q)) {
      const story = await dongengRead(q)
      const text = story.text.length > 3200 ? story.text.slice(0, 3200).trimEnd() + '...' : story.text
      return ctx.reply(ctx.t('dongeng.story', { title: story.title || 'Dongeng', text }))
    }
    const rows = await dongengSearch(q, 8)
    if (!rows.length) return ctx.reply(ctx.t('dongeng.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('dongeng.line', { n: i + 1, title: r.title, url: r.url })).join('\n')
    return ctx.reply(ctx.t('dongeng.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('dongeng.fail', { message: err.message }))
  }
}
