// Scraper komik Komikcast: cari komik, daftar chapter, dan daftar gambar
// chapter dari v2.komikcast.ac.
// Kredit: adaptasi dari snippet di https://paste.c-net.org/PresumeCaddy
// (Jerexd, diakses 2026-11-04). Logika parser dipertahankan; fungsi unduh
// ke folder lokal dari snippet asli TIDAK diambil (aturan proyek: tidak ada
// file media permanen), plugin cukup menerima daftar URL gambar.
import axios from 'axios'
import * as cheerio from 'cheerio'
import { assertSafeUrl } from '../runner.js'

const BASE = 'https://v2.komikcast.ac'

const client = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36' },
})

const clean = (value) => (value || '').replace(/\s+/g, ' ').trim()
const absolute = (url) => {
  try {
    return url ? new URL(url, BASE).href : ''
  } catch {
    return ''
  }
}
const pageNumber = (value) => Math.max(1, Number(value) || 1)

async function getPage(url) {
  return cheerio.load((await client.get(url)).data)
}

export function parseComicCards($) {
  const found = new Map()
  $('a[href*="comic="]').each((_, node) => {
    const a = $(node)
    const href = absolute(a.attr('href'))
    if (!href) return
    const slug = new URL(href).searchParams.get('comic')
    const alt = clean(a.find('img').attr('alt'))
    const title = clean(a.attr('title') || alt.replace(/^Cover\s+/i, '') || a.text())
    if (!slug || !title || found.has(slug)) return
    const card = a.closest('article, .comic-card, .book-card, .item, li').first()
    found.set(slug, {
      title,
      slug,
      url: href,
      cover: absolute(a.find('img').first().attr('src') || a.find('img').first().attr('data-src')),
      detail: clean(card.text()) || title,
    })
  })
  return [...found.values()]
}

export async function komikSearch(query, page = 1) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Kata kunci pencarian wajib diisi.')
  const p = pageNumber(page)
  const $ = await getPage(`/index.php?page=catalog&q=${encodeURIComponent(keyword)}&p=${p}`)
  return { status: true, query: keyword, page: p, results: parseComicCards($) }
}

export async function komikLatest(page = 1) {
  const p = pageNumber(page)
  const $ = await getPage(`/index.php?page=updates&p=${p}`)
  return { status: true, page: p, results: parseComicCards($) }
}

export async function komikDetail(input) {
  if (!input) throw new Error('Slug atau URL komik wajib diisi.')
  const raw = /^https?:\/\//i.test(input) ? assertSafeUrl(input).href : null
  const url = raw || `${BASE}/index.php?comic=${encodeURIComponent(input)}`
  const $ = await getPage(url)
  const chapters = []
  const seen = new Set()
  $('a[href*="chapter="]').each((_, node) => {
    const a = $(node)
    const chapterUrl = absolute(a.attr('href'))
    const name = clean(a.text())
    if (chapterUrl && name && !seen.has(chapterUrl)) {
      seen.add(chapterUrl)
      chapters.push({ title: name, url: chapterUrl, id: new URL(chapterUrl).searchParams.get('chapter') })
    }
  })
  return {
    status: true,
    title: clean($('h1').first().text() || $('meta[property="og:title"]').attr('content') || $('title').text()),
    url,
    cover: absolute($('meta[property="og:image"]').attr('content') || $('main img').first().attr('src')),
    description: clean($('meta[name="description"]').attr('content')),
    chapters,
  }
}

export async function komikReadChapter(input) {
  if (!input) throw new Error('URL chapter wajib diisi.')
  const raw = /^https?:\/\//i.test(input) ? assertSafeUrl(input).href : null
  const url = raw || `${BASE}/index.php?chapter=${encodeURIComponent(input)}`
  const $ = await getPage(url)
  const images = []
  const seen = new Set()
  $('img').each((_, node) => {
    const img = $(node)
    const src = img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src')
    const full = absolute(src)
    if (full && /\.(jpe?g|png|webp)(\?|$)/i.test(full) && !seen.has(full)) {
      seen.add(full)
      images.push(full)
    }
  })
  return {
    status: true,
    title: clean($('h1').first().text() || $('title').text()),
    url,
    total: images.length,
    images,
  }
}
