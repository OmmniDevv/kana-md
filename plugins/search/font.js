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
      needQuery: 'Ketik kata kuncinya dulu yaa, contoh: .font anime. Buat unduh: .font dl <slug>~',
      needSlug: 'Ketik slug fontnya dulu yaa, contoh: .font dl bebas-neue~',
      notFound: 'Mouu, fontnya nggak ketemu. Coba kata lain ya~',
      failed: 'Mouu, gagal proses font: {message}. Sumbernya kadang ngambek, coba lagi nanti ya~',
      tooBig: 'Aduh, file fontnya kegedean buat dikirim lewat WhatsApp~',
      header: 'Hasil font buat "{query}":',
      item: '{n}. {title} oleh {author}\nUnduh: .font dl {slug}',
      caption: 'Font {title}, silakan dicek lisensinya dulu sebelum dipakai ya~',
      btnAgain: 'Cari lagi',
      btnMenu: 'Menu pencarian',
      followUp: 'Lanjutan: .font {query} • .menu search',
    },
  },
  en: {
    font: {
      needQuery: 'Type the keywords first, example: .font anime. To download: .font dl <slug>~',
      needSlug: 'Type the font slug first, example: .font dl bebas-neue~',
      notFound: 'Mouu, the font was not found. Try other keywords~',
      failed: 'Mouu, font processing failed: {message}. The source acts up sometimes, try again later~',
      tooBig: 'Oops, the font file is too big to send over WhatsApp~',
      header: 'Font results for "{query}":',
      item: '{n}. {title} by {author}\nDownload: .font dl {slug}',
      caption: 'Font {title}, please check its license before using it~',
      btnAgain: 'Search again',
      btnMenu: 'Search menu',
      followUp: 'Next: .font {query} • .menu search',
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
      { text: ctx.t('font.btnMenu'), id: '.menu search' },
    ],
    textFallback: body,
  })
}
