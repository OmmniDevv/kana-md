// Scraper pencarian situs WordPress Indonesia untuk keluarga KIND-B:
// Kusonime (anime batch), Komikindo (komik), TokusatsuIndo (tokusatsu).
// Ketiganya terverifikasi menjawab HTTP 200 dari VM dengan hasil
// pencarian asli pada pola ?s=<kata kunci>. Parser per situs dipisah
// karena struktur kartu hasilnya berbeda.
import * as cheerio from 'cheerio'
import { randomUserAgent } from '../runner.js'

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Situs balas HTTP ${res.status}`)
  return res.text()
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()

export function parseKusonime(html, limit = 8) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('h2 a[href], .title a[href], .posttitle a[href]').each((_, a) => {
    if (rows.length >= limit) return
    const href = $(a).attr('href') || ''
    const title = clean($(a).text())
    if (!title || !/kusonime\.com\//.test(href) || seen.has(href)) return
    seen.add(href)
    rows.push({ title, url: href })
  })
  return rows
}

export function parseKomikindo(html, limit = 8) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('.animepost').each((_, el) => {
    if (rows.length >= limit) return
    const $el = $(el)
    const $a = $el.find('a[href]').first()
    const href = $a.attr('href') || ''
    const title = clean($el.find('.tt, .title, h3, h2').first().text() || $a.attr('title') || $a.text())
    if (!title || !href || seen.has(href)) return
    seen.add(href)
    const type = clean($el.find('.typeflag, .type').first().text())
    rows.push({ title, url: href, type: type || null })
  })
  return rows
}

export function parseTokusatsu(html, limit = 8) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('article').each((_, el) => {
    if (rows.length >= limit) return
    const $el = $(el)
    let $a = $el.find('h1 a[href], h2 a[href], h3 a[href], .entry-title a[href], a[rel="bookmark"]').first()
    if (!$a.length) {
      $a = $el.find('a[href]').filter((_, x) => {
        const h = $(x).attr('href') || ''
        return /tokusatsuindo\.com\/[a-z0-9-]+\/$/.test(h) && !/\/(category|tag|page|search|author)\//.test(h)
      }).first()
    }
    const href = $a.attr('href') || ''
    if (!href || seen.has(href)) return
    seen.add(href)
    let title = clean($a.attr('title') || $a.text())
    if (!title || /watch|download/i.test(title)) {
      const slug = href.replace(/\/$/, '').split('/').pop() || ''
      title = clean(slug.replace(/-/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase())
    }
    if (title) rows.push({ title, url: href })
  })
  return rows
}

export async function kusonimeSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Kata kunci wajib diisi')
  return parseKusonime(await fetchHtml(`https://kusonime.com/?s=${encodeURIComponent(q)}`), limit)
}

export async function komikindoSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Kata kunci wajib diisi')
  return parseKomikindo(await fetchHtml(`https://komikindo.ch/?s=${encodeURIComponent(q)}`), limit)
}

export async function tokusatsuSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Kata kunci wajib diisi')
  return parseTokusatsu(await fetchHtml(`https://www.tokusatsuindo.com/?s=${encodeURIComponent(q)}`), limit)
}
