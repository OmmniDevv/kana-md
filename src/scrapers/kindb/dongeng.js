// Dongeng dari 1000dongeng.com untuk .dongeng. Terverifikasi dari VM:
// pencarian Blogger /search?q=<kata kunci> membalas 200 dengan daftar
// .post-title asli, dan halaman cerita memuat teks lengkap di
// .post-body. Judul hasil distopword dari embel-embel situs supaya
// ringkas.
import * as cheerio from 'cheerio'
import { randomUserAgent } from '../runner.js'

const BASE = 'https://1000dongeng.com'

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`1000dongeng balas HTTP ${res.status}`)
  return res.text()
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()

export function tidyDongengTitle(title) {
  return clean(title)
    .replace(/\s*\|\s*DONGENG ANAK DUNIA\s*$/i, '')
    .replace(/^DONGENG\s+/i, 'Dongeng ')
    .trim()
}

export function parseDongengList(html, limit = 8) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('h3.post-title a, .post-title a').each((_, a) => {
    if (rows.length >= limit) return
    const href = $(a).attr('href') || ''
    const title = tidyDongengTitle($(a).text())
    if (!title || !href || seen.has(href)) return
    seen.add(href)
    rows.push({ title, url: href })
  })
  return rows
}

export function parseDongengStory(html) {
  const $ = cheerio.load(html || '')
  let text = clean($('.post-body').first().text())
  // Buang kepala halaman (tanggal + tombol berbagi + skrip iklan) yang
  // ikut tertangkap di awal .post-body.
  text = text
    .replace(/^.*?WhatsApp/i, '')
    .replace(/\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const title = tidyDongengTitle($('h3.post-title, .post-title').first().text() || $('title').text())
  if (!text) return null
  return { title, text }
}

export async function dongengSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Kata kunci wajib diisi')
  return parseDongengList(await fetchHtml(`${BASE}/search?q=${encodeURIComponent(q)}`), limit)
}

export async function dongengRead(url) {
  if (!/^https?:\/\/(www\.)?1000dongeng\.com\//i.test(String(url || ''))) {
    throw new Error('Tautan harus dari 1000dongeng.com')
  }
  const story = parseDongengStory(await fetchHtml(url))
  if (!story) throw new Error('Isi dongeng tidak terbaca')
  return story
}
