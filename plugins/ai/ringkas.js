import * as cheerio from 'cheerio'
import { assertSafeUrl, downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ringkas',
  alias: ['rangkum', 'summarize'],
  category: 'ai',
  description: { id: 'Ringkas artikel dari URL atau teks panjang', en: 'Summarize an article from a URL or long text' },
  usage: '.ringkas <url|teks panjang>',
  example: '.ringkas https://contoh.com/artikel',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    ringkas: {
      needInput: '╭─❏ 📝 「 *KASIH TEKSNYA DULU* 」\n┊ Kasih URL artikel atau teks panjangnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.ringkas https://contoh.com/artikel*\n╰━━━━━━━',
      tooShort: '╭─❏ 📝 「 *TEKS KEPENDEKAN* 」\n┊ Teksnya kependekan nih buat diringkas (minimal lebih dari *200 karakter*).\n┊ Kasih teks yang lebih panjang atau URL artikel yaa~\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🔗 「 *URL TIDAK VALID* 」\n┊ URL-nya nggak valid atau nggak diizinkan nih.\n┊ Cek lagi alamatnya yaa~\n╰━━━━━━━',
      fetching: '╭─❏ 📖 「 *LAGI DIBACA* 」\n┊ Siap, KANA baca dulu isinya yaa... {mood} ✨\n╰━━━━━━━',
      downloadFailed: '╭─❏ 💦 「 *HALAMAN GAGAL DIAMBIL* 」\n┊ Mouu, KANA gagal mengambil halamannya: *{message}*\n┊ Situsnya mungkin memblokir bot, coba URL lain ya~\n╰━━━━━━━',
      emptyPage: '╭─❏ 🔍 「 *ARTIKEL TIDAK KETEMU* 」\n┊ Mouu, teks artikelnya nggak ketemu di halaman itu.\n┊ Coba URL artikel lain yaa~\n╰━━━━━━━',
      notConfigured: '╭─❏ ⚙️ 「 *AI BELUM TERSEDIA* 」\n┊ Mouu, provider AI belum tersedia nih, jadi KANA belum bisa meringkas dulu ya~ (╥﹏╥)\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *RINGKASAN GAGAL* 」\n┊ Mouu, ringkasannya gagal dibuat: *{message}*\n┊ Coba lagi nanti ya~ (╥﹏╥)\n╰━━━━━━━',
      header: '╭─❏ 📝 「 *RINGKASAN BUAT KAMU* 」\n╰━━━━━━━',
      summarizePrompt: 'Ringkas teks berikut dengan jelas dalam bahasa yang sama dengan teksnya. Ambil poin poin utama saja, maksimal 5 poin, tanpa menambah informasi baru:\n\n{text}',
      askPrompt: 'Jelaskan poin utama ringkasan tadi lebih detail',
      btnAsk: 'Tanya AI',
    },
  },
  en: {
    ringkas: {
      needInput: '╭─❏ 📝 「 *GIVE THE TEXT FIRST* 」\n┊ Give KANA an article URL or a long text first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.ringkas https://example.com/article*\n╰━━━━━━━',
      tooShort: '╭─❏ 📝 「 *TEXT TOO SHORT* 」\n┊ That text is too short to summarize (needs more than *200 characters*).\n┊ Give a longer text or an article URL~\n╰━━━━━━━',
      invalidUrl: '╭─❏ 🔗 「 *INVALID URL* 」\n┊ That URL is not valid or not allowed.\n┊ Please check the address~\n╰━━━━━━━',
      fetching: '╭─❏ 📖 「 *READING IT NOW* 」\n┊ Got it, KANA is reading the content first... {mood} ✨\n╰━━━━━━━',
      downloadFailed: '╭─❏ 💦 「 *PAGE FETCH FAILED* 」\n┊ Mouu, KANA failed to fetch the page: *{message}*\n┊ The site may be blocking bots, try another URL~\n╰━━━━━━━',
      emptyPage: '╭─❏ 🔍 「 *ARTICLE NOT FOUND* 」\n┊ Mouu, no article text was found on that page.\n┊ Try another article URL~\n╰━━━━━━━',
      notConfigured: '╭─❏ ⚙️ 「 *AI NOT AVAILABLE* 」\n┊ Mouu, no AI provider is available yet, so KANA cannot summarize for now~ (╥﹏╥)\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *SUMMARY FAILED* 」\n┊ Mouu, the summary failed: *{message}*\n┊ Try again later~ (╥﹏╥)\n╰━━━━━━━',
      header: '╭─❏ 📝 「 *A SUMMARY FOR YOU* 」\n╰━━━━━━━',
      summarizePrompt: 'Summarize the following text clearly in the same language as the text. Take only the main points, at most 5 points, without adding new information:\n\n{text}',
      askPrompt: 'Explain the main points of that summary in more detail',
      btnAsk: 'Ask AI',
    },
  },
}

