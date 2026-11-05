import { load } from 'cheerio'
import { sendButtons } from '../../src/ui/buttons.js'

// Fuckmylife: scrape langsung halaman random fmylife.com. Cerita tampil
// sebagai teks "Today, ... FML" di dalam elemen article pada HTML,
// diekstrak memakai cheerio, dipilih satu secara acak, ditampilkan apa
// adanya dengan label sumber. Bukan API pihak ketiga berbayar.
export const config = {
  name: 'fuckmylife',
  alias: ['fmlstory'],
  category: 'fun',
  description: { id: 'Satu cerita FML acak dari fmylife.com', en: 'One random FML story from fmylife.com' },
  usage: '.fuckmylife',
  example: '.fuckmylife',
  cooldown: 5,
}

export const FML_URL = 'https://www.fmylife.com/random'

export const i18n = {
  id: {
    fuckmylife: {
      title: 'Cerita FML',
      result: '╭─❏ 😅 「 *FML STORY* 」\n┊ {story}\n┊\n┊ ꜱᴜᴍʙᴇʀ: fmylife.com\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FML GAGAL* 」\n┊ Mouu, cerita FML-nya gagal diambil: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Cerita Lain',
    },
  },
  en: {
    fuckmylife: {
      title: 'FML Story',
      result: '╭─❏ 😅 「 *FML STORY* 」\n┊ {story}\n┊\n┊ ꜱᴏᴜʀᴄᴇ: fmylife.com\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FML FAILED* 」\n┊ Mouu, the FML story failed to load: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Story',
    },
  },
}

export const test = { input: '.fuckmylife', expect: /fml story/i }

// Ekstrak daftar cerita dari HTML fmylife.com: paragraf di dalam
// article yang mulai dengan "Today," dan memuat "FML", deduplikasi,
// spasi diringkas. Mengembalikan array string bersih.
export function parseFmlStories(html) {
  if (!html || typeof html !== 'string') return []
  const $ = load(html)
  const seen = new Set()
  const stories = []
  $('article p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (!text.startsWith('Today,')) return
    if (!/\bFML\b/.test(text)) return
    if (text.length < 30 || text.length > 1200) return
    if (seen.has(text)) return
    seen.add(text)
    stories.push(text)
  })
  return stories
}

export async function fetchFmlStory({ fetchImpl = fetch, rng = Math.random } = {}) {
  const res = await fetchImpl(FML_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
  })
  if (!res?.ok) throw new Error(`HTTP ${res?.status ?? '?'}`)
  const stories = parseFmlStories(await res.text())
  if (!stories.length) throw new Error('tidak ada cerita yang terbaca dari halaman')
  return stories[Math.min(stories.length - 1, Math.floor(rng() * stories.length))]
}

export async function handler(ctx) {
  let story
  try {
    story = await fetchFmlStory()
  } catch (err) {
    return ctx.reply(ctx.t('fuckmylife.fail', { message: err.message }))
  }
  const body = ctx.t('fuckmylife.result', { story })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('fuckmylife.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('fuckmylife.btnAgain'), id: '.fuckmylife' }],
    textFallback: body,
  })
}
