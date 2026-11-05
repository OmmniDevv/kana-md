// Scraper XNXX: pencarian dan detail video dari xnxx.com, situs video
// dewasa publik. Ditulis ulang gaya KANA dari perilaku RYO-YAMADA-MD
// plugins/nsfw/xnxx.js (perintah owner 2026-11-05: port NSFW dewasa
// sebagai fitur premium). Versi RYO memakai proksi CORS pihak ketiga;
// dari VM KANA situs aslinya terjangkau langsung (probe 2026-11-05:
// halaman pencarian HTTP 200, halaman video memuat URL mp4 CDN langsung,
// berkas mp4 terverifikasi magic ftyp), jadi proksi tidak dipakai.
import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE = 'https://www.xnxx.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export function isXnxxUrl(raw) {
  try {
    const u = new URL(String(raw ?? ''))
    return /(^|\.)xnxx\.com$/i.test(u.hostname)
  } catch {
    return false
  }
}

export function isMp4Buffer(buf) {
  return Buffer.isBuffer(buf) && buf.length >= 8 && buf.toString('latin1', 4, 8) === 'ftyp'
}

// Urai HTML halaman pencarian xnxx menjadi daftar hasil bersih.
export function parseXnxxSearch(html) {
  const $ = cheerio.load(String(html ?? ''))
  const results = []
  $('div[id*="video_"]').each((_, el) => {
    const box = $(el)
    const link = box.find('.thumb-inside .thumb a').attr('href') || ''
    const titleAttr = box.find('.thumb-under p:first-of-type a').attr('title')
    const titleText = box.find('.thumb-under p:first-of-type a').text().trim()
    const title = (titleAttr || titleText || '').trim()
    if (!title || !link) return
    const meta = box.find('.thumb-under p.metadata')
    const duration = meta
      .contents()
      .filter((_, n) => n.type === 'text')
      .map((_, n) => $(n).text().trim())
      .get()
      .filter(Boolean)
      .join('')
      .trim()
    const resolution = (meta.find('span.video-hd').text().match(/\d{3,4}p/) || [''])[0]
    results.push({
      title,
      url: link.startsWith('http') ? link : BASE + link,
      duration,
      resolution,
      thumbnail: box.find('.thumb-inside .thumb img').attr('data-src') || null,
    })
  })
  return results
}

// Urai HTML halaman video xnxx menjadi metadata + URL mp4 langsung.
export function parseXnxxDetail(html) {
  const source = String(html ?? '')
  const pick = (re) => {
    const m = source.match(re)
    return m ? m[1] : null
  }
  const low = pick(/html5player\.setVideoUrlLow\('(.*?)'\);/)
  const high = pick(/html5player\.setVideoUrlHigh\('(.*?)'\);/)
  const hls = pick(/html5player\.setVideoHLS\('(.*?)'\);/)
  if (!low && !high && !hls) return null
  const title =
    pick(/html5player\.setVideoTitle\('(.*?)'\);/) ||
    pick(/<meta property="og:title" content="([^"]*)"/) ||
    'XNXX Video'
  const thumb = pick(/html5player\.setThumbUrl169\('(.*?)'\);/) || pick(/html5player\.setThumbUrl\('(.*?)'\);/)
  return { title, thumbnail: thumb, videos: { low, high, hls } }
}

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: { 'User-Agent': UA },
    timeout: 30000,
    responseType: 'text',
  })
  return res.data
}

export async function searchXnxx(query, { limit = 10 } = {}) {
  const html = await fetchHtml(`${BASE}/search/${encodeURIComponent(String(query ?? '').trim())}`)
  return parseXnxxSearch(html).slice(0, limit)
}

export async function detailXnxx(url) {
  if (!isXnxxUrl(url)) throw new Error('Bukan tautan xnxx')
  const html = await fetchHtml(url)
  const detail = parseXnxxDetail(html)
  if (!detail) throw new Error('Detail video tidak ditemukan')
  return detail
}
