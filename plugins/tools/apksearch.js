import { fdroidSearch } from '../../src/scrapers/kindb/fdroid.js'

export const config = {
  name: 'apksearch',
  alias: [],
  category: 'tools',
  description: { id: 'Cari APK aplikasi open-source yang aman di F-Droid (APKPure, APKMirror, dan situs APK lain tidak terjangkau dari server)', en: 'Search safe open-source app APKs on F-Droid (APKPure, APKMirror, and other APK sites are unreachable from the server)' },
  usage: '.apksearch <nama aplikasi>',
  example: '.apksearch telegram',
  cooldown: 8,
}

export const i18n = {
  id: {
    apksearch: {
      hint: '╭─❏ 📦 「 *CARI APK* 」\n┊ Tulis nama aplikasinya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.apksearch telegram*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, APK *{q}* tidak ketemu di F-Droid~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, pencarian APK gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      title: '╭─❏ 📦 「 *APK OPEN-SOURCE: {q}* 」\n{list}\n┊ ꜱᴜᴍʙᴇʀ: F-Droid (repositori open-source resmi)\n╰━━━━━━━',
      line: '┊ {n}. *{name}*\n┊ {summary}\n┊ ᴜɴᴅᴜʜ: {url}',
    },
  },
  en: {
    apksearch: {
      hint: '╭─❏ 📦 「 *APK SEARCH* 」\n┊ Write the app name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.apksearch telegram*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, APK *{q}* was not found on F-Droid~\n┊ Try another keyword~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, APK search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      title: '╭─❏ 📦 「 *OPEN-SOURCE APK: {q}* 」\n{list}\n┊ ꜱᴏᴜʀᴄᴇ: F-Droid (official open-source repository)\n╰━━━━━━━',
      line: '┊ {n}. *{name}*\n┊ {summary}\n┊ ᴅᴏᴡɴʟᴏᴀᴅ: {url}',
    },
  },
}

export const test = { input: '.apksearch telegram', expect: /Telegram|F-Droid/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('apksearch.hint'))
  try {
    const rows = await fdroidSearch(q, 6)
    if (!rows.length) return ctx.reply(ctx.t('apksearch.notfound', { q }))
    const list = rows.map((r, i) => ctx.t('apksearch.line', { n: i + 1, name: r.name, summary: r.summary || '-', url: r.apkUrl || r.url })).join('\n')
    return ctx.reply(ctx.t('apksearch.title', { q, list }))
  } catch (err) {
    return ctx.reply(ctx.t('apksearch.fail', { message: err.message }))
  }
}
