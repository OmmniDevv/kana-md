// Hapus latar gambar lewat layanan matte Pixelcut yang dipakai web
// pixa.com (port dari scraper removebackground Elaina-MD): POST multipart
// tanpa API key, hasil PNG ber-alpha. Terverifikasi dari VM ini: foto
// JPEG 300x300 menghasilkan PNG 200 dengan color type 6 (alpha).
// Kegagalan HTTP dan hasil bukan PNG dilempar sebagai error jelas.
import { PNG } from 'pngjs'
import { retry, withBreaker } from '../runner.js'

export const MATTE_URL = 'https://api2.pixelcut.app/image/matte/v1'
export const MAX_INPUT_BYTES = 16 * 1024 * 1024

// Jenis gambar dari magic bytes: 'jpeg' | 'png' | 'webp' | null.
export function imageKind(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg'
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp'
  return null
}

// Validasi hasil matte: harus PNG terbaca dan punya kanal alpha
// (color type 6 atau 4). Mengembalikan { width, height, colorType }.
export function parseMattePng(buffer) {
  if (!Buffer.isBuffer(buffer) || imageKind(buffer) !== 'png') return null
  try {
    const png = PNG.sync.read(buffer)
    if (png.colorType !== 6 && png.colorType !== 4) return null
    return { width: png.width, height: png.height, colorType: png.colorType }
  } catch {
    return null
  }
}

// Kirim satu gambar ke layanan matte dan kembalikan Buffer PNG hasilnya.
// fetchImpl bisa disuntik buat tes; timeout panjang karena layanan ini
// lambat (probe terburuk puluhan detik).
export async function removeBackground(input, { fetchImpl = fetch, timeout = 110000 } = {}) {
  const kind = imageKind(input)
  if (!kind) throw new Error('Berkas sumber bukan gambar JPEG, PNG, atau WebP yang valid')
  if (input.length > MAX_INPUT_BYTES) throw new Error('Gambar sumber terlalu besar (maks 16 MB)')
  const mime = kind === 'jpeg' ? 'image/jpeg' : kind === 'png' ? 'image/png' : 'image/webp'
  const ext = kind === 'jpeg' ? 'jpg' : kind
  return withBreaker('pixelcut-matte', () =>
    retry(
      async () => {
        const form = new FormData()
        form.append('image', new Blob([input], { type: mime }), `image.${ext}`)
        form.append('format', 'png')
        form.append('model', 'v1')
        const res = await fetchImpl(MATTE_URL, {
          method: 'POST',
          signal: AbortSignal.timeout(timeout),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            Accept: 'application/json, text/plain, */*',
            'x-locale': 'en',
            'x-client-version': 'web:pixa.com:4a5b0af2',
            origin: 'https://www.pixa.com',
            referer: 'https://www.pixa.com/',
          },
          body: form,
        })
        const buffer = Buffer.from(await res.arrayBuffer())
        if (!res.ok) {
          let detail = ''
          try {
            detail = JSON.parse(buffer.toString('utf8'))?.error || ''
          } catch {
            detail = ''
          }
          throw new Error(`Pixelcut balas HTTP ${res.status}${detail ? `: ${detail}` : ''}`)
        }
        if (!parseMattePng(buffer)) throw new Error('Pixelcut tidak mengembalikan PNG transparan yang valid')
        return buffer
      },
      { retries: 1, baseDelay: 1500 }
    )
  )
}
