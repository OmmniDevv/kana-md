// Unduh video YouTube (mp4 gabungan video+audio, maks 720p) lewat
// @distube/ytdl-core. Input bisa URL video langsung atau kata kunci
// pencarian (hasil pertama dipakai, search dari modul youtube inti).
// Video diunduh ke folder temp, dibaca jadi Buffer, file selalu dihapus.
import { Ytdl, parseVideoId } from '@distube/ytdl-core'
import { createWriteStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { retry, withTempDir } from '../runner.js'
import { searchSongs, formatSeconds } from '../youtube/youtube.js'

const yt = new Ytdl()

export function isYouTubeUrl(text) {
  return /(?:youtube\.com|youtu\.be)/i.test(String(text || ''))
}

export function pickVideoFormat(formats) {
  const combined = (formats || []).filter((f) => f.hasVideo && f.hasAudio && !f.isHLS && !f.isDashMPD)
  if (!combined.length) return null
  const scored = combined.map((f) => {
    const height = parseInt(String(f.qualityLabel || '').match(/(\d+)p/)?.[1] || '0', 10)
    const mp4Bonus = /mp4/i.test(f.mimeType || '') ? 1 : 0
    return { format: f, height, mp4Bonus }
  })
  const within = scored.filter((s) => s.height > 0 && s.height <= 720)
  const pool = within.length ? within : scored
  pool.sort((a, b) => b.height - a.height || b.mp4Bonus - a.mp4Bonus || (b.bitrate || 0) - (a.bitrate || 0))
  return pool[0].format
}

async function downloadVideoOnce(videoUrl, dir, maxBytes) {
  const info = await yt.getInfo(videoUrl)
  const format = pickVideoFormat(info.formats)
  if (!format) throw new Error('Format video gabungan (video+audio) tidak tersedia')
  const filePath = path.join(dir, `${randomUUID()}.mp4`)
  const stream = yt.download(info, { format })
  await pipeline(stream, createWriteStream(filePath))
  const file = await stat(filePath)
  if (!file.size) throw new Error('File video kosong')
  if (maxBytes && file.size > maxBytes) {
    const err = new Error(`Video terlalu besar (${(file.size / 1048576).toFixed(1)} MB)`)
    err.code = 'TOO_BIG'
    throw err
  }
  const buffer = await readFile(filePath)
  const details = info.videoDetails
  return {
    buffer,
    sizeBytes: file.size,
    quality: format.qualityLabel || '',
    info: {
      title: details?.title || null,
      artist: details?.author?.name || null,
      duration: Number(details?.lengthSeconds) || 0,
      durationText: formatSeconds(details?.lengthSeconds),
      url: details?.video_url || videoUrl,
    },
  }
}

export async function downloadVideoByUrlOrQuery(input, { maxBytes = 64 * 1024 * 1024 } = {}) {
  const text = String(input || '').trim()
  if (!text) throw new Error('URL atau judul video wajib diisi')
  let videoUrl = null
  if (isYouTubeUrl(text)) {
    videoUrl = text.split(/\s+/)[0]
    if (!parseVideoId(videoUrl)) throw new Error('URL YouTube tidak valid')
  } else {
    const search = await searchSongs(text)
    videoUrl = search.results[0]?.url
    if (!videoUrl) throw new Error('Video tidak ditemukan')
  }
  return withTempDir((dir) => retry(() => downloadVideoOnce(videoUrl, dir, maxBytes), { retries: 1, baseDelay: 1500 }))
}
