// Scraper MediaFire: buka halaman file, ekstrak tautan unduh langsung dari
// tombol unduh (a#downloadButton) dengan cheerio. Pengunduhan buffer
// dilakukan plugin lewat downloadBuffer agar batas ukuran konsisten.
import * as cheerio from 'cheerio'
import { assertSafeUrl, randomUserAgent, retry, withBreaker } from '../runner.js'

export function extractMediafireDownload(html) {
  if (!html) return null
  const $ = cheerio.load(html)
  const href = $('a#downloadButton').attr('href') || $('a[href*="/download/"]').first().attr('href')
  if (!href || !/^https?:\/\//.test(href)) return null
  const title = $('title').text().replace(/\s+/g, ' ').trim()
  return { directUrl: href, pageTitle: title }
}

export function assertMediafireUrl(rawUrl) {
  const url = assertSafeUrl(rawUrl)
  const host = url.hostname.toLowerCase()
  if (host !== 'mediafire.com' && host !== 'www.mediafire.com') {
    throw new Error('Link harus dari mediafire.com')
  }
  return url
}

export async function resolveMediafire(rawUrl) {
  const url = assertMediafireUrl(rawUrl)
  return withBreaker('mediafire', () =>
    retry(async () => {
      const res = await fetch(url.href, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
      })
      if (!res.ok) throw new Error(`MediaFire balas HTTP ${res.status}`)
      const parsed = extractMediafireDownload(await res.text())
      if (!parsed) throw new Error('Tautan unduh langsung tidak ditemukan di halaman MediaFire')
      const fileName = decodeURIComponent(new URL(url.href).pathname.split('/').filter(Boolean).at(-1) || 'file')
      return { ...parsed, fileName: fileName === 'file' ? 'mediafire-file' : fileName, pageUrl: url.href }
    })
  )
}
