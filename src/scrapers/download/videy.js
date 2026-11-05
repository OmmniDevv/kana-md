// Downloader videy.co: berkas video dihosting publik di CDN dengan
// pola https://cdn.videy.co/<id>.mp4 (terkonfirmasi dari bundle JS
// resmi videy.co dan terverifikasi ujung ke ujung 2026-11-05: unggah
// klip uji anonim menghasilkan id, berkas CDN yang terunduh identik
// byte-for-byte dengan berkas yang diunggah).
import { downloadBuffer } from '../runner.js'

const VIDEY_ID = /^[A-Za-z0-9_-]{6,20}$/

// Terima tautan videy.co/v?id=<id> atau videy.co/v/?id=<id>; kembalikan
// id-nya atau null bila bukan tautan videy yang valid.
export function extractVideyId(rawUrl) {
  let url
  try {
    url = new URL(String(rawUrl).trim())
  } catch {
    return null
  }
  if (!/(^|\.)videy\.co$/i.test(url.hostname)) return null
  const id = url.searchParams.get('id') || ''
  return VIDEY_ID.test(id) ? id : null
}

export function videyFileUrl(id) {
  return `https://cdn.videy.co/${id}.mp4`
}

function isMp4(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length > 12 && buffer.subarray(4, 8).toString() === 'ftyp'
}

// Unduh video videy dari tautan tontonnya. Melempar Error berpesan
// jelas untuk tautan tidak valid, video tidak ditemukan (404), dan
// berkas yang bukan MP4.
export async function downloadVidey(rawUrl, { download = downloadBuffer } = {}) {
  const id = extractVideyId(rawUrl)
  if (!id) throw new Error('tautan videy tidak valid')
  let media
  try {
    media = await download(videyFileUrl(id), { maxBytes: 64 * 1024 * 1024, timeout: 60000 })
  } catch (err) {
    if (/HTTP 404/.test(err.message)) throw new Error('video tidak ditemukan di videy (sudah dihapus?)')
    throw err
  }
  if (!isMp4(media.buffer)) throw new Error('berkas dari videy bukan video MP4 yang valid')
  return { id, buffer: media.buffer, size: media.buffer.length }
}
