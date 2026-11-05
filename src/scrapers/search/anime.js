// Scraper anime dan manga lewat Jikan v4 (API publik MyAnimeList, tanpa key).
// Cadangan (ditambahkan 2026-11-05 saat sapuan live): scrape langsung
// myanimelist.net (halaman pencarian + detail), dipakai bila
// api.jikan.moe tidak terjangkau sama sekali dari jaringan bot
// (terbukti HTTP 000 berulang dari VM bot; situs MAL-nya sendiri
// menjawab 200). Bentuk hasil dinormalisasi sama persis dengan jalur
// Jikan supaya plugin tidak perlu tahu sumbernya.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://api.jikan.moe/v4'
const MAL = 'https://myanimelist.net'

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

async function searchViaJikan(keyword, kind, limit) {
  return withBreaker('jikan', () =>
    retry(async () => {
      const res = await fetch(`${BASE}/${kind}?q=${encodeURIComponent(keyword)}&limit=${limit}&sfw=true`, {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Jikan balas HTTP ${res.status}`)
      const json = await res.json()
      const results = (json.data || []).map((entry) => normalizeJikanEntry(entry, kind)).filter(Boolean)
      return { query: keyword, type: kind, results }
    })
  )
}

// URL entri unik dari halaman pencarian MAL, urut sesuai tampilan.
// Tautan turunan (/video, /pics, dan sebagainya) dibuang.
export function parseMalSearchUrls(html, kind = 'anime') {
  if (!html) return []
  const $ = cheerio.load(html)
  const seen = new Set()
  const urls = []
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href') || ''
    const m = href.match(new RegExp(`^https://myanimelist\\.net/${kind}/(\\d+)/[^/?#]+$`))
    if (m && !seen.has(href)) {
      seen.add(href)
      urls.push(href)
    }
  })
  return urls
}

// Parse halaman detail MAL menjadi bentuk ternormalisasi yang sama
// dengan normalizeJikanEntry.
export function parseMalDetail(html, url, kind = 'anime') {
  if (!html) return null
  const $ = cheerio.load(html)
  const field = (label) => {
    let value = null
    $('span.dark_text').each((_, el) => {
      if ($(el).text().trim() === label) value = $(el).parent().text().replace(label, '').replace(/\s+/g, ' ').trim()
    })
    return value
  }
  const titleMain = $('h1.title-name').text().replace(/\s+/g, ' ').trim()
  const scoreRaw = parseFloat($('.score-label').first().text())
  const countRaw = parseInt(field(kind === 'manga' ? 'Chapters:' : 'Episodes:'), 10)
  let synopsis = $('[itemprop="description"]').text().replace(/\s+/g, ' ').trim()
  synopsis = synopsis.replace(/\s*\[Written by MAL Rewrite\]\s*$/, '')
  const idMatch = String(url).match(/\/(?:anime|manga)\/(\d+)\//)
  return {
    id: idMatch ? Number(idMatch[1]) : null,
    type: kind,
    title: field('English:') || titleMain || '-',
    titleJapanese: field('Japanese:') || null,
    score: Number.isFinite(scoreRaw) ? scoreRaw : null,
    count: Number.isFinite(countRaw) ? countRaw : null,
    status: field('Status:') || null,
    synopsis: synopsis.length > 400 ? `${synopsis.slice(0, 400).trimEnd()}...` : synopsis,
    url,
    image: $('meta[property="og:image"]').attr('content') || null,
  }
}

async function fetchMalHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`MyAnimeList balas HTTP ${res.status}`)
  return res.text()
}

async function searchViaMal(keyword, kind, limit) {
  const listHtml = await fetchMalHtml(`${MAL}/${kind}.php?q=${encodeURIComponent(keyword)}&cat=${kind}`)
  const urls = parseMalSearchUrls(listHtml, kind).slice(0, limit)
  const results = []
  for (const url of urls) {
    try {
      const entry = parseMalDetail(await fetchMalHtml(url), url, kind)
      if (entry) results.push(entry)
    } catch {
      // Satu entri gagal diambil tidak menggagalkan seluruh pencarian.
    }
  }
  return { query: keyword, type: kind, results }
}

export async function searchAnime(query, { type = 'anime', limit = 5 } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Judul wajib diisi')
  const kind = type === 'manga' ? 'manga' : 'anime'
  try {
    return await searchViaJikan(keyword, kind, limit)
  } catch {
    // Jikan tidak terjangkau dari jaringan ini: pakai situs MAL
    // langsung. Hasil kosong yang sah dari Jikan tidak memicu jalur
    // ini (hanya error yang memicu).
    return searchViaMal(keyword, kind, limit)
  }
}
