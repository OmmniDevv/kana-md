// Scraper Facebook: unduh video/reel lewat snapsave.app.
// Sumber: kode kiriman user (owner) 2026-11-04, logika inti dipertahankan
// (termasuk dekode skrip ter-packing dari SnapSave). Nama fungsi dinetralkan.
// Adaptasi kana-md: proteksi SSRF dan validasi host Facebook.
import axios from 'axios'
import * as cheerio from 'cheerio'
import { assertSafeUrl } from '../runner.js'

const BASE = 'https://snapsave.app'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FB_HOST = /(^|\.)facebook\.com$|(^|\.)fb\.watch$|(^|\.)fb\.gg$/i

// Dekode eval-packer (h,u,n,t,e,r) yang dipakai halaman hasil SnapSave.
function decodePacked(data) {
  try {
    const regex = /eval\(function\(h,u,n,t,e,r\)\{.*?\}\("(.*?)",(\d+),"(.*?)",(\d+),(\d+),(\d+)\)\)/
    const match = data.match(regex)
    if (!match) return data
    const h = match[1]
    const n = match[3]
    const t = parseInt(match[4], 10)
    const e = parseInt(match[5], 10)
    const delimiter = n[e]
    const parts = h.split(delimiter)
    let decoded = ''
    for (const part of parts) {
      if (!part) continue
      let value = 0
      for (let j = 0; j < part.length; j++) {
        value += n.indexOf(part[j]) * Math.pow(e, part.length - 1 - j)
      }
      decoded += String.fromCharCode(value - t)
    }
    return decodeURIComponent(escape(decoded))
  } catch {
    return data
  }
}

// Normalisasi kandidat link unduhan (bisa berisi token JWT berisi URL asli).
function extractDownload(input) {
  if (!input || typeof input !== 'string') return null
  let raw = input.trim().replace(/^["'\\]+|["'\\]+$/g, '')
  let isRender = false
  if (raw.includes('get_progressApi')) {
    isRender = true
    const token = raw.match(/token=([^&'"]+)/)
    if (token) raw = decodeURIComponent(token[1])
  }
  if (raw.includes('.') && !raw.startsWith('http')) {
    try {
      const payloadPart = raw.split('.')[1]
      if (payloadPart) {
        const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'))
        if (payload.video_url) return { url: payload.video_url, isRender: true }
        if (payload.url) return { url: payload.url, isRender: false }
      }
    } catch {}
  }
  if (raw.startsWith('//')) return { url: `https:${raw}`, isRender }
  if (raw.startsWith('/')) return { url: `${BASE}${raw}`, isRender }
  return { url: raw, isRender }
}

async function fetchDownloads(url) {
  const headers = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    Origin: BASE,
    Referer: `${BASE}/id`,
  }

  let finalUrl = url.trim()
  try {
    const redirect = await axios.get(finalUrl, { headers, maxRedirects: 5, timeout: 10000 })
    finalUrl = redirect.request?.res?.responseUrl || finalUrl
  } catch {}

  const page = await axios.get(`${BASE}/id`, { headers, timeout: 15000 })
  const cookies = page.headers['set-cookie'] || []
  const cookieStr = cookies.map((cookie) => cookie.split(';')[0]).join('; ')

  const params = new URLSearchParams()
  params.append('url', finalUrl)
  const response = await axios.post(`${BASE}/action.php?lang=id`, params.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookieStr },
    timeout: 20000,
  })

  const html = typeof response.data === 'string' ? decodePacked(response.data) : ''
  const $ = cheerio.load(html)
  const downloads = []

  $('table tbody tr').each((_, element) => {
    const row = $(element)
    const quality = row.find('td.video-quality').text().trim() || row.find('td').eq(0).text().trim() || 'Normal'
    const renderStatus = row.find('td').eq(1).text().trim().toLowerCase()
    const link =
      row.find('a.btn-download').attr('href') || row.find('button').attr('onclick') || row.find('a').attr('href')
    const extracted = extractDownload(link)
    if (!extracted?.url || !/^https?:\/\//i.test(extracted.url)) return
    const hasAudio = ['no', 'tidak'].includes(renderStatus) || !extracted.isRender
    if (downloads.some((item) => item.url === extracted.url)) return
    downloads.push({ quality, url: extracted.url, hasAudio, type: 'video' })
  })

  downloads.sort((a, b) => {
    if (a.hasAudio !== b.hasAudio) return a.hasAudio ? -1 : 1
    const rank = (value) => (/hd|1080|720/i.test(value) ? 0 : 1)
    return rank(a.quality) - rank(b.quality)
  })

  if (!downloads.length) {
    throw new Error('Could not extract download links.')
  }

  return { status: true, result: { title: 'Facebook Video', thumbnail: '', type: 'video', downloads } }
}

export async function facebookDownload(url) {
  try {
    const parsed = assertSafeUrl(url)
    if (!FB_HOST.test(parsed.hostname)) throw new Error('URL harus dari facebook.com atau fb.watch')
    return await fetchDownloads(parsed.href)
  } catch (error) {
    return { status: false, message: error.message || 'Failed to scrape Facebook via SnapSave.' }
  }
}

export default facebookDownload
