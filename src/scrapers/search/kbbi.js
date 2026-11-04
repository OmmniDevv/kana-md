// Scraper KBBI: ambil halaman entri kbbi.kemdikbud.go.id lalu parse blok
// definisi dengan cheerio. Struktur situs bisa berubah; parser mencoba
// beberapa pola penampung definisi yang lazim dan menyerah dengan jujur
// (daftar kosong) bila tidak ada yang cocok.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://kbbi.kemdikbud.go.id'

const clean = (value) => (value || '').replace(/\s+/g, ' ').trim()

export function parseKbbiDefinitions(html) {
  if (!html || typeof html !== 'string') return []
  if (/tidak ditemukan dalam Kamus/i.test(html)) return []
  const $ = cheerio.load(html)
  const found = []
  const push = (text) => {
    const t = clean(text)
    if (t && t.length > 2 && !found.includes(t)) found.push(t)
  }
  // Pola utama: daftar definisi dalam <ol><li>.
  $('ol li').each((_, li) => push($(li).text()))
  // Pola cadangan: blok dengan margin kiri (gaya lama KBBI daring).
  if (!found.length) {
    $('[style*="margin-left"] , .arti, .definition, .entri-kata').each((_, el) => push($(el).text()))
  }
  // Pola terakhir: item daftar apa pun yang panjangnya wajar.
  if (!found.length) {
    $('ul li').each((_, li) => {
      const t = clean($(li).text())
      if (t.length > 10 && t.length < 500) push(t)
    })
  }
  return found.slice(0, 10)
}

export async function searchKbbi(word) {
  const kata = String(word || '').trim().toLowerCase()
  if (!kata) throw new Error('Kata wajib diisi')
  return withBreaker('kbbi', () =>
    retry(async () => {
      const res = await fetch(`${BASE}/entri/${encodeURIComponent(kata)}`, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
      })
      if (res.status === 404) return { word: kata, definitions: [] }
      if (!res.ok) throw new Error(`KBBI balas HTTP ${res.status}`)
      const html = await res.text()
      return { word: kata, definitions: parseKbbiDefinitions(html) }
    })
  )
}
