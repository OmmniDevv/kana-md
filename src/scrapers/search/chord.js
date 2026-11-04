// Scraper chord gitar dari chordtela.com: cari lewat halaman pencarian
// WordPress (?s=), ambil halaman chord pertama, ekstrak teks dari <pre>
// atau blok konten artikel. Hasil pencarian chordtela sebagian dirender
// sisi klien; bila tautan hasil tidak ditemukan di HTML, fungsi ini
// melempar error jujur agar plugin menjawab sumber belum bisa dijangkau.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://www.chordtela.com'

const NAV_PATHS = new Set([
  '', 'daftar-isi', 'buku-tamu-chordtela', 'tool-transpose-chord-by-chordtela-com',
  'search', 'tentang-kami', 'privacy-policy', 'disclaimer', 'contact', 'dmca',
])

const clean = (value) => (value || '').replace(/\s+/g, ' ').trim()

export function parseChordSearchResults(html) {
  if (!html) return []
  const $ = cheerio.load(html)
  const results = []
  const seen = new Set()
  $('a[href]').each((_, a) => {
    const $a = $(a)
    // Lewati tautan di sidebar, widget, navigasi, header, dan footer:
    // widget "Chord Terbaru" di sidebar bukan hasil pencarian.
    if ($a.closest('.sidebar, .widget, aside, nav, header, footer, .header, .footer').length) return
    const href = $a.attr('href') || ''
    if (!href.startsWith(BASE)) return
    let path
    try {
      path = new URL(href).pathname.replace(/^\/+|\/+$/g, '')
    } catch {
      return
    }
    if (!path || NAV_PATHS.has(path)) return
    if (/^(chord-gitar-|category|author|page|wp-|feed)/.test(path)) return
    // Posting chordtela (Blogger) selalu berformat /YYYY/MM/slug.html;
    // tautan lain di badan halaman (about, disclaimer, dsb.) bukan hasil.
    if (!/^\d{4}\/\d{2}\/.+\.html$/.test(path)) return
    if (seen.has(href)) return
    const title = clean($(a).text())
    if (title.length < 3) return
    seen.add(href)
    results.push({ title, url: href })
  })
  return results.slice(0, 5)
}

export function extractChordText(html) {
  if (!html) return null
  const $ = cheerio.load(html)
  const pre = $('pre').first().text()
  if (pre && pre.trim().length > 20) return pre.replace(/\n{3,}/g, '\n\n').trim()
  const block = $('.entry-content, article .post-content, .post-body, article').first().text()
  const text = (block || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return text.length > 20 ? text : null
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`Chordtela balas HTTP ${res.status}`)
  return res.text()
}

export async function searchChord(query) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Judul lagu wajib diisi')
  return withBreaker('chordtela', () =>
    retry(async () => {
      const searchHtml = await fetchHtml(`${BASE}/?s=${encodeURIComponent(keyword)}`)
      const results = parseChordSearchResults(searchHtml)
      if (!results.length) throw new Error('Hasil chord tidak ditemukan di halaman pencarian')
      const first = results[0]
      const pageHtml = await fetchHtml(first.url)
      const text = extractChordText(pageHtml)
      if (!text) throw new Error('Teks chord tidak ditemukan di halaman lagu')
      return { query: keyword, title: first.title, url: first.url, text, results }
    })
  )
}
