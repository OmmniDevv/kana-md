// Scraper Google Drive: ekstrak file id dari URL berbagi lalu unduh lewat
// endpoint uc?export=download. File besar bisa kena halaman perantara
// pemindaian virus dari Google; itu ditangkap plugin sebagai error jujur.
import { assertSafeUrl } from '../runner.js'

export function extractDriveFileId(rawUrl) {
  const text = String(rawUrl || '').trim()
  const fromPath = text.match(/\/file\/d\/([\w-]{10,})/)
  if (fromPath) return fromPath[1]
  try {
    const id = new URL(text).searchParams.get('id')
    if (id && /^[\w-]{10,}$/.test(id)) return id
  } catch {
    // bukan URL valid
  }
  return null
}

export function assertDriveUrl(rawUrl) {
  const url = assertSafeUrl(rawUrl)
  if (url.hostname.toLowerCase() !== 'drive.google.com') {
    throw new Error('Link harus dari drive.google.com')
  }
  const id = extractDriveFileId(url.href)
  if (!id) throw new Error('File id tidak ditemukan di link Google Drive')
  return { url, id }
}

export function buildDriveDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`
}
