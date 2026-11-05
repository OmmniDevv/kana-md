// Pencarian web tanpa kunci. Jalur utama Bing (www.bing.com/search,
// HTML hasil b_algo) karena DuckDuckGo Lite sejak 2026-11-06 membalas
// HTTP 202 berisi halaman anomaly/bot-check tanpa hasil sesudah
// beberapa permintaan dari VM (kasus live .google membalas TIDAK ADA
// HASIL untuk "presiden indonesia"). DDG Lite tetap dipakai sebagai
// cadangan bila Bing kosong; halaman anomaly DDG tidak memuat jangkar
// result-link sehingga parsernya membalas kosong dan rantai lanjut.
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

export const test = { input: '.google presiden indonesia', expect: /HASIL WEB: presiden indonesia[\s\S]*https?:\/\// }

function decodeEntities(s) {
  return String(s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
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

// URL hasil Bing dibungkus pengalihan /ck/a dengan parameter u berbentuk
// 'a1' + base64 URL asli. Kembalikan URL asli bila pola itu ketemu.
export function unwrapBingUrl(href) {
  try {
    const u = new URL(href, 'https://www.bing.com')
    const raw = u.searchParams.get('u')
    if (raw && raw.startsWith('a1')) {
      const b64 = raw.slice(2).replace(/-/g, '+').replace(/_/g, '/')
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
      const decoded = Buffer.from(padded, 'base64').toString('utf8')
      if (/^https?:\/\//.test(decoded)) return decoded
    }
    return u.toString()
  } catch {
    return href
  }
}

// Urai hasil dari HTML Bing menjadi daftar { title, url, snippet }.
// Blok hasil adalah <li class="b_algo"> berisi <h2><a>judul</a></h2>
// dan cuplikan di <p class="b_lineclamp2"> (di dalam div.b_caption).
export function parseBingResults(html, limit = 5) {
  const src = String(html || '')
  const blocks = src.split(/<li class="b_algo"/).slice(1)
  const results = []
  for (const block of blocks) {
    const anchor = block.match(/<h2>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/)
    if (!anchor) continue
    const title = decodeEntities(anchor[2])
    const url = unwrapBingUrl(decodeEntities(anchor[1].replace(/&amp;/g, '&')))
    const snippetMatch = block.match(/<p class="b_lineclamp2"[^>]*>([\s\S]*?)<\/p>/) || block.match(/<div class="b_caption">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)
    let snippet = snippetMatch ? decodeEntities(snippetMatch[1]) : ''
    snippet = snippet.replace(/^\d{1,2} \w{3,9} \d{4}\s*[·•]?\s*/, '').replace(/^\w{3,9} \d{1,2}, \d{4}\s*[·•]?\s*/, '')
    if (title && /^https?:\/\//.test(url)) results.push({ title, url, snippet })
    if (results.length >= limit) break
  }
  return results
}

async function searchBing(query) {
  const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(20000),
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
      'accept-language': 'id-ID,id;q=0.9,en;q=0.7',
    },
  })
  if (!res.ok) throw new Error(`Bing HTTP ${res.status}`)
  return res.text()
}

export async function handler(ctx, { bing = searchBing, ddg = searchWeb } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('google.needQuery'))
  let results = []
  let lastErr = null
  try {
    results = parseBingResults(await bing(q))
  } catch (err) {
    lastErr = err
  }
  if (!results.length) {
    try {
      results = parseDdgLite(await ddg(q))
    } catch (err) {
      lastErr = err
    }
  }
  if (!results.length && lastErr) {
    return ctx.reply(ctx.t('google.failed', { message: lastErr.message }))
  }
  if (!results.length) return ctx.reply(ctx.t('google.notFound'))
  const lines = [ctx.t('google.header', { q })]
  results.forEach((r, i) => {
    lines.push(ctx.t('google.item', { n: i + 1, title: r.title, snippet: r.snippet.slice(0, 140) || '-', url: r.url }))
  })
  lines.push(ctx.t('google.footer'))
  return ctx.reply(lines.join('\n'))
}
