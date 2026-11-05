import * as cheerio from 'cheerio'

// Cari judul di Naver Webtoon (webtoons.com) dari hasil pencarian
// resminya. Terverifikasi 2026-11-05: kartu hasil membawa judul,
// genre, dan jumlah suka.
export const config = {
  name: 'webtoonsearch',
  alias: ['webtoon', 'cariwebtoon'],
  category: 'search',
  description: { id: 'Cari judul webtoon di webtoons.com', en: 'Search webtoon titles on webtoons.com' },
  usage: '.webtoonsearch <judul>',
  example: '.webtoonsearch Tower of God',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    webtoonsearch: {
      needQuery: '╭─❏ 📚 「 *KETIK JUDULNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.webtoonsearch Tower of God*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *JUDUL TIDAK KETEMU* 」\n┊ Mouu, webtoon itu nggak ketemu di webtoons.com~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian webtoon gagal: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 📚 「 *WEBTOON: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ 🎭 {genre} | 💚 {likes}\n┊ {link}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    webtoonsearch: {
      needQuery: '╭─❏ 📚 「 *TYPE THE TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.webtoonsearch Tower of God*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TITLE NOT FOUND* 」\n┊ Mouu, that webtoon was not found on webtoons.com~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, webtoon search failed: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 📚 「 *WEBTOON: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ 🎭 {genre} | 💚 {likes}\n┊ {link}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.webtoonsearch Tower of God', expect: /Tower of God|WEBTOON:/ }

export function parseWebtoonSearch(html, limit = 5) {
  const $ = cheerio.load(String(html || ''))
  const out = []
  $('a.link._card_item, a.card_item, .challenge_lst a, .card_lst a').each((_, el) => {
    if (out.length >= limit) return
    const a = $(el)
    const href = a.attr('href') || ''
    if (!href.includes('webtoons.com')) return
    const title = (a.find('.subj').first().text() || a.attr('title') || a.text()).trim().replace(/\s+/g, ' ').slice(0, 80)
    if (!title) return
    out.push({
      title,
      genre: (a.find('.genre').first().text() || '-').trim(),
      likes: (a.find('.like').first().text() || a.find('[class*=like]').first().text() || '-').trim().replace(/\s+/g, ' ') || '-',
      link: href.startsWith('http') ? href : `https://www.webtoons.com${href}`,
    })
  })
  return out
}

async function searchWebtoon(query) {
  const res = await fetch(`https://www.webtoons.com/en/search?keyword=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`Webtoon HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { search = searchWebtoon } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('webtoonsearch.needQuery'))
  let results
  try {
    results = parseWebtoonSearch(await search(q))
  } catch (err) {
    return ctx.reply(ctx.t('webtoonsearch.failed', { message: err.message }))
  }
  if (!results.length) return ctx.reply(ctx.t('webtoonsearch.notFound'))
  const lines = [ctx.t('webtoonsearch.header', { q })]
  results.forEach((r, i) => lines.push(ctx.t('webtoonsearch.item', { n: i + 1, ...r })))
  lines.push(ctx.t('webtoonsearch.footer'))
  return ctx.reply(lines.join('\n'))
}
