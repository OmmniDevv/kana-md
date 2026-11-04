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
      needQuery: '╭─❏ 🔍 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.yts tutorial gitar akustik*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TIDAK ADA HASIL* 」\n┊ Mouu, nggak ada hasil buat kata kunci itu. Coba kata lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      header: '╭─❏ 🔍 「 *HASIL PENCARIAN YOUTUBE* 」\n┊ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ: *{query}*',
      item: '┊ {n}. *{title}* ({duration})\n┊ .play {url}',
      btnItem: '{n}. {title}',
    },
  },
  en: {
    yts: {
      needQuery: '╭─❏ 🔍 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.yts acoustic guitar tutorial*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO RESULTS* 」\n┊ Mouu, no results for those keywords. Try others~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🔍 「 *YOUTUBE SEARCH RESULTS* 」\n┊ ᴋᴇʏᴡᴏʀᴅꜱ: *{query}*',
      item: '┊ {n}. *{title}* ({duration})\n┊ .play {url}',
      btnItem: '{n}. {title}',
    },
  },
}

// Teks tombol native flow tampil sempit di HP; jaga tetap pendek.
const MAX_BUTTON_TEXT = 25

// Tombol hasil pencarian: satu quick_reply per hasil (id = perintah .play
// dengan URL hasil itu).
export function buildYtsButtons(results, t) {
  return (results || [])
    .filter((video) => video?.url)
    .slice(0, 5)
    .map((video, i) => {
      const text = t('yts.btnItem', { n: i + 1, title: video.title || '-' })
      return { text: text.length > MAX_BUTTON_TEXT ? text.slice(0, MAX_BUTTON_TEXT) : text, id: `.play ${video.url}` }
    })
}

export const test = { input: '.yts Tulus Sepatu', expect: /Hasil pencarian YouTube/i }

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
  lines.push('╰━━━━━━━')
  const body = lines.join('\n')
  const replies = buildYtsButtons(search.results, ctx.t)
  if (!replies.length) return ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
