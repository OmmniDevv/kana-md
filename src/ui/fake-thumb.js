// Helper thumbnail palsu (fake thumbnail) ala bot MD klasik: satu pesan teks
// dengan kartu pratinjau menempel, tanpa mengirim gambar beneran (galeri HP
// user tetap bersih).
//
// Mekanisme terverifikasi di source library @rexxhayanasi/elaina-baileys
// v1.4.7 (src/Utils/messages.js, generateWAMessageContent): field top-level
// `externalAdReply` pada konten sendMessage digabung library ke dalam
// contextInfo.externalAdReply pesan yang dibuat. Field yang dibaca library:
// title, body, mediaType (1 = gambar), thumbnail (wajib Buffer), url (jadi
// sourceUrl; kosong diisi library dengan URL donasinya, jadi selalu isi),
// largeThumbnail (jadi renderLargerThumbnail), mediaUrl, thumbnailUrl.
import { readFile } from 'node:fs/promises'
import jpeg from 'jpeg-js'

export const FAKE_THUMB_TITLE = 'KANA MD'
const DEFAULT_SOURCE_URL = 'https://github.com/OmmniDevv/kana-md'

// Perkecil JPEG ke lebar maksimum memakai jpeg-js murni (sudah dependensi
// proyek). Gagal decode: kembalikan buffer asal apa adanya.
export function shrinkJpeg(buffer, maxWidth = 320, quality = 65) {
  try {
    const decoded = jpeg.decode(buffer, { useTArray: true, maxMemoryUsageInMB: 256 })
    if (!decoded?.width || decoded.width <= maxWidth) return buffer
    const scale = maxWidth / decoded.width
    const outW = maxWidth
    const outH = Math.max(1, Math.round(decoded.height * scale))
    const src = decoded.data
    const out = Buffer.alloc(outW * outH * 4)
    for (let y = 0; y < outH; y += 1) {
      const sy = Math.min(decoded.height - 1, Math.floor(y / scale))
      for (let x = 0; x < outW; x += 1) {
        const sx = Math.min(decoded.width - 1, Math.floor(x / scale))
        const si = (sy * decoded.width + sx) * 4
        const di = (y * outW + x) * 4
        out[di] = src[si]
        out[di + 1] = src[si + 1]
        out[di + 2] = src[si + 2]
        out[di + 3] = 255
      }
    }
    const encoded = jpeg.encode({ data: out, width: outW, height: outH }, quality)
    return Buffer.from(encoded.data)
  } catch {
    return buffer
  }
}

// Bangun konten sendMessage: teks + externalAdReply. Murni, gampang dites.
export function fakeThumbContent(
  text,
  { title = FAKE_THUMB_TITLE, body = '', sourceUrl = DEFAULT_SOURCE_URL, thumbnail = null, largeThumbnail = false } = {}
) {
  const externalAdReply = { title, body, mediaType: 1, url: sourceUrl, largeThumbnail }
  if (Buffer.isBuffer(thumbnail)) externalAdReply.thumbnail = thumbnail
  return { text, externalAdReply }
}

// Kirim teks dengan thumbnail palsu dalam SATU pesan. quoted diteruskan
// apa adanya (boleh undefined).
export function sendFakeThumbText(sock, jid, text, { quoted, ...thumbOpts } = {}) {
  const content = fakeThumbContent(text, thumbOpts)
  return quoted ? sock.sendMessage(jid, content, { quoted }) : sock.sendMessage(jid, content)
}

let bannerCache = null

// Muat banner menu (assets/menu-banner.jpg) sekali, perkecil, cache.
// File tidak ada atau rusak: null (menu tetap terkirim tanpa thumbnail).
export async function loadMenuThumbnail(bannerPath) {
  if (bannerCache) return bannerCache
  try {
    const raw = await readFile(bannerPath)
    bannerCache = shrinkJpeg(raw)
  } catch {
    bannerCache = null
  }
  return bannerCache
}
