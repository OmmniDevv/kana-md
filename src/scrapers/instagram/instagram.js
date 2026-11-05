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

async function instagramViaSnapSave(url) {
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
      // SnapSave dari VM ini terukur menjawab sekitar 30 detik (probe
      // sapuan 2026-11-05); batas lama 15 detik selalu memotongnya di
      // tengah dan menghasilkan "Empty response"/timeout.
      timeout: 60000,
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

// Cadangan (ditambahkan 2026-11-05 saat sapuan live): halaman embed
// resmi Instagram. SnapSave terbukti fluktuatif untuk Instagram
// (menjawab sukses tetapi tanpa tautan unduhan, "Empty response"),
// sedangkan halaman /embed/captioned/ untuk kiriman publik memuat
// video_url/display_url langsung di JSON halamannya dan terjangkau
// dari VM bot. Bentuk hasil sama persis dengan jalur SnapSave.
export function extractEmbedMedia(html) {
  if (!html || typeof html !== 'string') return null
  // JSON di halaman embed ter-escape dua lapis (\\\" dan \\\\/), jadi
  // unescape diulang sampai stabil, maksimal 3 putaran.
  let plain = html
  for (let i = 0; i < 3; i++) {
    const next = plain
      .replace(/\\u0026/g, '&')
      .replace(/\\\\/g, '\\')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
    if (next === plain) break
    plain = next
  }
  const pick = (key) => {
    const m = plain.match(new RegExp(`"${key}":"(https:[^"]+)"`))
    return m ? m[1] : null
  }
  const videoUrl = pick('video_url')
  const displayUrl = pick('display_url')
  const titleMatch = plain.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Instagram Media'
  if (videoUrl) {
    return { title, thumbnail: displayUrl || '', type: 'video', downloads: [{ quality: 'HD', type: 'video', url: videoUrl }] }
  }
  if (displayUrl) {
    return { title, thumbnail: displayUrl, type: 'photo', downloads: [{ quality: 'photo', type: 'photo', url: displayUrl }] }
  }
  return null
}

// Halaman embed WAJIB diambil lewat curl, bukan fetch/axios: edge
// Instagram membedakan sidik jari TLS klien. Dari VM bot, Node
// (fetch maupun axios, UA apa pun) selalu menerima varian embed JS
// 500KB tanpa media, sedangkan curl menerima varian 235KB yang memuat
// video_url (terbukti berulang pada probe sapuan 2026-11-05). Pola
// execFile yang sama dipakai scraper soundcloud untuk ffmpeg.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const EMBED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

async function instagramViaEmbed(url) {
  const parsed = assertSafeUrl(url)
  if (!IG_HOST.test(parsed.hostname)) throw new Error('URL harus dari instagram.com')
  const m = parsed.pathname.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)
  if (!m) throw new Error('tautan Instagram tidak memuat kode kiriman')
  const seg = m[1] === 'p' ? 'p' : 'reel'
  // Halaman embed punya dua varian yang disajikan bergantian menurut
  // jendela waktu di edge Instagram: varian kaya (235KB, memuat
  // video_url) dan varian JS (500KB, tanpa media). Coba sampai 4 kali
  // sampai varian kaya yang didapat.
  let lastError = null
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const { stdout } = await execFileP(
        'curl',
        ['-sL', '--max-time', '30', '-A', EMBED_UA, `https://www.instagram.com/${seg}/${m[2]}/embed/captioned/`],
        { maxBuffer: 8 * 1024 * 1024, timeout: 40000 }
      )
      const media = extractEmbedMedia(stdout)
      if (media) return { status: true, result: media }
      lastError = new Error('varian halaman embed tanpa media')
    } catch (err) {
      lastError = err
    }
    if (attempt < 3) await new Promise((r) => setTimeout(r, 1500))
  }
  throw lastError || new Error('media tidak ditemukan di halaman embed Instagram')
}

