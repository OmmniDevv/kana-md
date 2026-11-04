// Scraper Instagram: unduh foto/video/reel lewat snapsave.app action.php.
// Sumber: kode kiriman user (owner) 2026-11-04, logika inti dipertahankan.
// Nama fungsi dinetralkan. Adaptasi kana-md: proteksi SSRF dan validasi
// host instagram.com.
import axios from 'axios'
import * as cheerio from 'cheerio'
import { assertSafeUrl } from '../runner.js'

const IG_HOST = /(^|\.)instagram\.com$/i

// Ambil HTML dari respons SnapSave yang kadang dibungkus innerHTML string.
function unwrapHtml(str) {
  if (typeof str !== 'string') return ''
  let out = ''
  const dq = str.indexOf('innerHTML = "')
  if (dq !== -1) {
    const start = dq + 'innerHTML = "'.length
    const endQuote = str.lastIndexOf('";')
    const end = endQuote !== -1 ? endQuote : str.lastIndexOf('"')
    if (end > start) {
      const raw = str.slice(start, end)
      try {
        out = JSON.parse(`"${raw}"`)
      } catch {
        out = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }
    }
  }
  if (!out) {
    const sq = str.indexOf("innerHTML = '")
    if (sq !== -1) {
      const start = sq + "innerHTML = '".length
      const endQuote = str.lastIndexOf("';")
      const end = endQuote !== -1 ? endQuote : str.lastIndexOf("'")
      if (end > start) {
        const raw = str.slice(start, end)
        out = raw.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
      }
    }
  }
  return out
}

function cleanUrl(input) {
  if (!input) return null
  let s = input.trim().replace(/^["'\\]+|["'\\]+$/g, '')
  if (s.startsWith('//')) s = `https:${s}`
  return /^https?:\/\//i.test(s) ? s : null
}

// Link unduhan SnapSave bisa berisi token JWT yang payloadnya URL CDN asli.
function unwrapTokenUrl(input) {
  const cleaned = cleanUrl(input)
  if (!cleaned) return null
  try {
    const token = cleaned.match(/token=([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/)
    if (token) {
      const payload = token[1].split('.')[1]
      if (payload) {
        const decoded = JSON.parse(
          Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        )
        if (decoded?.url) return decoded.url
      }
    }
  } catch {}
  return cleaned
}

export async function instagramDownload(url) {
  try {
    const parsed = assertSafeUrl(url)
    if (!IG_HOST.test(parsed.hostname)) throw new Error('URL harus dari instagram.com')
    const target = parsed.href.split('?')[0]

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: 'https://snapsave.app',
      Referer: 'https://snapsave.app/',
    }

    const response = await axios.post('https://snapsave.app/action.php', `url=${encodeURIComponent(target)}`, {
      headers,
      timeout: 15000,
    })

    let html = ''
    const raw = response.data
    if (typeof raw === 'string' && raw.trim().startsWith('<')) html = raw
    else if (typeof raw === 'string') html = unwrapHtml(raw)
    if (!html) throw new Error('Empty response from SnapSave.')

    const $ = cheerio.load(html)
    const results = []
    const visited = new Set()

    $('.download-items, .download-box, table tbody tr').each((_, element) => {
      const item = $(element)
      const thumbnail =
        cleanUrl(item.find('.download-items__thumb img, .thumbnail img, img').first().attr('src')) || ''
      item
        .find('a.abutton, .download-items__btn a, a[href*="rapidcdn"], a[href*="snapcdn"], a.btn-download, a[href^="http"]')
        .each((_, anchor) => {
          const link = cleanUrl($(anchor).attr('href'))
          if (!link || link.includes('snapsave.app') || link.includes('play.google.com') || visited.has(link)) return
          visited.add(link)
          const label = $(anchor).text().trim().toLowerCase()
          const photo = label.includes('photo') || label.includes('image') || link.includes('/image')
          results.push({
            quality: photo ? 'photo' : '720p',
            type: photo ? 'photo' : 'video',
            url: unwrapTokenUrl(link),
            thumbnail: thumbnail || undefined,
          })
        })
      item.find('select option').each((_, option) => {
        const link = cleanUrl($(option).attr('value'))
        if (!link || link.includes('snapsave.app') || visited.has(link)) return
        visited.add(link)
        const quality = $(option).text().trim() || 'HD'
        const photo = /photo|image/i.test(quality)
        results.push({
          quality: photo ? 'photo' : quality,
          type: photo ? 'photo' : 'video',
          url: unwrapTokenUrl(link),
          thumbnail: thumbnail || undefined,
        })
      })
    })

    if (!results.length) {
      $('a[href^="http"], a[href*="rapidcdn"], a[href*="snapcdn"]').each((_, anchor) => {
        const link = cleanUrl($(anchor).attr('href'))
        if (!link || link.includes('snapsave.app') || link.includes('play.google.com') || visited.has(link)) return
        visited.add(link)
        const photo = link.includes('/image')
        results.push({ quality: photo ? 'photo' : 'HD', type: photo ? 'photo' : 'video', url: unwrapTokenUrl(link) })
      })
    }

    if (!results.length) throw new Error('No download links found from SnapSave.')

    const title = $('.download-items__title, .card-title, .caption, h3').first().text().trim() || 'Instagram Media'
    const cover = results[0].thumbnail || cleanUrl($('img').first().attr('src')) || ''

    return {
      status: true,
      result: {
        title,
        thumbnail: cover,
        type: results.some((item) => item.type === 'photo') ? 'photo' : 'video',
        downloads: results,
      },
    }
  } catch (error) {
    return { status: false, message: error.message || 'Failed to scrape Instagram via SnapSave.' }
  }
}

export default instagramDownload
