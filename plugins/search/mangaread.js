import { komikSearch, komikDetail, komikReadChapter } from '../../src/scrapers/komik/komikcast.js'

export const config = {
  name: 'mangaread',
  alias: [],
  category: 'search',
  description: { id: 'Baca manga dari Komikcast: sebutkan judul untuk membuka chapter terbarunya, atau tempel tautan chapter langsung', en: 'Read manga from Komikcast: name a title to open its latest chapter, or paste a chapter link directly' },
  usage: '.mangaread <judul manga atau tautan chapter>',
  example: '.mangaread solo leveling',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    mangaread: {
      hint: '╭─❏ 📖 「 *BACA MANGA* 」\n┊ Tulis judul manganya atau tempel tautan chapter Komikcast yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.mangaread solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, manga *{q}* tidak ketemu di Komikcast~\n┊ Coba judul lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal membuka chapter: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 📖 「 *{title}* 」\n┊ ᴛᴏᴛᴀʟ: *{total} gambar*\n{links}\n┊ ʙᴀᴄᴀ ᴅɪ: {url}\n╰━━━━━━━',
      imgLine: '┊ {n}. {url}',
    },
  },
  en: {
    mangaread: {
      hint: '╭─❏ 📖 「 *READ MANGA* 」\n┊ Write the manga title or paste a Komikcast chapter link~\n┊ ᴇxᴀᴍᴘʟᴇ: *.mangaread solo leveling*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, manga *{q}* was not found on Komikcast~\n┊ Try another title~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to open the chapter: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 📖 「 *{title}* 」\n┊ ᴛᴏᴛᴀʟ: *{total} images*\n{links}\n┊ ʀᴇᴀᴅ ᴀᴛ: {url}\n╰━━━━━━━',
      imgLine: '┊ {n}. {url}',
    },
  },
}

export const test = { input: '.mangaread solo leveling', expect: /gambar|images|Komikcast/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('mangaread.hint'))
  try {
    let chapterInput = q
    if (!/^https?:\/\//i.test(q) && !/chapter/i.test(q)) {
      const found = await komikSearch(q, 1)
      const first = found?.results?.[0]
      if (!first) return ctx.reply(ctx.t('mangaread.notfound', { q }))
      const detail = await komikDetail(first.url || first.slug || q)
      const latest = detail?.chapters?.[0]
      if (!latest) return ctx.reply(ctx.t('mangaread.notfound', { q }))
      chapterInput = latest.url || latest.id
    }
    const page = await komikReadChapter(chapterInput)
    if (!page || !page.images?.length) return ctx.reply(ctx.t('mangaread.notfound', { q }))
    const links = page.images.slice(0, 12).map((u, i) => ctx.t('mangaread.imgLine', { n: i + 1, url: u })).join('\n')
    return ctx.reply(ctx.t('mangaread.card', { title: page.title || q, total: page.total ?? page.images.length, links, url: page.url }))
  } catch (err) {
    return ctx.reply(ctx.t('mangaread.fail', { message: err.message }))
  }
}
