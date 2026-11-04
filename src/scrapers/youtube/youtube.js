// Scraper YouTube: search dan play (unduh audio) lewat @distube/ytdl-core.
// Sumber: kode kiriman user (owner) 2026-11-04, logika inti dipertahankan.
// Adaptasi kana-md: versi asli menulis file permanen ke folder downloads;
// di sini audio diunduh ke folder temp, dibaca jadi Buffer, lalu file selalu
// dihapus (aturan proyek: tidak ada file media permanen).
import { Ytdl, Quality } from '@distube/ytdl-core'
import { createWriteStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { retry, withTempDir } from '../runner.js'

const SETTING = {
  limit: 5,
  retries: 2,
}

const yt = new Ytdl()

export function formatSeconds(totalSeconds) {
  const total = Math.max(0, Math.round(Number(totalSeconds) || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function normalizeVideo(video, index) {
  const details = video.videoDetails || video
  return {
    index,
    id: details.videoId || video.id || null,
    title: details.title || video.title || null,
    artist:
      typeof details.author === 'object'
        ? details.author?.name
        : details.author || video.author?.name || null,
    duration: Number(details.lengthSeconds || video.lengthSeconds) || 0,
    durationText: formatSeconds(details.lengthSeconds || video.lengthSeconds),
    thumbnail: details.thumbnails?.at(-1)?.url || video.thumbnails?.at(-1)?.url || null,
    url: details.video_url || video.url || null,
    views: Number(details.viewCount || video.viewCount) || 0,
  }
}

export async function searchSongs(query, limit = SETTING.limit) {
  const keyword = String(query || '').trim()
  if (!keyword) throw new Error('Query lagu belum diisi')
  const safeLimit = Math.max(1, Math.min(20, Number(limit) || SETTING.limit))
  const videos = await yt.search(keyword, { limit: safeLimit })
  const results = videos.map((video, index) => normalizeVideo(video, index + 1))
  return { status: true, query: keyword, total: results.length, results }
}

async function downloadAudioOnce(videoUrl, dir, maxBytes) {
  const info = await yt.getInfo(videoUrl)
  const formats = info.formats
    .filter((format) => format.hasAudio && !format.hasVideo && !format.isHLS && !format.isDashMPD && !format.isOtf)
    .sort((a, b) => (b.audioBitrate || b.bitrate || 0) - (a.audioBitrate || a.bitrate || 0))
  if (!formats.length) {
    throw new Error('Format audio langsung tidak tersedia')
  }
  const selectedFormat = formats[0]
  const mime = selectedFormat.mimeType || ''
  const extension = mime.includes('audio/mp4')
    ? 'm4a'
    : mime.includes('audio/webm')
      ? 'webm'
      : mime.includes('audio/mpeg')
        ? 'mp3'
        : 'audio'
  const filePath = path.join(dir, `${randomUUID()}.${extension}`)
  const stream = yt.download(info, { quality: Quality.HighestAudio, format: selectedFormat })
  await pipeline(stream, createWriteStream(filePath))
  const file = await stat(filePath)
  if (!file.size) throw new Error('File audio kosong')
  if (maxBytes && file.size > maxBytes) {
    const err = new Error(`Audio terlalu besar (${(file.size / 1048576).toFixed(1)} MB)`)
    err.code = 'TOO_BIG'
    throw err
  }
  const buffer = await readFile(filePath)
  const details = info.videoDetails
  return {
    buffer,
    filename: `audio.${extension}`,
    format: extension,
    mimeType: mime || 'audio/mp4',
    sizeBytes: file.size,
    info: {
      title: details?.title || null,
      artist: details?.author?.name || null,
      duration: Number(details?.lengthSeconds) || 0,
      durationText: formatSeconds(details?.lengthSeconds),
      thumbnail: details?.thumbnails?.at(-1)?.url || null,
      url: details?.video_url || videoUrl,
    },
  }
}

// Unduh audio dari URL video. Buffer dikembalikan, file temp selalu dihapus.
export async function downloadAudio(videoUrl, { maxBytes = 16 * 1024 * 1024 } = {}) {
  return withTempDir((dir) =>
    retry(() => downloadAudioOnce(videoUrl, dir, maxBytes), { retries: SETTING.retries, baseDelay: 1500 })
  )
}

// Search lalu unduh audio hasil pertama. Dipakai perintah .play.
export async function playSong(query, { maxBytes = 16 * 1024 * 1024 } = {}) {
  const search = await searchSongs(query)
  const selected = search.results[0]
  if (!selected?.url) throw new Error('Lagu tidak ditemukan')
  const audio = await downloadAudio(selected.url, { maxBytes })
  return { status: true, query: search.query, search, selected, ...audio }
}
