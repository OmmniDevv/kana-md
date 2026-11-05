// Cari cerita di Wattpad lewat API v3 publik Wattpad (tanpa kunci).
// Terverifikasi 2026-11-05: pencarian mengembalikan judul, penulis,
// jumlah bagian, vote, dan bacaan.
export const config = {
  name: 'wattpadsearch',
  alias: ['wattpad', 'cariwattpad'],
  category: 'search',
  description: { id: 'Cari cerita di Wattpad dari kata kunci', en: 'Search Wattpad stories by keyword' },
  usage: '.wattpadsearch <kata kunci>',
  example: '.wattpadsearch cinta',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    wattpadsearch: {
      needQuery: '╭─❏ 📖 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.wattpadsearch cinta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CERITA TIDAK KETEMU* 」\n┊ Mouu, nggak ada cerita Wattpad buat kata kunci itu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian Wattpad gagal: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 📖 「 *WATTPAD: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ ✍️ {author} | 📚 {parts} bagian | ⭐ {votes} | 👁️ {reads}\n┊ {link}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    wattpadsearch: {
      needQuery: '╭─❏ 📖 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.wattpadsearch love*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO STORIES FOUND* 」\n┊ Mouu, no Wattpad stories for those keywords~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, Wattpad search failed: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 📖 「 *WATTPAD: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ ✍️ {author} | 📚 {parts} parts | ⭐ {votes} | 👁️ {reads}\n┊ {link}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.wattpadsearch cinta', expect: /WATTPAD:/ }

export function parseWattpad(json, limit = 5) {
  const stories = json?.stories
  if (!Array.isArray(stories)) return []
  return stories.slice(0, limit).map((s) => ({
    title: s.title || '-',
    author: s.user?.name || '-',
    parts: s.numParts ?? 0,
    votes: Number(s.voteCount || 0).toLocaleString('id-ID'),
    reads: Number(s.readCount || 0).toLocaleString('id-ID'),
    link: s.id ? `https://www.wattpad.com/story/${s.id}` : 'https://www.wattpad.com',
  }))
}

async function searchWattpad(query) {
  const fields = 'stories(id,title,user(name),numParts,voteCount,readCount)'
  const url = `https://www.wattpad.com/api/v3/stories?query=${encodeURIComponent(query)}&limit=5&fields=${encodeURIComponent(fields)}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Wattpad HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { search = searchWattpad } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('wattpadsearch.needQuery'))
  let stories
  try {
    stories = parseWattpad(await search(q))
  } catch (err) {
    return ctx.reply(ctx.t('wattpadsearch.failed', { message: err.message }))
  }
  if (!stories.length) return ctx.reply(ctx.t('wattpadsearch.notFound'))
  const lines = [ctx.t('wattpadsearch.header', { q })]
  stories.forEach((s, i) => lines.push(ctx.t('wattpadsearch.item', { n: i + 1, ...s })))
  lines.push(ctx.t('wattpadsearch.footer'))
  return ctx.reply(lines.join('\n'))
}
