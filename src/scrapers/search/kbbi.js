// Scraper KBBI: ambil halaman entri kbbi.kemdikbud.go.id lalu parse blok
// definisi dengan cheerio. Struktur situs bisa berubah; parser mencoba
// beberapa pola penampung definisi yang lazim dan menyerah dengan jujur
// (daftar kosong) bila tidak ada yang cocok.
// Cadangan (ditambahkan 2026-11-05 saat sapuan live): kbbi.web.id, cermin
// komunitas KBBI yang datanya sama. Dipakai bila host kemdikbud tidak
// terjangkau sama sekali dari jaringan bot (terbukti fetch failed /
// HTTP 000 berulang), supaya fiturnya tetap hidup.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://kbbi.kemdikbud.go.id'
const MIRROR = 'https://kbbi.web.id'

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

// Parser cermin kbbi.web.id: definisi berada di <div id="d1">, tiap
// entri (kata dasar dan turunannya) dipisahkan <br><br> dan diawali
// <b>kata kepala</b>. Terverifikasi pada halaman asli /cinta.
export function parseKbbiMirrorDefinitions(html) {
  if (!html || typeof html !== 'string') return []
  const $ = cheerio.load(html)
  const box = $('#d1')
  if (!box.length) return []
  const found = []
  for (const chunk of (box.html() || '').split(/<br\s*\/?>\s*<br\s*\/?>/i)) {
    const t = clean(cheerio.load(`<div>${chunk}</div>`)('div').text())
    if (t && t.length > 2 && !found.includes(t)) found.push(t)
  }
  return found.slice(0, 10)
}

async function fetchKbbiPage(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`KBBI balas HTTP ${res.status}`)
  return res.text()
}

export async function searchKbbi(word) {
  const kata = String(word || '').trim().toLowerCase()
  if (!kata) throw new Error('Kata wajib diisi')
  return withBreaker('kbbi', () =>
    retry(async () => {
      try {
        const html = await fetchKbbiPage(`${BASE}/entri/${encodeURIComponent(kata)}`)
        if (html === null) return { word: kata, definitions: [] }
        return { word: kata, definitions: parseKbbiDefinitions(html) }
      } catch (err) {
        // Host resmi tidak terjangkau: coba cermin komunitas. Bila
        // cermin juga gagal, lempar error aslinya.
        const html = await fetchKbbiPage(`${MIRROR}/${encodeURIComponent(kata)}`).catch(() => undefined)
        if (html === undefined) throw err
        if (html === null) return { word: kata, definitions: [] }
        return { word: kata, definitions: parseKbbiMirrorDefinitions(html) }
      }
    })
  )
}
