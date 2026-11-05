// Scraper TikTok: unduh video/slide/musik dari URL TikTok.
// Sumber utama: kode kiriman user (owner) 2026-11-04, API api.tiklydown.eu.org.
// Fallback: tikwm.com API, adaptasi dari snippet Jerexd di
// https://dpaste.org/YNLWj/raw (diakses 2026-11-04), hasil dinormalisasi ke
// bentuk yang sama. Fallback lanjutan (2026-11-05): unduhmedia.web.id dari
// snippet Vellzyy dan tokgrab-app.vercel.app dari snippet Ttdl kiriman user,
// keduanya dinormalisasi ke bentuk yang sama. Adaptasi kana-md: proteksi
// SSRF dan validasi host TikTok.
import { assertSafeUrl, retry, sleep } from '../runner.js'

const TT_HOST = /(^|\.)tiktok\.com$/i
const TIKWM = 'https://www.tikwm.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const abs = (u) => (u ? (u.startsWith('http') ? u : TIKWM + u) : null)

async function jget(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'User-Agent': UA, ...(opts.headers || {}) },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  return res.json()
}

function normalizeResult({ title, author, cover, duration, video, videoWm, audio, images, source }) {
  return {
    status: true,
    source,
    result: {
      title: title || null,
      author: author || null,
      cover: cover || null,
      duration: duration ?? null,
      type: images?.length ? 'image' : 'video',
      video: video || null,
      videoWatermark: videoWm || null,
      audio: audio || null,
      images: images || [],
    },
  }
}

async function viaTiklydown(url) {
  const api = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
  const data = await jget(api)
  if (!data || data.status === false) throw new Error(data?.message || 'Tiklydown tidak mengembalikan hasil')
  const video = data.video || data
  const noWm = video.noWatermark || video.nowatermark || data.noWatermark || null
  const wm = video.watermark || data.watermark || null
  const images = (data.images || video.images || []).map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
  const audio = data.music?.play_url || data.music?.url || data.audio || null
  if (!noWm && !wm && !images.length) throw new Error('Link video TikTok tidak ditemukan di Tiklydown')
  return normalizeResult({
    title: data.title || data.desc || null,
    author: data.author?.name || data.author?.nickname || null,
    cover: data.cover || data.thumbnail || null,
    duration: data.duration ?? null,
    video: noWm,
    videoWm: wm,
    audio,
    images,
    source: 'tiklydown',
  })
}

async function tikwmMeta(input) {
  // tikwm free tier: maksimal 1 request per detik, retry santai saat kena limit.
  let last = ''
  for (let i = 0; i < 5; i++) {
    if (i) await sleep(1500 * i)
    const j = await jget(`${TIKWM}/api/?url=${encodeURIComponent(input)}&hd=1`)
    if (j.msg === 'success' && j.data) return j.data
    last = `${j.msg || 'unknown'} (code ${j.code})`
    if (!/second|rate|limit/i.test(last)) break
  }
  throw new Error(`Gagal scrape tikwm: ${last}`)
}

