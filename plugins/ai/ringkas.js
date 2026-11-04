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
      needInput: 'Kasih URL artikel atau teks panjangnya dulu yaa, contoh: .ringkas https://contoh.com/artikel~ 📝',
      tooShort: 'Teksnya kependekan nih buat diringkas (minimal lebih dari 200 karakter). Kasih teks yang lebih panjang atau URL artikel yaa~',
      invalidUrl: 'URL-nya nggak valid atau nggak diizinkan nih. Cek lagi alamatnya yaa~',
      fetching: 'Siap, KANA baca dulu isinya yaa... {mood} 📖✨',
      downloadFailed: 'Mouu, KANA gagal mengambil halamannya: {message}. Situsnya mungkin memblokir bot, coba URL lain ya~',
      emptyPage: 'Mouu, teks artikelnya nggak ketemu di halaman itu. Coba URL artikel lain yaa~',
      notConfigured: 'Mouu, provider AI belum tersedia nih, jadi KANA belum bisa meringkas dulu ya~ (╥﹏╥)',
      failed: 'Mouu, ringkasannya gagal dibuat: {message}. Coba lagi nanti ya~ (╥﹏╥)',
      header: 'Ringkasan buat kamu~ 📝✨',
      summarizePrompt: 'Ringkas teks berikut dengan jelas dalam bahasa yang sama dengan teksnya. Ambil poin poin utama saja, maksimal 5 poin, tanpa menambah informasi baru:\n\n{text}',
      askPrompt: 'Jelaskan poin utama ringkasan tadi lebih detail',
      btnAsk: 'Tanya AI',
      btnMenu: 'Menu AI',
    },
  },
  en: {
    ringkas: {
      needInput: 'Give KANA an article URL or a long text first, example: .ringkas https://example.com/article~ 📝',
      tooShort: 'That text is too short to summarize (needs more than 200 characters). Give a longer text or an article URL~',
      invalidUrl: 'That URL is not valid or not allowed. Please check the address~',
      fetching: 'Got it, KANA is reading the content first... {mood} 📖✨',
      downloadFailed: 'Mouu, KANA failed to fetch the page: {message}. The site may be blocking bots, try another URL~',
      emptyPage: 'Mouu, no article text was found on that page. Try another article URL~',
      notConfigured: 'Mouu, no AI provider is available yet, so KANA cannot summarize for now~ (╥﹏╥)',
      failed: 'Mouu, the summary failed: {message}. Try again later~ (╥﹏╥)',
      header: 'A summary for you~ 📝✨',
      summarizePrompt: 'Summarize the following text clearly in the same language as the text. Take only the main points, at most 5 points, without adding new information:\n\n{text}',
      askPrompt: 'Explain the main points of that summary in more detail',
      btnAsk: 'Ask AI',
      btnMenu: 'AI Menu',
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
    replies: [
      { text: ctx.t('ringkas.btnAsk'), id: `.ai ${ctx.t('ringkas.askPrompt')}` },
      { text: ctx.t('ringkas.btnMenu'), id: '.menu ai' },
    ],
    textFallback: body,
  })
}
