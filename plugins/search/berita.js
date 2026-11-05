// Berita Indonesia dari RSS publik (Google News RSS bahasa Indonesia
// utama, RSS Detik cadangan). Parser XML ringan berbasis regex, cukup
// untuk struktur item RSS standar.
const FEEDS = [
  { name: 'Google News ID', url: 'https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id' },
  { name: 'Detik', url: 'https://rss.detik.com/index.php/detikcom' },
]

export const config = {
  name: 'berita',
  alias: ['beritaterkini', 'news', 'cnbc'],
  category: 'search',
  description: { id: 'Berita Indonesia terbaru dari RSS publik', en: 'Latest Indonesian news from public RSS' },
  usage: '.berita',
  example: '.berita',
  cooldown: 15,
}

export const i18n = {
  id: {
    berita: {
      title: '╭─❏ 📰 「 *BERITA TERBARU* 」\n┊ ꜱᴜᴍʙᴇʀ: *{source}*\n{list}\n╰━━━━━━━',
      line: '┊ {rank}. *{title}*\n┊ {time}',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL BERITA* 」\n┊ Gagal mengambil berita dari semua sumber RSS: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    berita: {
      title: '╭─❏ 📰 「 *LATEST NEWS* 」\n┊ ꜱᴏᴜʀᴄᴇ: *{source}*\n{list}\n╰━━━━━━━',
      line: '┊ {rank}. *{title}*\n┊ {time}',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH NEWS* 」\n┊ Failed to fetch news from all RSS sources: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.berita', expect: /berita|news/i }

function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function parseRss(xml, limit = 8) {
  const items = []
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1]
    const title = decodeEntities(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
    const date = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? ''
    if (title) items.push({ title, date })
    if (items.length >= limit) break
  }
  return items
}

export async function fetchNews() {
  let lastError = null
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const items = parseRss(await res.text())
      if (items.length) return { source: feed.name, items }
      throw new Error('RSS kosong')
    } catch (err) {
      lastError = err
    }
  }
  throw lastError ?? new Error('semua sumber gagal')
}

export async function handler(ctx) {
  try {
    const { source, items } = await fetchNews()
    const list = items.map((item, i) => {
      const time = item.date ? new Date(item.date).toLocaleString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : ''
      return ctx.t('berita.line', { rank: i + 1, title: item.title, time })
    }).join('\n')
    return ctx.reply(ctx.t('berita.title', { source, list }))
  } catch (err) {
    return ctx.reply(ctx.t('berita.fail', { error: err.message }))
  }
}
