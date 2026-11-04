// Pembangun pesan kutipan palsu untuk menu KANA, diport dari mekanisme
// SC Elaina-MD v6.3.0 milik owner:
// - Menu utama memakai fake contactMessage sebagai quoted.
// - Menu teks memakai fake orderMessage bergaya troli sebagai quoted.
// Tidak ada kartu iklan eksternal di helper ini karena WA versi terbaru
// tidak lagi mendukung mekanisme tersebut dengan konsisten.
import { readFile } from 'node:fs/promises'
import jpeg from 'jpeg-js'

export const FAKE_TROLI_TOKEN = 'ARpfsm5NXcUGrAkaExuw'
export const MENU_THUMBNAIL_SIZE = 300

// Ubah JPEG menjadi sampul persegi 300x300 dengan crop tengah. Kegagalan
// decode tidak fatal: buffer asal dikembalikan apa adanya.
export function coverJpeg300(buffer, quality = 80) {
  if (!Buffer.isBuffer(buffer)) return buffer
  try {
    const decoded = jpeg.decode(buffer, { useTArray: true, maxMemoryUsageInMB: 256 })
    if (!decoded?.width || !decoded?.height) return buffer

    const side = Math.min(decoded.width, decoded.height)
    const startX = Math.floor((decoded.width - side) / 2)
    const startY = Math.floor((decoded.height - side) / 2)
    const out = Buffer.alloc(MENU_THUMBNAIL_SIZE * MENU_THUMBNAIL_SIZE * 4)

    for (let y = 0; y < MENU_THUMBNAIL_SIZE; y += 1) {
      const sy = Math.min(side - 1, Math.floor(((y + 0.5) * side) / MENU_THUMBNAIL_SIZE))
      for (let x = 0; x < MENU_THUMBNAIL_SIZE; x += 1) {
        const sx = Math.min(side - 1, Math.floor(((x + 0.5) * side) / MENU_THUMBNAIL_SIZE))
        const si = ((startY + sy) * decoded.width + startX + sx) * 4
        const di = (y * MENU_THUMBNAIL_SIZE + x) * 4
        out[di] = decoded.data[si]
        out[di + 1] = decoded.data[si + 1]
        out[di + 2] = decoded.data[si + 2]
        out[di + 3] = 255
      }
    }

    const encoded = jpeg.encode(
      { data: out, width: MENU_THUMBNAIL_SIZE, height: MENU_THUMBNAIL_SIZE },
      quality
    )
    return Buffer.from(encoded.data)
  } catch {
    return buffer
  }
}

let bannerCache = null
let thumbnailCache = null

// Muat banner mentah untuk header MB.Button dan fallback image+caption.
export async function loadMenuBanner(bannerPath) {
  if (bannerCache) return bannerCache
  try {
    bannerCache = await readFile(bannerPath)
  } catch {
    bannerCache = null
  }
  return bannerCache
}

// Muat banner lalu ubah menjadi thumbnail troli 300x300.
export async function loadMenuThumbnail(bannerPath) {
  if (thumbnailCache) return thumbnailCache
  const banner = await loadMenuBanner(bannerPath)
  thumbnailCache = banner ? coverJpeg300(banner) : null
  return thumbnailCache
}

// Fake quoted contactMessage ala menu Cantarella di SC owner.
export function buildFakeContactQuoted({ botName = 'KANA' } = {}) {
  const name = String(botName || 'KANA')
  return {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
    },
    message: {
      contactMessage: {
        displayName: name,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=0:+0\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  }
}

// Fake quoted orderMessage ala troli di menucat dan allmenu SC owner.
export function buildFakeTroliQuoted({
  botName = 'KANA',
  botNumber = '',
  itemCount = 0,
  thumbnail = null,
  token = FAKE_TROLI_TOKEN,
  message: messageOverride,
  orderTitle: orderTitleOverride,
} = {}) {
  const total = Math.max(0, Number(itemCount) || 0)
  const sellerDigits = String(botNumber ?? '').replace(/\D/g, '')
  return {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
    },
    message: {
      orderMessage: {
        orderId: '1337',
        thumbnail: Buffer.isBuffer(thumbnail) ? thumbnail : null,
        itemCount: total,
        status: 'INQUIRY',
        surface: 'CATALOG',
        message: messageOverride ?? `${botName} - ${total} Commands`,
        orderTitle: orderTitleOverride ?? `📋 ${total} Commands`,
        sellerJid: `${sellerDigits}@s.whatsapp.net`,
        token,
        totalAmount1000: 0,
        totalCurrencyCode: 'IDR',
        contextInfo: {
          isForwarded: true,
          forwardingScore: 9999,
        },
      },
    },
  }
}

// Kirim satu pesan teks dengan quoted dan contextInfo yang diberikan.
export function sendQuotedText(sock, jid, text, { quoted, contextInfo } = {}) {
  const content = { text }
  if (contextInfo) content.contextInfo = contextInfo
  return quoted ? sock.sendMessage(jid, content, { quoted }) : sock.sendMessage(jid, content)
}
