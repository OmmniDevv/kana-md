import { komikSearch, komikDetail } from '../../src/scrapers/komik/komikcast.js'

export const config = {
  name: 'komikdetail',
  alias: ['shinigamidetail'],
  category: 'komik',
  description: { id: 'Detail komik dari Komikcast: sinopsis dan daftar chapter terbaru. Nama lama .shinigamidetail ikut ke sini karena situs Shinigami tidak terjangkau dari server', en: 'Comic details from Komikcast: synopsis and latest chapter list. The old .shinigamidetail name routes here because the Shinigami site is unreachable from the server' },
  usage: '.komikdetail <judul atau slug komik>',
  example: '.komikdetail solo leveling',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    komikdetail: {
      hint: '╭─❏ 📚 「 *DETAIL KOMIK* 」\n┊ Tulis judul atau slug komiknya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.komikdetail solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, komik *{q}* tidak ketemu di Komikcast~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil detail komik: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 📚 「 *{title}* 」\n┊ {desc}\n┊ ᴄʜᴀᴘᴛᴇʀ ᴛᴇʀʙᴀʀᴜ:\n{chapters}\n┊ ᴅᴇᴛᴀɪʟ: {url}\n╰━━━━━━━',
      chapterLine: '┊ • {title}',
      noChapter: '┊ (daftar chapter belum terbaca)',
      noDesc: 'Sinopsis belum tersedia.',
    },
  },
  en: {
    komikdetail: {
      hint: '╭─❏ 📚 「 *COMIC DETAILS* 」\n┊ Write the comic title or slug first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.komikdetail solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, comic *{q}* was not found on Komikcast~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch comic details: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 📚 「 *{title}* 」\n┊ {desc}\n┊ ʟᴀᴛᴇꜱᴛ ᴄʜᴀᴘᴛᴇʀꜱ:\n{chapters}\n┊ ᴅᴇᴛᴀɪʟꜱ: {url}\n╰━━━━━━━',
      chapterLine: '┊ • {title}',
      noChapter: '┊ (chapter list not readable yet)',
      noDesc: 'Synopsis not available yet.',
    },
  },
}

export const test = { input: '.komikdetail solo leveling', expect: /Solo Leveling|Chapter|chapter/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('komikdetail.hint'))
  try {
    let target = q
    if (!/^https?:\/\//i.test(q) && /\s/.test(q)) {
      const found = await komikSearch(q, 1)
      const first = found?.results?.[0]
      if (!first) return ctx.reply(ctx.t('komikdetail.notfound', { q }))
      target = first.url || first.slug || q
    }
    const detail = await komikDetail(target)
    if (!detail || !detail.title) return ctx.reply(ctx.t('komikdetail.notfound', { q }))
    const chapters = (detail.chapters || []).slice(0, 10)
    const chapterText = chapters.length
      ? chapters.map((c) => ctx.t('komikdetail.chapterLine', { title: c.title })).join('\n')
      : ctx.t('komikdetail.noChapter')
    return ctx.reply(ctx.t('komikdetail.card', {
      title: detail.title,
      desc: String(detail.description || '').slice(0, 350) || ctx.t('komikdetail.noDesc'),
      chapters: chapterText,
      url: detail.url,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('komikdetail.fail', { message: err.message }))
  }
}
