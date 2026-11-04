// Scraper SoundCloud tanpa kunci resmi: client_id dibaca dari aset JS
// publik soundcloud.com (sama seperti yang dipakai web player mereka),
// lalu resolve lewat api-v2. Urutan format: progressive MP3 langsung,
// atau HLS polos yang digabung ffmpeg. Trek yang hanya menyediakan HLS
// terenkripsi FairPlay (skd://, cbc/ctr-encrypted-hls) adalah DRM dan
// dilaporkan apa adanya, tidak diakali.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { downloadBuffer, withTempDir } from '../runner.js'

const execFileP = promisify(execFile)
const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export function extractSoundcloudUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s]*(soundcloud\.com|on\.soundcloud\.com|snd\.sc)\/[^\s]+/i)
  return m ? m[0].replace(/[),.]+$/, '') : null
}

let cachedClientId = null

export async function getClientId() {
  if (cachedClientId) return cachedClientId
  const page = await fetch('https://soundcloud.com/discover', {
    headers: { 'user-agent': DESKTOP_UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!page.ok) throw new Error(`soundcloud.com membalas HTTP ${page.status}`)
  const html = await page.text()
  const assets = [...new Set([...html.matchAll(/https:\/\/a-v2\.sndcdn\.com\/assets\/[0-9a-z-]+\.js/g)].map((m) => m[0]))]
  for (const asset of assets.slice(0, 10)) {
    try {
      const res = await fetch(asset, { headers: { 'user-agent': DESKTOP_UA }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) continue
      const js = await res.text()
      const m = js.match(/client_id:["']([A-Za-z0-9]{32})["']/)
      if (m) {
        cachedClientId = m[1]
        return cachedClientId
      }
    } catch {}
  }
  throw new Error('client_id SoundCloud tidak ditemukan di aset publik')
}

export async function soundcloudResolve(url) {
  const clientId = await getClientId()
  const res = await fetch(`https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${clientId}`, {
    headers: { 'user-agent': DESKTOP_UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`SoundCloud resolve membalas HTTP ${res.status}`)
  const data = await res.json()
  if (data?.kind !== 'track') throw new Error('tautan itu bukan trek SoundCloud tunggal')
  return { clientId, track: data }
}

export function pickTranscoding(transcodings) {
  const list = Array.isArray(transcodings) ? transcodings : []
  const progressive = list.find((t) => t.format?.protocol === 'progressive')
  if (progressive) return { kind: 'progressive', transcoding: progressive }
  const hls = list
    .filter((t) => t.format?.protocol === 'hls')
    .sort((a, b) => (a.preset === 'aac_96k' ? 0 : 1) - (b.preset === 'aac_96k' ? 0 : 1))
  if (hls.length) return { kind: 'hls', transcoding: hls[0] }
  return null
}

async function streamUrl(transcoding, clientId) {
  const res = await fetch(`${transcoding.url}?client_id=${clientId}`, {
    headers: { 'user-agent': DESKTOP_UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`SoundCloud stream membalas HTTP ${res.status}`)
  const data = await res.json()
  if (!data?.url) throw new Error('URL stream SoundCloud kosong')
  return data.url
}

export async function soundcloudAudio(url, { maxBytes = 20 * 1024 * 1024 } = {}) {
  const { clientId, track } = await soundcloudResolve(url)
  const meta = {
    title: track.title ?? 'SoundCloud',
    author: track.user?.username ?? '',
    durationSec: Math.round((track.duration ?? 0) / 1000),
  }
  const pick = pickTranscoding(track.media?.transcodings)
  if (!pick) {
    const err = new Error('trek ini hanya tersedia dalam format terenkripsi DRM (FairPlay) dari SoundCloud, jadi tidak bisa diunduh')
    err.code = 'SOUNDCLOUD_DRM'
    throw err
  }
  const direct = await streamUrl(pick.transcoding, clientId)
  if (pick.kind === 'progressive') {
    const media = await downloadBuffer(direct, { maxBytes })
    return { ...meta, buffer: media.buffer }
  }
  const playlistRes = await fetch(direct, { headers: { 'user-agent': DESKTOP_UA }, signal: AbortSignal.timeout(30000) })
  if (!playlistRes.ok) throw new Error(`Playlist HLS membalas HTTP ${playlistRes.status}`)
  const playlist = await playlistRes.text()
  if (playlist.includes('skd://')) {
    const err = new Error('trek ini hanya tersedia dalam format terenkripsi DRM (FairPlay) dari SoundCloud, jadi tidak bisa diunduh')
    err.code = 'SOUNDCLOUD_DRM'
    throw err
  }
  const buffer = await withTempDir(async (dir) => {
    const out = join(dir, 'out.mp3')
    try {
      await execFileP(
        'ffmpeg',
        ['-y', '-user_agent', DESKTOP_UA, '-i', direct, '-vn', '-c:a', 'libmp3lame', '-q:a', '4', out],
        { timeout: 240000 },
      )
    } catch (err) {
      throw new Error(`ffmpeg gabung HLS gagal: ${(err.stderr || err.message).slice(-200)}`)
    }
    return readFile(out)
  })
  if (buffer.length > maxBytes) throw new Error('audio hasil unduhan terlalu besar buat WhatsApp')
  return { ...meta, buffer }
}
