// Scraper Wallpaper: cari wallpaper di wallpaperflare.com lewat halaman
// pencariannya (cheerio, tanpa kunci dan tanpa cookie). Perilaku fitur
// meniru wallpaper RYO-YAMADA-MD (audit RYO 2026-11-05), ditulis ulang
// gaya KANA: cookie analitik statis versi RYO tidak dipakai, request
// polos dengan User-Agent saja. Terverifikasi dari VM 2026-11-05:
// pencarian "anime" membalas HTTP 200 dengan URL gambar pratinjau
// c*.wallpaperflare.com yang berkasnya JPEG asli (magic ffd8).
import * as cheerio from 'cheerio'
import { assertSafeUrl, downloadBuffer, randomUserAgent, retry, withBreaker } from '../runner.js'

export function parseWallpaperflareResults(html) {
  if (!html) return []
  const $ = cheerio.load(html)
  const out = []
  const seen = new Set()
  $('#gallery > li > figure > a').each((_, el) => {
    const img = $(el).find('img').first()
    const src = img.attr('data-src') || img.attr('src') || ''
    if (!/^https:\/\/c\d+\.wallpaperflare\.com\//.test(src)) return
    if (seen.has(src)) return
    seen.add(src)
    out.push({ url: src, title: (img.attr('alt') || '').trim() })
  })
  return out
}

export async function searchWallpaper(query, { limit = 10 } = {}) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Kata kunci wallpaper belum diisi')
  const url = assertSafeUrl(`https://www.wallpaperflare.com/search?wallpaper=${encodeURIComponent(keyword)}`)
  return withBreaker('wallpaperflare', () =>
    retry(async () => {
      const res = await fetch(url.href, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
      })
      if (!res.ok) throw new Error(`wallpaperflare balas HTTP ${res.status}`)
      const results = parseWallpaperflareResults(await res.text()).slice(0, Math.max(1, Math.min(20, limit)))
      if (!results.length) throw new Error('Wallpaper tidak ditemukan di wallpaperflare')
      return { query: keyword, total: results.length, results }
    })
  )
}

export async function downloadWallpaperImage(item, { maxBytes = 16 * 1024 * 1024 } = {}) {
  const media = await downloadBuffer(item.url, { maxBytes, timeout: 60000 })
  const isJpeg = media.buffer.length > 2 && media.buffer[0] === 0xff && media.buffer[1] === 0xd8
  const isPng = media.buffer.length > 4 && media.buffer[0] === 0x89 && media.buffer[1] === 0x50
  if (!isJpeg && !isPng) throw new Error('Berkas wallpaper bukan gambar yang valid')
  return media.buffer
}
