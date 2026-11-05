// Tes perbaikan 2026-11-05 sore (laporan user langsung):
// 1. ytmp4: format gabungan kosong tidak lagi langsung gagal; ada pemilih
//    format terpisah (video-only + audio-only) untuk jalur mux ffmpeg.
// 2. kisahnabi: pemecah kisah full jadi bagian berurutan + peta judul wiki
//    menutupi semua 25 nabi lokal.
// 3. suratcinta: long text alay minimal 600 kata dengan personalisasi nama.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickVideoFormat, pickSeparateFormats } from '../src/scrapers/download/ytmp4.js'
import { WIKI_TITLES, cleanExtract, splitStory } from '../src/scrapers/search/kisahnabi.js'
import { KISAH_NABI } from '../src/data/religi.js'
import { buildLetter, wordCount, test as suratTest } from '../plugins/fun/suratcinta.js'
import { findNabi, test as kisahTest } from '../plugins/fun/kisahnabi.js'

const FMT = (over) => ({
  hasVideo: false,
  hasAudio: false,
  isHLS: false,
  isDashMPD: false,
  qualityLabel: '',
  mimeType: '',
  bitrate: 0,
  audioBitrate: 0,
  itag: 0,
  ...over,
})

test('ytmp4: tanpa format gabungan, pasangan terpisah tetap terpilih', () => {
  const formats = [
    FMT({ hasVideo: true, qualityLabel: '360p', mimeType: 'video/mp4', bitrate: 500, itag: 134 }),
    FMT({ hasVideo: true, qualityLabel: '720p', mimeType: 'video/mp4', bitrate: 1500, itag: 136 }),
    FMT({ hasVideo: true, qualityLabel: '1080p', mimeType: 'video/webm', bitrate: 2500, itag: 248 }),
    FMT({ hasAudio: true, mimeType: 'audio/mp4', audioBitrate: 128, itag: 140 }),
    FMT({ hasAudio: true, mimeType: 'audio/webm', audioBitrate: 160, itag: 251 }),
  ]
  assert.equal(pickVideoFormat(formats), null)
  const pair = pickSeparateFormats(formats)
  assert.ok(pair)
  assert.equal(pair.video.itag, 136)
  assert.equal(pair.audio.itag, 140)
})

test('ytmp4: format gabungan tetap didahulukan bila ada', () => {
  const formats = [
    FMT({ hasVideo: true, hasAudio: true, qualityLabel: '720p', mimeType: 'video/mp4', bitrate: 2000, itag: 22 }),
    FMT({ hasVideo: true, qualityLabel: '720p', mimeType: 'video/mp4', bitrate: 1500, itag: 136 }),
    FMT({ hasAudio: true, mimeType: 'audio/mp4', audioBitrate: 128, itag: 140 }),
  ]
  assert.equal(pickVideoFormat(formats).itag, 22)
})

test('kisahnabi: semua 25 nabi lokal punya judul artikel wiki', () => {
  assert.equal(KISAH_NABI.length, 25)
  for (const item of KISAH_NABI) {
    assert.ok(WIKI_TITLES[item.nama], `judul wiki hilang untuk ${item.nama}`)
  }
})

test('kisahnabi: cleanExtract memotong seksi referensi dan pranala luar', () => {
  const raw = 'Isi kisah yang panjang.\n\n== Referensi ==\nCatatan 1\n== Pranala luar ==\nhttps://contoh.invalid'
  const clean = cleanExtract(raw)
  assert.ok(clean.startsWith('Isi kisah'))
  assert.ok(!/Referensi/.test(clean))
  assert.ok(!/Pranala luar/.test(clean))
})

test('kisahnabi: splitStory memecah teks panjang di batas wajar dan utuh', () => {
  const para = 'Kalimat kisah yang cukup panjang untuk diuji. '.repeat(40)
  const text = Array.from({ length: 6 }, () => para).join('\n\n')
  const parts = splitStory(text, 3000)
  assert.ok(parts.length >= 2)
  for (const p of parts) assert.ok(p.length <= 3100)
  const words = (s) => s.split(/\s+/).filter(Boolean)
  assert.deepEqual(words(parts.join(' ')), words(text))
})

test('kisahnabi: ejaan alternatif user ketemu dan definisi tes substantif', () => {
  assert.equal(findNabi('zulkifli').nama, 'Dzulkifli')
  assert.equal(findNabi('saleh').nama, 'Shaleh')
  assert.equal(findNabi('25').nama, 'Muhammad')
  assert.equal(kisahTest.input, '.kisahnabi muhammad')
  assert.ok(kisahTest.expect.test('kisah ini berakhir dengan wafat beliau'))
})

test('suratcinta: long text alay minimal 600 kata, nama penerima muncul', () => {
  for (let i = 0; i < 12; i += 1) {
    const letter = buildLetter('id', 'Sinta', 'Untuk Sinta tersayang,')
    assert.ok(wordCount(letter) >= 600, `surat terlalu pendek: ${wordCount(letter)} kata`)
    assert.ok(suratTest.expect.test(letter))
    assert.ok(letter.includes('Sinta'))
    assert.ok(letter.split('\n\n').length >= 8)
  }
})