async function tikwmHd(input) {
  try {
    const submit = await jget(`${TIKWM}/api/video/task/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: input, web: 1 }),
    })
    const taskId = submit?.data?.task_id
    if (!taskId) return null
    for (let i = 0; i < 10; i++) {
      await sleep(1500)
      const r2 = await jget(`${TIKWM}/api/video/task/result?task_id=${taskId}`)
      const d = r2?.data?.detail
      if (d?.download_url) return abs(d.download_url)
      if (r2?.data?.status === 'failed') return null
    }
  } catch {}
  return null
}

async function viaTikwm(url) {
  const d = await tikwmMeta(url)
  let video = abs(d.play || d.wmplay)
  if (!d.images?.length && d.play) {
    const hd = await tikwmHd(url)
    if (hd) video = hd
  }
  return normalizeResult({
    title: d.title || null,
    author: d.author ? `${d.author.nickname || ''} (@${d.author.unique_id || '-'})` : null,
    cover: abs(d.cover),
    duration: d.duration ?? null,
    video: d.images?.length ? null : video,
    videoWm: abs(d.wmplay),
    audio: abs(d.music),
    images: (d.images || []).map(abs),
    source: 'tikwm',
  })
}

// Fallback 3: unduhmedia.web.id, adaptasi snippet "Downloader Tiktok" by Vellzyy
// (kiriman user 2026-11-05). API mengembalikan id media; URL unduh dibangun dari
// endpoint action=download seperti di snippet.
async function viaUnduhmedia(url) {
  const api = `https://www.unduhmedia.web.id/api/tiktok?url=${encodeURIComponent(url)}`
  const data = await jget(api, { headers: { Referer: 'https://www.unduhmedia.web.id/', Accept: 'application/json, */*' } })
  if (!data || data.status === false || (!data.videoId && !data.audioId && !data.images?.length)) {
    throw new Error(data?.message || 'Unduhmedia tidak mengembalikan media')
  }
  const build = (id, filename) => `https://www.unduhmedia.web.id/api/tiktok?action=download&id=${encodeURIComponent(id)}&filename=${filename}`
  const author = typeof data.author === 'string' ? data.author : data.author?.nickname || data.author?.name || null
  return normalizeResult({
    title: data.description || null,
    author,
    cover: data.cover || data.thumbnail || null,
    duration: data.duration ?? null,
    video: data.videoId ? build(data.videoId, 'video.mp4') : null,
    videoWm: null,
    audio: data.audioId ? build(data.audioId, 'audio.mp3') : null,
    images: Array.isArray(data.images) ? data.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean) : [],
    source: 'unduhmedia',
  })
}

// Fallback 4: tokgrab-app.vercel.app, adaptasi snippet Ttdl kiriman user
// 2026-11-05 (penulis tidak tercantum di file). Bentuk respons tidak
// terstandardisasi, jadi URL media dicari secara defensif per kunci umum.
function pickByKeys(obj, keys, depth = 0) {
  if (!obj || depth > 4) return null
  if (Array.isArray(obj)) { for (const v of obj) { const u = pickByKeys(v, keys, depth + 1); if (u) return u } return null }
  if (typeof obj === 'object') {
    for (const k of keys) {
      const v = obj[k]
      if (typeof v === 'string' && /^https:\/\//.test(v)) return v
      if (v && typeof v === 'object') { const u = pickByKeys(v, keys, depth + 1); if (u) return u }
    }
    for (const v of Object.values(obj)) { const u = pickByKeys(v, keys, depth + 1); if (u) return u }
  }
  return null
}

async function viaTokgrab(url) {
  const api = `https://tokgrab-app.vercel.app/api/download/tiktok?url=${encodeURIComponent(url)}`
  const data = await jget(api)
  if (!data || data.success === false || data.status === false) throw new Error(data?.message || 'Tokgrab tidak mengembalikan hasil')
  const video = pickByKeys(data, ['noWatermark', 'nowm', 'no_watermark', 'video', 'play', 'download'])
  const audio = pickByKeys(data, ['music', 'audio', 'mp3'])
  const imagesRaw = pickByKeys(data, ['images', 'imageList'])
  if (!video && !audio && !imagesRaw) throw new Error('Media TikTok tidak ditemukan di Tokgrab')
  return normalizeResult({
    title: data.title || data.desc || data.description || null,
    author: typeof data.author === 'string' ? data.author : data.author?.nickname || data.author?.name || null,
    cover: pickByKeys(data, ['cover', 'thumbnail', 'poster']),
    duration: data.duration ?? null,
    video,
    videoWm: null,
    audio,
    images: Array.isArray(imagesRaw) ? imagesRaw.filter((x) => typeof x === 'string') : [],
    source: 'tokgrab',
  })
}

export async function tiktokDownload(url) {
  try {
    const parsed = assertSafeUrl(url)
    if (!TT_HOST.test(parsed.hostname)) throw new Error('URL harus dari tiktok.com')
    try {
      return await retry(() => viaTiklydown(parsed.href), { retries: 1, baseDelay: 1000 })
    } catch {}
    try {
      return await viaTikwm(parsed.href)
    } catch {}
    try {
      return await viaUnduhmedia(parsed.href)
    } catch {}
    return await viaTokgrab(parsed.href)
  } catch (error) {
    return { status: false, message: error.message || 'Gagal mengunduh TikTok' }
  }
}

export default tiktokDownload
