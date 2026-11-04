// Scraper pencarian gambar Bing: parse atribut murl (media URL) dari HTML
// hasil pencarian gambar. Tidak butuh API key.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export function parseBingImages(html, limit = 5) {
  if (!html) return []
  const urls = []
  const seen = new Set()
  const patterns = [/murl&quot;:&quot;(.*?)&quot;/g, /"murl":"(.*?)"/g]
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      let url = match[1]
      try {
        url = JSON.parse(`"${url.replace(/"/g, '\\"')}"`)
      } catch {
        url = match[1].replace(/&amp;/g, '&')
      }
      if (/^https?:\/\//.test(url) && /\.(jpe?g|png|webp)/i.test(url) && !seen.has(url)) {
        seen.add(url)
        urls.push(url)
        if (urls.length >= limit) return urls
      }
    }
  }
  return urls
}

export async function searchImages(query, { limit = 5 } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Kata kunci gambar wajib diisi')
  return withBreaker('bing-images', () =>
    retry(async () => {
      const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(keyword)}`, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
      })
      if (!res.ok) throw new Error(`Bing balas HTTP ${res.status}`)
      const html = await res.text()
      return { query: keyword, results: parseBingImages(html, limit) }
    })
  )
}
