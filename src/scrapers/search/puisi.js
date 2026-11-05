// Puisi Indonesia dari PuisiPendek.net (WordPress): ambil daftar tautan
// /puisi/<slug> dari beranda, pilih satu acak, lalu ekstrak judul dan
// isi puisi dari .entry-content halaman detail. Menggantikan API puisi
// Neoxr lama yang memakai API key hardcoded milik bot lain. Terverifikasi
// dari VM ini: beranda memuat belasan tautan puisi dan halaman detail
// berisi puisi multi-baris.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const PUISI_HOME = 'https://puisipendek.net/'

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`PuisiPendek balas HTTP ${res.status}`)
  return res.text()
}

// Kumpulkan tautan puisi unik dari HTML beranda.
export function parsePoemLinks(html) {
  if (!html) return []
  const $ = cheerio.load(html)
  const seen = new Set()
  const links = []
  $('a[href]').each((_, a) => {
    const href = String($(a).attr('href') || '')
    if (/^https:\/\/puisipendek\.net\/puisi\/[a-z0-9-]+\/?$/i.test(href) && !seen.has(href)) {
      seen.add(href)
      links.push(href)
    }
  })
  return links
}

// Ekstrak { title, text, url } dari halaman detail puisi: judul dari
// og:title (dibuang sufiks situsnya), isi dari paragraf .entry-content
// dengan <br> menjadi baris baru. Puisi wajib minimal 2 baris.
export function parsePoemPage(html, url) {
  if (!html) return null
  const $ = cheerio.load(html)
  const rawTitle = $('meta[property="og:title"]').attr('content') || $('.wp-block-post-title').first().text() || $('title').text()
  const title = String(rawTitle || '').replace(/\s*~\s*PuisiPendek\.net\s*$/i, '').trim()
  const paragraphs = []
  $('.entry-content p').each((_, p) => {
    const inner = $(p).html() || ''
    const text = inner
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
    if (text) paragraphs.push(text)
  })
  const text = paragraphs.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!title || lines.length < 2 || text.length > 3000) return null
  return { title, text, url }
}

export async function getRandomPuisi({ rng = Math.random, fetchImpl = fetchHtml } = {}) {
  return withBreaker('puisipendek', () =>
    retry(async () => {
      const home = await fetchImpl(PUISI_HOME)
      const links = parsePoemLinks(home)
      if (!links.length) throw new Error('Tidak ada tautan puisi di beranda PuisiPendek')
      const shuffled = [...links]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.min(i, Math.floor(rng() * (i + 1)))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      let lastError = null
      for (const link of shuffled.slice(0, 5)) {
        try {
          const poem = parsePoemPage(await fetchImpl(link), link)
          if (poem) return poem
          lastError = new Error(`Halaman puisi tidak terbaca: ${link}`)
        } catch (err) {
          lastError = err
        }
      }
      throw lastError || new Error('Tidak ada puisi yang bisa dibaca')
    })
  )
}
