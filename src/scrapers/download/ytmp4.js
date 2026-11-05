// Unduh video YouTube (mp4, maks 720p) lewat @distube/ytdl-core.
// Input bisa URL video langsung atau kata kunci pencarian (hasil pertama
// dipakai, search dari modul youtube inti). Video diunduh ke folder temp,
// dibaca jadi Buffer, file selalu dihapus.
//
// Rantai format (diperbaiki 2026-11-05): YouTube makin jarang menyajikan
// format gabungan video+audio ke klien ini, jadi:
// 1. format gabungan terbaik bila ada;
// 2. bila tidak ada, unduh video-only + audio-only terbaik lalu gabung
//    (mux) pakai ffmpeg (salin video bila bisa, transcode bila perlu);
// 3. error jujur hanya bila semua jalur gagal.
import { Ytdl, parseVideoId } from '@distube/ytdl-core'
import { execFile } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'
import { retry, withTempDir } from '../runner.js'
import { searchSongs, formatSeconds } from '../youtube/youtube.js'

const execFileP = promisify(execFile)
const yt = new Ytdl()

export function isYouTubeUrl(text) {
  return /(?:youtube\.com|youtu\.be)/i.test(String(text || ''))
}

function heightOf(format) {
  return parseInt(String(format?.qualityLabel || '').match(/(\d+)p/)?.[1] || '0', 10)
}

export function pickVideoFormat(formats) {
  const combined = (formats || []).filter((f) => f.hasVideo && f.hasAudio && !f.isHLS && !f.isDashMPD)
  if (!combined.length) return null
  const scored = combined.map((f) => {
    const height = heightOf(f)
    const mp4Bonus = /mp4/i.test(f.mimeType || '') ? 1 : 0
    return { format: f, height, mp4Bonus }
  })
  const within = scored.filter((s) => s.height > 0 && s.height <= 720)
  const pool = within.length ? within : scored
  pool.sort((a, b) => b.height - a.height || b.mp4Bonus - a.mp4Bonus || (b.bitrate || 0) - (a.bitrate || 0))
  return pool[0].format
}

// Pasangan format terpisah terbaik untuk mux: video-only (maks 720p,
// mp4 didahulukan) + audio-only (m4a/mp4 didahulukan, bitrate tertinggi).
export function pickSeparateFormats(formats) {
  const list = formats || []
  const videos = list
    .filter((f) => f.hasVideo && !f.hasAudio && !f.isHLS && !f.isDashMPD)
    .map((f) => ({ format: f, height: heightOf(f), mp4Bonus: /mp4/i.test(f.mimeType || '') ? 1 : 0 }))
    .filter((s) => s.height > 0)
  if (!videos.length) return null
  const within = videos.filter((s) => s.height <= 720)
  const vPool = within.length ? within : videos
  vPool.sort((a, b) => b.height - a.height || b.mp4Bonus - a.mp4Bonus || (b.bitrate || 0) - (a.bitrate || 0))
  const audios = list
    .filter((f) => f.hasAudio && !f.hasVideo)
    .map((f) => ({ format: f, mp4Bonus: /mp4|m4a/i.test(f.mimeType || '') ? 1 : 0 }))
  if (!audios.length) return null
  audios.sort((a, b) => b.mp4Bonus - a.mp4Bonus || (b.audioBitrate || 0) - (a.audioBitrate || 0))
  return { video: vPool[0].format, audio: audios[0].format }
}

async function downloadToFile(info, format, filePath) {
  const stream = yt.download(info, { format })
  await pipeline(stream, createWriteStream(filePath))
  const file = await stat(filePath)
  if (!file.size) throw new Error('File hasil unduhan kosong')
  return file.size
}

// Gabung video+audio jadi satu mp4. Coba salin stream video (cepat);
// bila codec video bukan h264/mp4, transcode ke libx264 maks 720p.
export async function muxToMp4(videoPath, audioPath, outPath) {
  const base = ['-y', '-i', videoPath, '-i', audioPath]
  const tail = ['-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', outPath]
  try {
    await execFileP('ffmpeg', [...base, '-c:v', 'copy', ...tail], { timeout: 300000 })
  } catch {
    await execFileP(
      'ffmpeg',
      [...base, '-c:v', 'libx264', '-vf', 'scale=-2:min(720\\,ih)', '-preset', 'veryfast', '-crf', '23', ...tail],
      { timeout: 900000 }
    )
  }
}

async function downloadVideoOnce(videoUrl, dir, maxBytes) {
  const info = await yt.getInfo(videoUrl)
  const details = info.videoDetails
  const meta = {
    title: details?.title || null,
    artist: details?.author?.name || null,
    duration: Number(details?.lengthSeconds) || 0,
    durationText: formatSeconds(details?.lengthSeconds),
    url: details?.video_url || videoUrl,
  }
  const filePath = path.join(dir, `${randomUUID()}.mp4`)
  let quality = ''

  const combined = pickVideoFormat(info.formats)
  if (combined) {
    quality = combined.qualityLabel || ''
    await downloadToFile(info, combined, filePath)
  } else {
    const pair = pickSeparateFormats(info.formats)
    if (!pair) {
      throw new Error('YouTube tidak menyajikan format video maupun audio yang bisa diunduh untuk video ini')
    }
    quality = pair.video.qualityLabel || ''
    const videoPath = path.join(dir, `${randomUUID()}.video`)
    const audioPath = path.join(dir, `${randomUUID()}.audio`)
    await downloadToFile(info, pair.video, videoPath)
    await downloadToFile(info, pair.audio, audioPath)
    await muxToMp4(videoPath, audioPath, filePath)
  }

  const file = await stat(filePath)
  if (!file.size) throw new Error('File video kosong')
  if (maxBytes && file.size > maxBytes) {
    const err = new Error(`Video terlalu besar (${(file.size / 1048576).toFixed(1)} MB)`)
    err.code = 'TOO_BIG'
    throw err
  }
  const buffer = await readFile(filePath)
  return { buffer, sizeBytes: file.size, quality, info: meta }
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