// Ekstrak teks artikel sederhana: gabung teks h1, h2, dan p.
export function extractArticleText(html) {
  const $ = cheerio.load(String(html || ''))
  const parts = []
  $('h1, h2, p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (text) parts.push(text)
  })
  return parts.join('\n').slice(0, 6000)
}

export const test = { input: '.ringkas KANA adalah bot WhatsApp yang membantu pengguna mengunduh media, mencari informasi, dan membuat stiker langsung dari percakapan. Bot ini dibangun dengan arsitektur plugin modular sehingga setiap fitur bisa ditambah atau diperbaiki tanpa mengganggu fitur lain. Seluruh perintahnya didukung dua bahasa, Indonesia dan Inggris, dan dirancang tetap ringan untuk dipakai sehari hari.', expect: /Ringkasan/i }

export async function handler(ctx) {
  const input = ctx.text.trim()
  if (!input) return ctx.reply(ctx.t('ringkas.needInput'))
  const firstToken = input.split(/\s+/)[0]
  const isUrl = /^https?:\/\/\S+$/i.test(firstToken) && input.split(/\s+/).length === 1

  let sourceText = ''
  if (isUrl) {
    try {
      assertSafeUrl(firstToken)
    } catch {
      return ctx.reply(ctx.t('ringkas.invalidUrl'))
    }
    await ctx.reply(ctx.t('ringkas.fetching', { mood: ctx.say('mikir') }))
    let html
    try {
      const media = await withBreaker('ringkas-fetch', () =>
        downloadBuffer(firstToken, { maxBytes: 5 * 1024 * 1024, timeout: 30000 })
      )
      html = media.buffer.toString('utf8')
    } catch (err) {
      return ctx.reply(ctx.t('ringkas.downloadFailed', { message: err.message }))
    }
    sourceText = extractArticleText(html)
    if (!sourceText || sourceText.length < 100) return ctx.reply(ctx.t('ringkas.emptyPage'))
  } else {
    if (input.length <= 200) return ctx.reply(ctx.t('ringkas.tooShort'))
    sourceText = input.slice(0, 6000)
  }

  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('ringkas.notConfigured'))
  let summary
  try {
    summary = String(
      (await provider.chat([
        { role: 'user', content: ctx.t('ringkas.summarizePrompt', { text: sourceText }) },
      ])) || ''
    ).trim()
  } catch (err) {
    if (err?.code === 'NOT_CONFIGURED') return ctx.reply(ctx.t('ringkas.notConfigured'))
    return ctx.reply(ctx.t('ringkas.failed', { message: err.message }))
  }
  if (!summary) return ctx.reply(ctx.t('ringkas.failed', { message: 'jawaban kosong' }))
  const body = `${ctx.t('ringkas.header')}\n\n${summary.slice(0, 3500)}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('ringkas.btnAsk'), id: `.ai ${ctx.t('ringkas.askPrompt')}` }],
    textFallback: body,
  })
}
