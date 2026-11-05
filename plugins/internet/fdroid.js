import { fdroidSearch } from '../../src/scrapers/kindb/fdroid.js'

export const config = {
  name: 'fdroid',
  alias: [],
  category: 'internet',
  description: { id: 'Cari aplikasi open-source di F-Droid lengkap dengan tautan unduh APK resminya', en: 'Search open-source apps on F-Droid with official APK download links' },
  usage: '.fdroid <nama aplikasi>',
  example: '.fdroid firefox',
  cooldown: 8,
}

export const i18n = {
  id: {
    fdroid: {
      hint: '╭─❏ 🤖 「 *F-DROID* 」\n┊ Tulis nama aplikasinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.fdroid firefox*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, aplikasi *{q}* tidak ketemu di F-Droid~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian F-Droid gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 🤖 「 *F-DROID: {q}* 」\n{list}\n╰━━━━━━━',
      line: '┊ {n}. *{name}*\n┊ {summary}\n┊ ᴜɴᴅᴜʜ: {url}',
    },
  },
  en: {
    fdroid: {
      hint: '╭─❏ 🤖 「 *F-DROID* 」\n┊ Write the app name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.fdroid firefox*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, app *{q}* was not found on F-Droid~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, F-Droid search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 🤖 「 *F-DROID: {q}* 」\n{list}\n╰━━━━━━━',
      line: '┊ {n}. *{name}*\n┊ {summary}\n┊ ᴅᴏᴡɴʟᴏᴀᴅ: {url}',
    },
  },
}

export const test = { input: '.fdroid firefox', expect: /Fennec|FFUpdater|F-Droid/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('fdroid.hint'))
  try {
    const rows = await fdroidSearch(q, 6)
    if (!rows.length) return ctx.reply(ctx.t('fdroid.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('fdroid.line', { n: i + 1, name: r.name, summary: r.summary || '-', url: r.apkUrl || r.url })).join('\n')
    return ctx.reply(ctx.t('fdroid.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('fdroid.fail', { message: err.message }))
  }
}
