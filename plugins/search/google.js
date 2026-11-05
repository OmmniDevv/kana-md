// Pencarian web lewat DuckDuckGo Lite (lite.duckduckgo.com, tanpa
// kunci). Endpoint html.duckduckgo.com terblokir bot-check dari VM,
// varian lite menjawab hasil asli; terverifikasi 2026-11-05.
export const config = {
  name: 'google',
  alias: ['searchweb', 'websearch'],
  category: 'search',
  description: { id: 'Cari apa pun di web dan tampilkan daftar hasilnya', en: 'Search anything on the web and show the result list' },
  usage: '.google <kata kunci>',
  example: '.google presiden indonesia',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    google: {
      needQuery: '╭─❏ 🔍 「 *KETIK KATA KUNCINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.google presiden indonesia*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TIDAK ADA HASIL* 」\n┊ Mouu, nggak ada hasil buat kata kunci itu. Coba kata lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian web gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      header: '╭─❏ 🔍 「 *HASIL WEB: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ {snippet}\n┊ {url}',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    google: {
      needQuery: '╭─❏ 🔍 「 *TYPE THE KEYWORDS* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.google indonesia president*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO RESULTS* 」\n┊ Mouu, no results for those keywords. Try others~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, web search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🔍 「 *WEB RESULTS: {q}* 」',
      item: '┊ {n}. *{title}*\n┊ {snippet}\n┊ {url}',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.google presiden indonesia', expect: /HASIL WEB|WEB RESULTS/ }

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/<[^>]+>/g, '')
    .trim()
}

// Urai hasil dari HTML DuckDuckGo Lite menjadi daftar { title, url, snippet }.
// Halaman lite memakai kutip tunggal dan href sebelum class, jadi
// penguraian dua tahap: kumpulkan semua jangkar, saring yang berclass
// result-link, lalu ambil href dari tag pembukanya.
export function parseDdgLite(html, limit = 5) {
  const src = String(html || '')
  const snippetRe = /<td class=['"]result-snippet['"]>([\s\S]*?)<\/td>/g
  const snippets = [...src.matchAll(snippetRe)].map((m) => decodeEntities(m[1]))
  const results = []
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/g
  let i = 0
  for (const m of src.matchAll(anchorRe)) {
    if (!/class=['"]result-link['"]/.test(m[1])) continue
    const href = (m[1].match(/href=['"]([^'"]+)['"]/) || [])[1] || ''
    let url = href
    try {
      const u = new URL(url.startsWith('//') ? 'https:' + url : url)
      const real = u.searchParams.get('uddg')
      if (real) url = real
    } catch {}
    results.push({ title: decodeEntities(m[2]), url, snippet: snippets[i] || '' })
    i += 1
    if (results.length >= limit) break
  }
  return results.filter((r) => r.title && r.url)
}

async function searchWeb(query) {
  const res = await fetch(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
  })
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { search = searchWeb } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('google.needQuery'))
  let results
  try {
    results = parseDdgLite(await search(q))
  } catch (err) {
    return ctx.reply(ctx.t('google.failed', { message: err.message }))
  }
  if (!results.length) return ctx.reply(ctx.t('google.notFound'))
  const lines = [ctx.t('google.header', { q })]
  results.forEach((r, i) => {
    lines.push(ctx.t('google.item', { n: i + 1, title: r.title, snippet: r.snippet.slice(0, 140) || '-', url: r.url }))
  })
  lines.push(ctx.t('google.footer'))
  return ctx.reply(lines.join('\n'))
}
