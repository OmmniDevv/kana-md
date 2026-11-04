// Transkrip YouTube: daftar trek caption dibaca dari data pemutar
// @distube/ytdl-core (jalur yang sama dengan pengunduh audio), lalu
// teksnya diambil dari endpoint timedtext YouTube format json3.
import { Ytdl } from '@distube/ytdl-core'

const yt = new Ytdl()

export async function youtubeTranscript(url, { langPref = ['id', 'en'] } = {}) {
  const info = await yt.getInfo(url)
  const pr = info?.player_response ?? info?.playerResponse
  const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  if (!tracks.length) throw new Error('video ini tidak punya teks/caption yang bisa diambil')
  let track = null
  for (const lang of langPref) {
    track = tracks.find((t) => t.languageCode === lang) ?? tracks.find((t) => t.languageCode?.startsWith(lang))
    if (track) break
  }
  track = track ?? tracks[0]
  const res = await fetch(`${track.baseUrl}&fmt=json3`, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`timedtext membalas HTTP ${res.status}`)
  const data = await res.json()
  const parts = []
  for (const ev of data.events ?? []) {
    const line = (ev.segs ?? []).map((s) => s.utf8 ?? '').join('').replace(/\s+/g, ' ').trim()
    if (line) parts.push(line)
  }
  const text = parts.join(' ').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim()
  if (!text) throw new Error('transkrip kosong')
  const details = info?.videoDetails ?? {}
  return { title: details.title ?? 'YouTube', lang: track.languageCode, text }
}
