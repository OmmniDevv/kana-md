import { searchSongs } from '../../src/scrapers/youtube/youtube.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'yts',
  alias: ['ytsearch'],
  category: 'download',
  description: { id: 'Cari video di YouTube, tampilkan daftar hasil', en: 'Search YouTube videos, show result list' },
  usage: '.yts <kata kunci>',
  example: '.yts tutorial gitar akustik',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    yts: {
      needQuery: 'Ketik kata kuncinya dulu yaa, contoh: .yts tutorial gitar akustik~',
      notFound: 'Mouu, nggak ada hasil buat kata kunci itu. Coba kata lain ya~',
      failed: 'Mouu, pencarian gagal: {message}. Coba lagi nanti ya~',
      header: 'Hasil pencarian YouTube buat "{query}":',
      item: '{n}. {title} ({duration})\n.play {url}',
      btnItem: '{n}. {title}',
      btnMenu: 'Menu unduhan',
    },
  },
  en: {
    yts: {
      needQuery: 'Type the keywords first, example: .yts acoustic guitar tutorial~',
      notFound: 'Mouu, no results for those keywords. Try others~',
      failed: 'Mouu, search failed: {message}. Try again later~',
      header: 'YouTube search results for "{query}":',
      item: '{n}. {title} ({duration})\n.play {url}',
      btnItem: '{n}. {title}',
      btnMenu: 'Download menu',
    },
  },
}

// Teks tombol native flow tampil sempit di HP; jaga tetap pendek.
const MAX_BUTTON_TEXT = 25

// Tombol hasil pencarian: satu quick_reply per hasil (id = perintah .play
// dengan URL hasil itu) plus tombol menu unduhan selama totalnya di bawah 10.
export function buildYtsButtons(results, t) {
  const replies = (results || [])
    .filter((video) => video?.url)
    .slice(0, 5)
    .map((video, i) => {
      const text = t('yts.btnItem', { n: i + 1, title: video.title || '-' })
      return { text: text.length > MAX_BUTTON_TEXT ? text.slice(0, MAX_BUTTON_TEXT) : text, id: `.play ${video.url}` }
    })
  if (replies.length < 10) replies.push({ text: t('yts.btnMenu'), id: '.menu download' })
  return replies
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('yts.needQuery'))
  let search
  try {
    search = await searchSongs(query, 5)
  } catch (err) {
    return ctx.reply(ctx.t('yts.failed', { message: err.message }))
  }
  if (!search.results.length) return ctx.reply(ctx.t('yts.notFound'))
  const lines = [ctx.t('yts.header', { query })]
  search.results.forEach((video, i) => {
    lines.push(ctx.t('yts.item', { n: i + 1, title: video.title || '-', duration: video.durationText || '-', url: video.url || '-' }))
  })
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buildYtsButtons(search.results, ctx.t),
    textFallback: body,
  })
}
