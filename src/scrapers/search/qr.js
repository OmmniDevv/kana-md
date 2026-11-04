// QR code: buat gambar QR dari teks (paket qrcode) dan baca isi QR dari
// buffer gambar PNG atau JPEG (pngjs, jpeg-js, lalu jsqr).
import QRCode from 'qrcode'
import { PNG } from 'pngjs'
import jpeg from 'jpeg-js'
import jsQR from 'jsqr'

export async function generateQr(text) {
  const input = String(text || '').trim()
  if (!input) throw new Error('Teks QR wajib diisi')
  return QRCode.toBuffer(input, { type: 'png', width: 512, margin: 2 })
}

function decodePixels(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8
  const attempts = isPng ? ['png', 'jpeg'] : isJpeg ? ['jpeg', 'png'] : ['png', 'jpeg']
  for (const kind of attempts) {
    try {
      if (kind === 'png') {
        const png = PNG.sync.read(buffer)
        return { data: png.data, width: png.width, height: png.height }
      }
      const img = jpeg.decode(buffer, { useTArray: true, formatAsRGBA: true })
      if (img?.data) return { data: img.data, width: img.width, height: img.height }
    } catch {
      // coba dekoder berikutnya
    }
  }
  return null
}

export function readQr(buffer) {
  const pixels = decodePixels(buffer)
  if (!pixels) return null
  try {
    const code = jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)
    return code?.data || null
  } catch {
    return null
  }
}
