// Pixeldrain: API publik resmi (pixeldrain.com/api) tanpa kunci untuk
// berkas publik. Info dari /api/file/<id>/info, berkas dari
// /api/file/<id>. Terverifikasi 2026-11-04 (info + range 206).
export function extractPixeldrainId(text) {
  const match = String(text ?? '').match(/pixeldrain\.com\/(?:u|d|file)\/([a-zA-Z0-9]{6,})/)
  return match ? match[1] : null
}

export async function pixeldrainInfo(id) {
  const res = await fetch(`https://pixeldrain.com/api/file/${id}/info`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`Pixeldrain membalas HTTP ${res.status}`)
  const data = await res.json()
  if (!data?.success) throw new Error('berkas Pixeldrain tidak ditemukan')
  return data
}

export function pixeldrainFileUrl(id) {
  return `https://pixeldrain.com/api/file/${id}?download`
}
