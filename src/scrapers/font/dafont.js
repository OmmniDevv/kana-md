// Scraper font DaFont: cari font, terbaru, terpopuler, detail, dan unduh
// file font (ZIP/TTF) sebagai Buffer.
// Kredit: adaptasi dari snippet di https://paste.c-net.org/SworeSmashed
// (Jerexd, diakses 2026-11-04). Logika parser dipertahankan; penulisan file
// lokal dari snippet asli diganti pengembalian Buffer (aturan proyek).
import axios from 'axios'
import * as cheerio from 'cheerio'
import { assertSafeUrl } from '../runner.js'

const BASE = 'https://www.dafont.com'
const DL_BASE = 'https://dl.dafont.com'

const client = axios.create({
  baseURL: BASE,
  timeout: 30000,
  responseType: 'arraybuffer',
  // dafont ber-encoding ISO-8859-1, decode via latin1 agar karakter aksen utuh.
  transformResponse: [(data) => Buffer.from(data).toString('latin1')],
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
const slugOf = (input) =>
  /^https?:\/\//i.test(input)
    ? new URL(input).pathname.replace(/\.font$/, '').replace(/^\//, '')
    : String(input).replace(/\.font$/, '').trim()

async function getPage(url) {
  return cheerio.load((await client.get(url)).data)
}

export function parseFontCards($) {
  const found = new Map()
  $('a[name]').each((_, node) => {
    const card = $(node).nextUntil('a[name]')
    const lvLeft = card.filter('div.lv1left.dfbg')
    if (!lvLeft.length) return
    const nameEl = lvLeft.find('span.highlight').first()
    const strongEl = lvLeft.find('strong').first()
    const title = clean(nameEl.text() || strongEl.text()).replace(/^\d+\.\s*/, '')
    const href = card.find('a[href$=".font"]').first().attr('href')
    if (!title || !href) return
    const slug = href.replace(/^\//, '').replace(/\.font$/, '')
    const author = clean(
      lvLeft.find('a:not(.tdn)').filter((_, a) => !($(a).attr('href') || '').includes('.font')).first().text()
    )
    const dlId = card.find('a[href*="dl.dafont"]').first().attr('href')?.match(/f=([^&]+)/)?.[1] || slug
    const metaText = clean(card.filter('div.lv2right').first().text())
    const downloads = metaText.match(/([\d,]+)\s*downloads?/i)?.[1]
    const license = clean(metaText.replace(/[\d,]+\s*downloads?.*?(?=Free|Donationware|Shareware|$)/i, '')) || ''
    const categories = card.find('a[href*="theme.php?cat="]').map((_, a) => clean($(a).text())).get().filter(Boolean)
    const preview = card.filter('div.preview').attr('style')?.match(/url\(([^)]+)\)/)?.[1]
    found.set(slug, {
      title,
      slug,
      url: absolute(`${slug}.font`),
      author,
      categories,
      license,
      downloads: downloads ? parseInt(downloads.replace(/,/g, ''), 10) : null,
      preview: absolute(preview || ''),
      downloadUrl: `${DL_BASE}/dl/?f=${dlId}`,
    })
  })
  return [...found.values()]
}

export async function fontSearch(query, page = 1) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Kata kunci pencarian wajib diisi.')
  const p = pageNumber(page)
  const $ = await getPage(`/search.php?q=${encodeURIComponent(keyword)}&page=${p}`)
  return { status: true, query: keyword, page: p, results: parseFontCards($) }
}

export async function fontLatest(page = 1) {
  const p = pageNumber(page)
  const $ = await getPage(`/new.php?page=${p}`)
  return { status: true, page: p, results: parseFontCards($) }
}

export async function fontTop(page = 1) {
  const p = pageNumber(page)
  const $ = await getPage(`/top.php?page=${p}`)
  return { status: true, page: p, results: parseFontCards($) }
}

export async function fontDetail(input) {
  if (!input) throw new Error('Slug atau URL font wajib diisi.')
  const slug = slugOf(input)
  const url = /^https?:\/\//i.test(input) ? assertSafeUrl(input).href : `${BASE}/${slug}.font`
  const $ = await getPage(url)
  const metaText = clean($('div.lv2right').first().text())
  const downloads = metaText.match(/([\d,]+)\s*downloads?/i)?.[1] || $('span.light').first().text().match(/([\d,]+)/)?.[1]
  const license =
    clean(metaText.replace(/[\d,]+\s*downloads?.*?(?=Free|Donationware|Shareware|$)/i, '')) ||
    clean($('.license, a[href*="faq"]').first().text())
  return {
    status: true,
    title: clean($('h1').first().text() || $('meta[property="og:title"]').attr('content') || $('title').text()),
    slug,
    url,
    author: clean($('div.lv1left.dfbg a:not(.tdn)').first().text()),
    categories: $('a[href*="theme.php?cat="]').map((_, a) => clean($(a).text())).get().filter(Boolean),
    license,
    downloads: downloads ? parseInt(downloads.replace(/,/g, ''), 10) : null,
    preview: absolute($('meta[property="og:image"]').attr('content') || $('div.preview').attr('style')?.match(/url\(([^)]+)\)/)?.[1] || ''),
    downloadUrl: absolute($('a[href*="dl.dafont"]').first().attr('href') || `${DL_BASE}/dl/?f=${slug}`),
    description: clean($('meta[name="description"]').attr('content')),
  }
}

// Unduh file font jadi Buffer (ZIP dari dl.dafont, tanpa transform latin1).
export async function fontDownload(input, { maxBytes = 32 * 1024 * 1024 } = {}) {
  if (!input) throw new Error('Slug atau URL font wajib diisi.')
  const info = await fontDetail(input)
  const response = await axios.get(info.downloadUrl, {
    timeout: 60000,
    responseType: 'arraybuffer',
    maxContentLength: maxBytes,
    headers: { 'User-Agent': client.defaults.headers['User-Agent'], Referer: info.url },
  })
  const buffer = Buffer.from(response.data)
  const isZip = buffer.slice(0, 2).toString('hex') === '504b'
  const valid = !isZip || buffer.includes(Buffer.from('PK\x05\x06', 'latin1'))
  return {
    status: true,
    info,
    buffer,
    filename: `${info.slug}.${isZip ? 'zip' : 'ttf'}`,
    mimeType: isZip ? 'application/zip' : 'font/ttf',
    size: buffer.length,
    type: isZip ? 'zip' : 'ttf',
    valid,
  }
}
