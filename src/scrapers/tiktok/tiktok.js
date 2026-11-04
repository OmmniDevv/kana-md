// Scraper TikTok: unduh video/slide/musik dari URL TikTok.
// Sumber utama: kode kiriman user (owner) 2026-11-04, API api.tiklydown.eu.org.
// Fallback: tikwm.com API, adaptasi dari snippet Jerexd di
// https://dpaste.org/YNLWj/raw (diakses 2026-11-04), hasil dinormalisasi ke
// bentuk yang sama. Adaptasi kana-md: proteksi SSRF dan validasi host TikTok.
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

export async function tiktokDownload(url) {
  try {
    const parsed = assertSafeUrl(url)
    if (!TT_HOST.test(parsed.hostname)) throw new Error('URL harus dari tiktok.com')
    try {
      return await retry(() => viaTiklydown(parsed.href), { retries: 1, baseDelay: 1000 })
    } catch {
      return await viaTikwm(parsed.href)
    }
  } catch (error) {
    return { status: false, message: error.message || 'Gagal mengunduh TikTok' }
  }
}

export default tiktokDownload