// Cadangan kedua dan ketiga (ditambahkan 2026-11-05 dari paket
// scraper kiriman user "Scraper By Zane", file igexportScraper.js dan
// instaloadrScraper.js; lihat docs/SNIPPETS.md): dua API publik tanpa
// kunci dan tanpa captcha yang terverifikasi dari VM bot dengan reel
// uji kanonis plugin .ig (igexport menjawab dalam hitungan detik dan
// berkas videonya lolos cek magic bytes ftyp; instaloadr menjawab
// HTTP 200 dengan item unduhan yang sama). Bentuk hasil disamakan
// dengan jalur SnapSave dan embed.

export function parseIgExportMedia(data) {
  if (!data?.ok || !Array.isArray(data?.media?.items)) return null
  const items = data.media.items.filter((it) => it?.url)
  if (!items.length) return null
  const downloads = items.map((it) => {
    const video = it.type === 'video'
    return {
      quality: video ? 'HD' : 'photo',
      type: video ? 'video' : 'photo',
      url: it.url,
      thumbnail: it.thumbnailUrl || undefined,
    }
  })
  return {
    title: 'Instagram Media',
    thumbnail: items[0].thumbnailUrl || '',
    type: downloads.some((d) => d.type === 'photo') ? 'photo' : 'video',
    downloads,
  }
}

export async function instagramViaIgExport(url) {
  const parsed = assertSafeUrl(url)
  if (!IG_HOST.test(parsed.hostname)) throw new Error('URL harus dari instagram.com')
  const api = new URL('https://igexport.com/api/ig-photo/')
  api.searchParams.set('url', parsed.href.split('?')[0])
  const res = await fetch(api, {
    signal: AbortSignal.timeout(30000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      Referer: 'https://igexport.com/',
    },
  })
  if (!res.ok) throw new Error(`IgExport membalas HTTP ${res.status}`)
  const data = await res.json().catch(() => null)
  const media = parseIgExportMedia(data)
  if (!media) throw new Error(data?.message || 'Media Instagram tidak ditemukan di IgExport')
  return { status: true, result: media }
}

export function parseInstaloadrMedia(data) {
  const items = Array.isArray(data?.items) ? data.items.filter((it) => it?.download_url) : []
  if (!items.length) return null
  const downloads = items.map((it) => {
    const video = /mp4|video/i.test(String(it.media_type || ''))
    return {
      quality: video ? 'HD' : 'photo',
      type: video ? 'video' : 'photo',
      url: it.download_url,
      thumbnail: it.thumbnail_url || undefined,
    }
  })
  return {
    title: 'Instagram Media',
    thumbnail: items[0].thumbnail_url || '',
    type: downloads.some((d) => d.type === 'photo') ? 'photo' : 'video',
    downloads,
  }
}

export async function instagramViaInstaloadr(url) {
  const parsed = assertSafeUrl(url)
  if (!IG_HOST.test(parsed.hostname)) throw new Error('URL harus dari instagram.com')
  const target = parsed.href.split('?')[0]
  const guessed = /\/(reels?|tv)\//i.test(parsed.pathname) ? 'reel' : 'post'
  const postFetch = async (mediaType) => {
    const res = await fetch('https://www.instaloadr.com/api/fetch', {
      method: 'POST',
      signal: AbortSignal.timeout(45000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://www.instaloadr.com/',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: target, media_type: mediaType }),
    })
    const body = await res.json().catch(() => null)
    return { res, body }
  }
  let out = await postFetch(guessed)
  // Tebakan tipe salah dijawab 422; coba sekali lagi sebagai post.
  if (!out.res.ok && out.res.status === 422 && guessed !== 'post') {
    out = await postFetch('post')
  }
  if (!out.res.ok) throw new Error(out.body?.detail || `Instaloadr membalas HTTP ${out.res.status}`)
  const media = parseInstaloadrMedia(out.body)
  if (!media) throw new Error(out.body?.detail || 'Media Instagram tidak ditemukan di Instaloadr')
  return { status: true, result: media }
}

export async function instagramDownload(url) {
  const viaSnapSave = await instagramViaSnapSave(url)
  if (viaSnapSave.status) return viaSnapSave
  try {
    return await instagramViaEmbed(url)
  } catch {}
  try {
    return await instagramViaIgExport(url)
  } catch {}
  try {
    return await instagramViaInstaloadr(url)
  } catch {
    return viaSnapSave
  }
}

export default instagramDownload
