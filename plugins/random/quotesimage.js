import { getRandomQuote } from '../../src/scrapers/search/quotes.js'
import { quoteCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

// Quotesimage: gambar quotes acak beneran. Teks quotes diambil hidup
// dari DummyJSON, lalu dirender menjadi kartu gambar lokal memakai
// renderer quote KANA. API lama Neoxr tidak dipakai karena contoh
// referensinya memakai API key hardcoded milik bot lain.
export const config = {
  name: 'quotesimage',
  alias: ['quotes-image', 'qimg'],
  category: 'random',
  description: { id: 'Gambar quotes acak', en: 'Random quote image' },
  usage: '.quotesimage',
  example: '.quotesimage',
  cooldown: 5,
}

export const i18n = {
  id: {
    quotesimage: {
      caption: '╭─❏ 💬 「 *QUOTES IMAGE* 」\n┊ "{quote}"\n┊ - *{author}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *QUOTES GAGAL* 」\n┊ Mouu, quotesnya gagal dibuat: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    quotesimage: {
      caption: '╭─❏ 💬 「 *QUOTES IMAGE* 」\n┊ "{quote}"\n┊ - *{author}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *QUOTES FAILED* 」\n┊ Mouu, the quote image failed: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.quotesimage', expect: /quotes image/i }

export async function handler(ctx) {
  try {
    const { quote, author } = await getRandomQuote()
    const image = await quoteCard({ text: quote, author })
    if (!Buffer.isBuffer(image) || !image.length) throw new Error('hasil render kosong')
    return await sendImage(ctx, image, { caption: ctx.t('quotesimage.caption', { quote, author }) })
  } catch (err) {
    return ctx.reply(ctx.t('quotesimage.fail', { message: err.message }))
  }
}
