// Scraper anime dan manga lewat Jikan v4 (API publik MyAnimeList, tanpa key).
import { retry, withBreaker } from '../runner.js'

const BASE = 'https://api.jikan.moe/v4'

export function normalizeJikanEntry(entry, type = 'anime') {
  if (!entry || typeof entry !== 'object') return null
  const synopsis = String(entry.synopsis || '').trim()
  return {
    id: entry.mal_id ?? null,
    type,
    title: entry.title_english || entry.title || '-',
    titleJapanese: entry.title_japanese || null,
    score: typeof entry.score === 'number' ? entry.score : null,
    count: type === 'manga' ? entry.chapters ?? null : entry.episodes ?? null,
    status: entry.status || null,
    synopsis: synopsis.length > 400 ? `${synopsis.slice(0, 400).trimEnd()}...` : synopsis,
    url: entry.url || null,
    image: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || null,
  }
}

export async function searchAnime(query, { type = 'anime', limit = 5 } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Judul wajib diisi')
  const kind = type === 'manga' ? 'manga' : 'anime'
  return withBreaker('jikan', () =>
    retry(async () => {
      const res = await fetch(`${BASE}/${kind}?q=${encodeURIComponent(keyword)}&limit=${limit}&sfw=true`, {
        signal: AbortSignal.timeout(20000),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Jikan balas HTTP ${res.status}`)
      const json = await res.json()
      const results = (json.data || []).map((entry) => normalizeJikanEntry(entry, kind)).filter(Boolean)
      return { query: keyword, type: kind, results }
    })
  )
}
