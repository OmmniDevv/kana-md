// Konten misteri/horor dengan media dari halaman tag kisah-horor IDN
// Times: kumpulkan kartu artikel (judul dari alt gambar/tautan, tautan
// artikel, gambar sampul), pilih satu acak, unduh gambarnya dengan
// validasi magic bytes. Sumber asli Elaina (rumahmisteri.com) tidak
// bisa dihubungi dari VM ini (koneksi gagal berulang, satu kali hanya
// membalas stub 1015 byte tanpa daftar artikel), jadi diganti sumber
// hidup ini dengan mekanik yang sama: artikel acak + gambar + tautan.
import * as cheerio from 'cheerio'
import { downloadBuffer, randomUserAgent, retry, withBreaker } from '../runner.js'
import { imageKind } from '../maker/removebg.js'

export const MISTERI_TAG_URL = 'https://www.idntimes.com/tag/kisah-horor'

// Urai kartu artikel horor dari HTML halaman tag: gambar pos dengan alt
// berisi judul, tautan artikel idntimes.com terdekat sebagai URL-nya.
// Hanya URL artikel (punya segmen kanal dan slug panjang) yang diambil.
export function parseHorrorArticles(html) {
  if (!html) return []
  const $ = cheerio.load(html)
  const seen = new Set()
  const out = []
  $('img').each((_, img) => {
    const $img = $(img)
    const src = $img.attr('src') || $img.attr('data-src') || ''
    const title = String($img.attr('alt') || '').trim()
    if (!title || title.length < 12) return
    if (!/^https:\/\/image\.idntimes\.com\//.test(src)) return
    const anchor = $img.closest('a[href]')
    const link = String(anchor.attr('href') || '')
    if (!/^https:\/\/www\.idntimes\.com\/[a-z]+\/[a-z-]+\/[a-z0-9-]{20,}/.test(link)) return
    if (seen.has(link)) return
    seen.add(link)
    out.push({ title, link, image: src })
  })
  return out
}

async function fetchTagHtml() {
  const res = await fetch(MISTERI_TAG_URL, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`IDN Times balas HTTP ${res.status}`)
  return res.text()
}

// Ambil satu artikel misteri acak beserta Buffer gambar sampulnya.
// Kandidat diacak dan dicoba sampai gambarnya valid (JPEG/PNG/WebP).
export async function getRandomMisteri({ rng = Math.random, download = downloadBuffer, fetchHtml = fetchTagHtml } = {}) {
  return withBreaker('idntimes-misteri', () =>
    retry(async () => {
      const articles = parseHorrorArticles(await fetchHtml())
      if (!articles.length) throw new Error('Tidak ada artikel horor terbaca dari IDN Times')
      const shuffled = [...articles]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.min(i, Math.floor(rng() * (i + 1)))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      let lastError = null
      for (const article of shuffled.slice(0, 6)) {
        try {
          const media = await download(article.image, { maxBytes: 16 * 1024 * 1024, timeout: 30000 })
          const kind = imageKind(media.buffer)
          if (kind !== 'jpeg' && kind !== 'png' && kind !== 'webp') continue
          return { ...article, imageBuffer: media.buffer }
        } catch (err) {
          lastError = err
        }
      }
      throw lastError || new Error('Gambar artikel misteri tidak ada yang bisa diunduh')
    })
  )
}
