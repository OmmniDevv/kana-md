import { fontSearch, fontDownload } from '../../src/scrapers/font/dafont.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'font',
  alias: ['dafont'],
  category: 'search',
  description: { id: 'Cari font di DaFont, unduh dengan .font dl <slug>', en: 'Search fonts on DaFont, download with .font dl <slug>' },
  usage: '.font <kata kunci> atau .font dl <slug>',
  example: '.font anime',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    font: {
      needQuery: '╭─❏ 🔤 「 *CARI FONT* 」\n┊ Ketik kata kuncinya dulu yaa~\n┊ Contoh: *.font anime*\n┊ Buat unduh: *.font dl <slug>*\n╰━━━━━━━',
      needSlug: '╭─❏ 🔤 「 *UNDUH FONT* 」\n┊ Ketik slug fontnya dulu yaa~\n┊ Contoh: *.font dl bebas-neue*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *FONT TIDAK KETEMU* 」\n┊ Mouu, fontnya nggak ketemu~\n┊ Coba kata lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *PROSES FONT GAGAL* 」\n┊ Mouu, gagal proses font: *{message}*\n┊ Sumbernya kadang ngambek, coba lagi nanti yaa~\n╰━━━━━━━',
      tooBig: '╭─❏ 📦 「 *FILE KEGADEAN* 」\n┊ Aduh, file fontnya kegedean buat dikirim lewat WhatsApp~\n╰━━━━━━━',
      header: '╭─❏ 🔤 「 *HASIL FONT: {query}* 」',
      item: '┊ {n}. *{title}* ᴏʟᴇʜ {author}\n┊ ᴜɴᴅᴜʜ: *.font dl {slug}*',
      caption: '╭─❏ 🔤 「 *FONT {title}* 」\n┊ Silakan dicek lisensinya dulu sebelum dipakai yaa~\n╰━━━━━━━',
      btnAgain: 'Cari lagi',
      followUp: '╰━━━━━━━',
    },
  },
  en: {
    font: {
      needQuery: '╭─❏ 🔤 「 *FONT SEARCH* 」\n┊ Type the keywords first~\n┊ Example: *.font anime*\n┊ To download: *.font dl <slug>*\n╰━━━━━━━',
      needSlug: '╭─❏ 🔤 「 *FONT DOWNLOAD* 」\n┊ Type the font slug first~\n┊ Example: *.font dl bebas-neue*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *FONT NOT FOUND* 」\n┊ Mouu, the font was not found~\n┊ Try other keywords~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *FONT PROCESSING FAILED* 」\n┊ Mouu, font processing failed: *{message}*\n┊ The source acts up sometimes, try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 📦 「 *FILE TOO BIG* 」\n┊ Oops, the font file is too big to send over WhatsApp~\n╰━━━━━━━',
      header: '╭─❏ 🔤 「 *FONT RESULTS: {query}* 」',
      item: '┊ {n}. *{title}* ʙʏ {author}\n┊ ᴅᴏᴡɴʟᴏᴀᴅ: *.font dl {slug}*',
      caption: '╭─❏ 🔤 「 *FONT {title}* 」\n┊ Please check its license before using it~\n╰━━━━━━━',
      btnAgain: 'Search again',
      followUp: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.font gaming', expect: /Hasil font/i }

export async function handler(ctx) {
  if (ctx.args[0] === 'dl') {
    const slug = ctx.args[1]
    if (!slug) return ctx.reply(ctx.t('font.needSlug'))
    let result
    try {
      result = await fontDownload(slug, { maxBytes: MAX_DOCUMENT_BYTES })
    } catch (err) {
      return ctx.reply(ctx.t('font.failed', { message: err.message }))
    }
    await sendDocument(ctx, result.buffer, {
      fileName: result.filename,
      mimetype: result.mimeType,
      caption: ctx.t('font.caption', { title: result.info.title || slug }),
    })
    return
  }
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('font.needQuery'))
  let search
  try {
    search = await fontSearch(query)
  } catch (err) {
    return ctx.reply(ctx.t('font.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('font.notFound'))
  const lines = [ctx.t('font.header', { query })]
  search.results.slice(0, 8).forEach((font, i) => {
    lines.push(ctx.t('font.item', { n: i + 1, title: font.title, author: font.author || '-', slug: font.slug }))
  })
  lines.push(ctx.t('font.followUp', { query }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('font.btnAgain'), id: `.font ${query}` },
    ],
    textFallback: body,
  })
}
