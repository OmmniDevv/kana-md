import { sendButtons } from '../../src/ui/buttons.js'
import { getKataKata } from '../../src/scrapers/search/katakata.js'
import { getRandomQuote } from '../../src/scrapers/search/quotes.js'

// Katakata: kata-kata bijak Bahasa Indonesia asli dari API Xemoz
// (sumber utama). Bila Xemoz gagal, fallback ke quotes DummyJSON
// yang sudah ada di repo. Bukan lagi daftar teks statis lokal.
export const config = {
  name: 'katakata',
  alias: ['quotes', 'katamutiara', 'randomkata'],
  category: 'quotes',
  description: { id: 'Kata-kata bijak acak dari API Xemoz', en: 'Random wise words from the Xemoz API' },
  usage: '.katakata',
  example: '.katakata',
  cooldown: 5,
}

export const i18n = {
  id: {
    katakata: {
      title: 'Kata-Kata Bijak',
      body: '╭─❏ ✨ 「 *KATA-KATA BIJAK* 」\n┊ _{text}_\n┊\n┊ Sumber: API Xemoz\n╰━━━━━━━',
      bodyFallback: '╭─❏ ✨ 「 *KATA-KATA BIJAK* 」\n┊ _{text}_\n┊\n┊ ✍️ {author}\n┊ Sumber cadangan: DummyJSON (Xemoz lagi tidak bisa dihubungi)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *KATA-KATA GAGAL* 」\n┊ Mouu, semua sumber kata-katanya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Lagi',
    },
  },
  en: {
    katakata: {
      title: 'Wise Words',
      body: '╭─❏ ✨ 「 *WISE WORDS* 」\n┊ _{text}_\n┊\n┊ Source: Xemoz API\n╰━━━━━━━',
      bodyFallback: '╭─❏ ✨ 「 *WISE WORDS* 」\n┊ _{text}_\n┊\n┊ ✍️ {author}\n┊ Fallback source: DummyJSON (Xemoz is unreachable)\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *WISE WORDS FAILED* 」\n┊ Mouu, all word sources cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Again',
    },
  },
}

export const test = { input: '.katakata', expect: /kata-kata bijak|wise words/i }

export function formatKataKata(t, text) {
  return t('katakata.body', { text })
}

export function formatKataKataFallback(t, quote) {
  return t('katakata.bodyFallback', { text: quote.quote, author: quote.author })
}

export async function handler(ctx, { fetchKata = getKataKata, fetchQuote = getRandomQuote } = {}) {
  let body
  try {
    const text = await fetchKata()
    body = formatKataKata(ctx.t, text)
  } catch (primaryErr) {
    try {
      const quote = await fetchQuote()
      body = formatKataKataFallback(ctx.t, quote)
    } catch {
      return ctx.reply(ctx.t('katakata.fail', { message: primaryErr.message }))
    }
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('katakata.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('katakata.btnAgain'), id: '.katakata' }],
    textFallback: body,
  })
}
