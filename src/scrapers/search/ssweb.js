// Screenshot web lewat WordPress mShots (gratis tanpa key). mShots kadang
// mengembalikan gambar placeholder "Generating Preview" pada permintaan
// pertama; itu perilaku layanannya dan diterima apa adanya.
import { assertSafeUrl, downloadBuffer } from '../runner.js'

export async function getScreenshot(rawUrl) {
  const url = assertSafeUrl(rawUrl)
  const shotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url.href)}?w=1024`
  const { buffer, contentType } = await downloadBuffer(shotUrl, { maxBytes: 16 * 1024 * 1024, timeout: 45000 })
  if (!contentType.startsWith('image/')) {
    throw new Error('Layanan screenshot tidak mengembalikan gambar')
  }
  return { buffer, contentType, target: url.href }
}
