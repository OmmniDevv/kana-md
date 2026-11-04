// Metadata lagu + lirik: Spotify Embed, fallback iTunes Search, lirik dari
// lyrics.ovh lalu lrclib.net.
// Kredit: Yui Agents, "Scraper Spotify Embed + iTunes Fallback + Lirik",
// snippet kiriman user 2026-11-04. Logika inti dipertahankan; adaptasi
// kana-md: hasil dinormalisasi, judul dibersihkan untuk pencarian lirik,
// dan dipakai sebagai fallback metadata plugin spotify serta plugin lirik.
import { assertSafeUrl } from '../runner.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

// Ekstrak entitas lagu dari HTML embed Spotify (__NEXT_DATA__).
export function parseSpotifyEmbed(html) {
  const match = String(html || '').match(
    /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
  )
  if (!match) return null
  let entity = null
  try {
    entity = JSON.parse(match[1])?.props?.pageProps?.state?.data?.entity ?? null
  } catch {
    return null
  }
  if (!entity?.name) return null
  return {
    title: entity.name,
    artist: entity.artists?.[0]?.name || null,
    previewUrl: entity.audioPreview?.url || null,
    thumbnail: entity.visualIdentity?.image?.[0]?.url || entity.coverArt?.sources?.[0]?.url || null,
    source: 'spotify-embed',
  }
}

// Petakan satu hasil iTunes Search ke bentuk metadata yang sama.
export function parseItunesTrack(item) {
  if (!item?.trackName) return null
  return {
    title: item.trackName,
    artist: item.artistName || null,
    previewUrl: item.previewUrl || null,
    thumbnail: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '600x600') : null,
    album: item.collectionName || null,
    source: 'itunes',
  }
}

export function cleanTitle(title) {
  return String(title || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s*\[.*?\]\s*/g, '')
    .trim()
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchLyrics(artist, title) {
  const clean = cleanTitle(title)
  try {
    const data = await fetchJson(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(clean)}`
    )
    const lyrics = data?.lyrics?.trim()
    if (lyrics) return { lyrics, source: 'lyrics.ovh' }
  } catch {}
  try {
    const data = await fetchJson(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
      { 'User-Agent': 'KANA/1.0 (kana-md)' }
    )
    const lyrics = data?.plainLyrics?.trim()
    if (lyrics) return { lyrics, source: 'lrclib' }
  } catch {}
  return { lyrics: null, source: null }
}

// Ambil metadata lagu dari URL track Spotify atau dari teks pencarian,
// lalu lengkapi dengan lirik bila ketemu.
export async function getSongData(query, { withLyrics = true } = {}) {
  const input = String(query || '').trim()
  if (!input) return null
  let meta = null
  const isUrl = /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/i.exec(input)

  if (isUrl) {
    assertSafeUrl(`https://open.spotify.com/track/${isUrl[1]}`)
    const res = await fetch(`https://open.spotify.com/embed/track/${isUrl[1]}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    })
    meta = parseSpotifyEmbed(await res.text())
  } else {
    const data = await fetchJson(
      `https://itunes.apple.com/search?term=${encodeURIComponent(input)}&entity=song&limit=1`
    )
    meta = parseItunesTrack(data?.results?.[0])
  }

  if (!meta?.title) return null

  let lyrics = null
  let lyricsSource = null
  if (withLyrics && meta.artist) {
    const found = await fetchLyrics(meta.artist, meta.title)
    lyrics = found.lyrics
    lyricsSource = found.source
  }

  return { status: true, ...meta, lyrics, lyricsSource }
}

export default getSongData
