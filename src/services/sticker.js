// Konversi media ke stiker WebP (ffmpeg) dan injeksi EXIF stiker WhatsApp.
// Semua file kerja lewat withTempDir; tidak ada file permanen.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withTempDir } from '../scrapers/runner.js'

const execFileP = promisify(execFile)

export const DEFAULT_STICKER_PACK = process.env.STICKER_PACK || 'KANA'
export const DEFAULT_STICKER_AUTHOR = process.env.STICKER_AUTHOR || 'KANA by OmniDevv'

export function stickerMeta(overrides = {}) {
  return {
    packName: overrides.packName || overrides.pack || DEFAULT_STICKER_PACK,
    publisher: overrides.publisher || overrides.author || DEFAULT_STICKER_AUTHOR,
    packId: overrides.packId || 'kana-md',
    emojis: overrides.emojis || ['🌸'],
  }
}

const SCALE_PAD =
  'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba'

// Ubah buffer gambar/video/gif menjadi WebP 512x512 siap stiker.
// animated: paksa jalur animasi (maks 6 detik, fps 15, loop tanpa henti).
export async function toStickerWebp(inputBuffer, { animated = false } = {}) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) throw new Error('Buffer media kosong')
  return withTempDir(async (dir) => {
    const input = join(dir, 'input.bin')
    const out = join(dir, 'out.webp')
    await writeFile(input, inputBuffer)
    const args = ['-y', '-i', input]
    if (animated) args.push('-t', '6', '-vf', `fps=15,${SCALE_PAD}`)
    else args.push('-vf', SCALE_PAD, '-frames:v', '1')
    args.push('-c:v', 'libwebp', '-lossless', '0', '-quality', '80', '-preset', 'default', '-loop', '0', '-an', out)
    try {
      await execFileP('ffmpeg', args, { timeout: 60000 })
    } catch (err) {
      throw new Error(`ffmpeg konversi stiker gagal: ${(err.stderr || err.message).slice(-300)}`)
    }
    return readFile(out)
  })
}

// Header TIFF kecil yang dipakai komunitas stiker WhatsApp: awalan TIFF,
// satu entri tag 0x5741 (undefined) yang panjangnya diisi panjang JSON dan
// offset datanya 22 (tepat sesudah header 22 byte ini).
function buildExifPayload({ packId, packName, publisher, emojis }) {
  const json = Buffer.from(
    JSON.stringify({
      'sticker-pack-id': packId || 'kana-md',
      'sticker-pack-name': packName || DEFAULT_STICKER_PACK,
      'sticker-pack-publisher': publisher || DEFAULT_STICKER_AUTHOR,
      emojis: Array.isArray(emojis) && emojis.length ? emojis : ['🌸'],
    }),
    'utf8'
  )
  const header = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x16, 0x00, 0x00, 0x00,
  ])
  header.writeUIntLE(json.length, 14, 4)
  return Buffer.concat([header, json])
}

function parseChunks(webpBuffer) {
  if (
    !Buffer.isBuffer(webpBuffer) ||
    webpBuffer.length < 12 ||
    webpBuffer.toString('ascii', 0, 4) !== 'RIFF' ||
    webpBuffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    throw new Error('Struktur WebP tidak dikenal (bukan RIFF/WEBP)')
  }
  const chunks = []
  let offset = 12
  while (offset + 8 <= webpBuffer.length) {
    const type = webpBuffer.toString('ascii', offset, offset + 4)
    const size = webpBuffer.readUInt32LE(offset + 4)
    if (offset + 8 + size > webpBuffer.length) throw new Error('Struktur WebP tidak dikenal (chunk melebihi ukuran file)')
    chunks.push({ type, size, dataStart: offset + 8, data: webpBuffer.subarray(offset + 8, offset + 8 + size) })
    offset += 8 + size + (size % 2)
  }
  return chunks
}

// Sisipkan chunk EXIF berisi metadata pack stiker ke RIFF WebP.
// Chunk EXIF lama (bila ada) dibuang dulu; ukuran RIFF diperbarui.
export function injectStickerExif(webpBuffer, meta = {}) {
  const chunks = parseChunks(webpBuffer)
  const payload = buildExifPayload(stickerMeta(meta))
  const kept = []
  for (const chunk of chunks) {
    if (chunk.type === 'EXIF') continue
    let data = chunk.data
    if (chunk.type === 'VP8X' && data.length >= 1) {
      // Bit EXIF (0x08) pada flags VP8X wajib dinyalakan supaya pembaca menemukannya.
      data = Buffer.from(data)
      data[0] = data[0] | 0x08
    }
    kept.push({ type: chunk.type, data })
  }
  kept.push({ type: 'EXIF', data: payload })

  const parts = [Buffer.from('WEBP', 'ascii')]
  for (const chunk of kept) {
    const head = Buffer.alloc(8)
    head.write(chunk.type, 0, 'ascii')
    head.writeUInt32LE(chunk.data.length, 4)
    parts.push(head, chunk.data)
    if (chunk.data.length % 2) parts.push(Buffer.from([0]))
  }
  const body = Buffer.concat(parts)
  const riff = Buffer.alloc(8)
  riff.write('RIFF', 0, 'ascii')
  riff.writeUInt32LE(body.length, 4)
  return Buffer.concat([riff, body])
}

// Baca kembali metadata pack dari chunk EXIF WebP. Null bila tidak ada EXIF.
export function parseExif(webpBuffer) {
  let chunks
  try {
    chunks = parseChunks(webpBuffer)
  } catch {
    return null
  }
  const exif = chunks.find((c) => c.type === 'EXIF')
  if (!exif) return null
  const start = exif.data.indexOf(0x7b)
  const end = exif.data.lastIndexOf(0x7d)
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(exif.data.toString('utf8', start, end + 1))
  } catch {
    return null
  }
}

export const parseStickerExif = parseExif
