import { searchImages } from '../../src/scrapers/search/gambar.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gambar',
  alias: ['image', 'img', 'bingimg'],
  category: 'search',
  description: { id: 'Cari gambar di Bing dan kirim hasil pertama', en: 'Search images on Bing and send the first result' },
  usage: '.gambar <kata kunci>',
  example: '.gambar kucing lucu',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    gambar: {
      needQuery: '╭─❏ 🖼️ 「 *CARI GAMBAR* 」\n┊ Ketik kata kuncinya dulu yaa~\n┊ Contoh: *.gambar kucing lucu*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *GAMBAR TIDAK KETEMU* 」\n┊ Mouu, nggak ada gambar buat kata kunci itu~\n┊ Coba kata lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian gambar gagal: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      caption: '🖼️ ɢᴀᴍʙᴀʀ ʙᴜᴀᴛ *{query}*',
      moreHeader: '╭─❏ 🔗 「 *GAMBAR LAIN: {query}* 」',
      item: '┊ {n}. {url}',
      btnAgain: 'Cari lagi',
      btnPinterest: 'Cari di Pinterest',
    },
  },
  en: {
    gambar: {
      needQuery: '╭─❏ 🖼️ 「 *IMAGE SEARCH* 」\n┊ Type the keywords first~\n┊ Example: *.gambar cute cat*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO IMAGES FOUND* 」\n┊ Mouu, no images for those keywords~\n┊ Try others~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SEARCH FAILED* 」\n┊ Mouu, image search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '🖼️ ɪᴍᴀɢᴇ ꜰᴏʀ *{query}*',
      moreHeader: '╭─❏ 🔗 「 *MORE IMAGES: {query}* 」',
      item: '┊ {n}. {url}',
      btnAgain: 'Search again',
      btnPinterest: 'Search on Pinterest',
    },
  },
}

export const test = { input: '.gambar kucing lucu', expect: /kucing lucu/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('gambar.needQuery'))
  let search
  try {
    search = await searchImages(query, { limit: 5 })
  } catch (err) {
    return ctx.reply(ctx.t('gambar.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('gambar.notFound'))
  let sent = false
  for (const url of search.results.slice(0, 3)) {
    try {
      const media = await downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES })
      if (!media.contentType.startsWith('image/')) continue
      await sendImage(ctx, media.buffer, { caption: ctx.t('gambar.caption', { query }) })
      sent = true
      break
    } catch {
      // coba gambar berikutnya
    }
  }
  const lines = []
  if (!sent) lines.push(ctx.t('gambar.caption', { query }))
  if (search.results.length > 1) {
    lines.push(ctx.t('gambar.moreHeader', { query }))
    search.results.forEach((url, i) => lines.push(ctx.t('gambar.item', { n: i + 1, url })))
  }
  if (lines.length) lines.push('╰━━━━━━━')
  const body = lines.join('\n')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('gambar.btnAgain'), id: `.gambar ${query}` },
      { text: ctx.t('gambar.btnPinterest'), id: `.pinterest ${query}` },
    ],
    textFallback: body,
  })
}
