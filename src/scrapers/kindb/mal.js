// Scraper MyAnimeList (situs) untuk keluarga KIND-B.
// api.jikan.moe tidak terjangkau sama sekali dari jaringan bot (fetch
// failed berulang, termasuk timeout 45 detik), dan AniList GraphQL
// membalas Cloudflare 403. Situs myanimelist.net sendiri menjawab 200
// dan pola scrape situs MAL sudah terbukti di modul sehat
// src/scrapers/search/anime.js. Modul ini mandiri (tidak mengedit modul
// bersama mana pun) dan hanya membaca halaman publik: peringkat,
// musim, genre, dan pencarian karakter.
import * as cheerio from 'cheerio'
import { randomUserAgent } from '../runner.js'

const BASE = 'https://myanimelist.net'

async function fetchHtml(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`MyAnimeList balas HTTP ${res.status}`)
  return res.text()
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()

// Baris peringkat dari halaman topanime/topmanga (tabel ranking-list).
export function parseMalRanking(html, limit = 10) {
  const $ = cheerio.load(html || '')
  const rows = []
  $('tr.ranking-list').each((_, tr) => {
    if (rows.length >= limit) return
    const $tr = $(tr)
    const rank = parseInt($tr.find('td.rank span').first().text(), 10)
    // Sel judul memuat tautan gambar (tanpa teks) lebih dulu; judul asli ada
    // di tautan h3. Ambil tautan pertama yang berteks.
    let title = ''
    let href = ''
    $tr.find('td.title a[href]').each((_, a) => {
      if (title) return
      const t = clean($(a).text())
      if (t) { title = t; href = $(a).attr('href') || '' }
    })
    const score = parseFloat($tr.find('td.score span.text').first().text())
    if (!title || !href) return
    rows.push({
      rank: Number.isFinite(rank) ? rank : rows.length + 1,
      title,
      score: Number.isFinite(score) ? score : null,
      url: href,
    })
  })
  return rows
}

// Kartu .seasonal-anime dipakai halaman musim DAN halaman genre MAL.
export function parseMalCards(html, limit = 10) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('.seasonal-anime').each((_, el) => {
    if (rows.length >= limit) return
    const $el = $(el)
    const $link = $el.find('a.link-title, h2 a[href*="/anime/"]').first()
    const href = $link.attr('href') || ''
    const title = clean($link.text())
    if (!title || !href || seen.has(href)) return
    seen.add(href)
    const score = parseFloat($el.find('.score').first().text())
    const genres = []
    $el.find('.genres .genre a, .genre a').each((_, a) => {
      const g = clean($(a).text())
      if (g) genres.push(g)
    })
    rows.push({ title, score: Number.isFinite(score) ? score : null, url: href, genres: genres.slice(0, 4) })
  })
  return rows
}

export function parseMalCharacters(html, limit = 8) {
  const $ = cheerio.load(html || '')
  const rows = []
  const seen = new Set()
  $('a[href*="/character/"]').each((_, a) => {
    if (rows.length >= limit) return
    const href = $(a).attr('href') || ''
    if (!/^https:\/\/myanimelist\.net\/character\/\d+\/[^/]+$/.test(href)) return
    if (seen.has(href)) return
    const name = clean($(a).text())
    if (name.length < 3) return
    seen.add(href)
    rows.push({ name, url: href })
  })
  return rows
}

export async function malTopAnime(limit = 10) {
  return parseMalRanking(await fetchHtml(`${BASE}/topanime.php?limit=0`), limit)
}

export async function malTopManga(limit = 10) {
  return parseMalRanking(await fetchHtml(`${BASE}/topmanga.php?limit=0`), limit)
}

export async function malSeasonNow(limit = 10) {
  return parseMalCards(await fetchHtml(`${BASE}/anime/season`), limit)
}

export const MAL_GENRES = {
  action: 1, adventure: 2, 'avant garde': 5, award: 46, comedy: 4, drama: 8,
  fantasy: 10, horror: 14, mystery: 7, romance: 22, 'sci-fi': 24,
  'slice of life': 36, sports: 30, supernatural: 37, suspense: 41,
}

export async function malByGenre(genreName, limit = 10) {
  const key = String(genreName || '').trim().toLowerCase()
  const id = MAL_GENRES[key]
  if (!id) return null
  const slug = key.replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
  return parseMalCards(await fetchHtml(`${BASE}/anime/genre/${id}/${slug}`), limit)
}

export async function malSearchCharacters(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Nama karakter wajib diisi')
  return parseMalCharacters(await fetchHtml(`${BASE}/character.php?q=${encodeURIComponent(q)}`), limit)
}
