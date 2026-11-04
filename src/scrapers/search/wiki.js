// Scraper Wikipedia: ringkasan artikel lewat REST API resmi
// (api/rest_v1/page/summary). Coba bahasa Indonesia dulu, fallback Inggris.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASES = ['https://id.wikipedia.org', 'https://en.wikipedia.org']

export function parseWikiSummary(json) {
  if (!json || typeof json !== 'object' || !json.title) return null
  const extract = String(json.extract || '').trim()
  return {
    title: json.title,
    description: json.description || '',
    extract: extract.length > 1200 ? `${extract.slice(0, 1200).trimEnd()}...` : extract,
    thumbnail: json.thumbnail?.source || json.originalimage?.source || null,
    url: json.content_urls?.desktop?.page || null,
    lang: json.lang || null,
  }
}

async function fetchSummary(base, title) {
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Wikipedia balas HTTP ${res.status}`)
  return parseWikiSummary(await res.json())
}

export async function getWikiSummary(title) {
  const query = String(title || '').trim()
  if (!query) throw new Error('Judul artikel wajib diisi')
  return withBreaker('wikipedia', () =>
    retry(async () => {
      for (const base of BASES) {
        const summary = await fetchSummary(base, query)
        if (summary && summary.extract) return summary
      }
      return null
    })
  )
}
