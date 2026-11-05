// Ambil gambar PNG satu emoji dari CDN resmi:
// 1. Noto Color Emoji lewat fonts.gstatic.com (CDN font Google).
// 2. Twemoji lewat cdn.jsdelivr.net (mirror GitHub twitter/twemoji).
// Perilaku fitur meniru emojistick RYO-YAMADA-MD (audit RYO 2026-11-05),
// ditulis ulang gaya KANA. URL pola RYO (raw.githubusercontent
// googlefonts/noto-emoji) terbukti 404 dari VM untuk emoji uji, jadi
// KANA memakai dua sumber di atas yang terverifikasi HTTP 200 dengan
// berkas PNG asli (magic 89 50 4E 47) pada 2026-11-05.
import { downloadBuffer, retry, withBreaker } from '../scrapers/runner.js'

export function emojiCodepoints(emoji) {
  return [...String(emoji || '')]
    .map((c) => c.codePointAt(0).toString(16).toLowerCase())
    .filter((cp) => cp !== 'fe0f')
}

export function notoEmojiUrl(emoji) {
  const parts = emojiCodepoints(emoji)
  if (!parts.length) return null
  return `https://fonts.gstatic.com/s/e/notoemoji/15.1/${parts.join('_')}/512.png`
}

export function twemojiUrl(emoji) {
  const parts = emojiCodepoints(emoji)
  if (!parts.length) return null
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${parts.join('-')}.png`
}

export function isPngBuffer(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
}

export function firstEmoji(text) {
  const match = String(text || '').match(
    /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F?|[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/u
  )
  return match ? match[0] : null
}

export async function fetchEmojiPng(emoji) {
  const urls = [notoEmojiUrl(emoji), twemojiUrl(emoji)].filter(Boolean)
  if (!urls.length) throw new Error('Emoji tidak valid')
  return withBreaker('emoji-image', () =>
    retry(async () => {
      let lastError = null
      for (const url of urls) {
        try {
          const media = await downloadBuffer(url, { maxBytes: 2 * 1024 * 1024, timeout: 20000 })
          if (isPngBuffer(media.buffer)) return media.buffer
          lastError = new Error('Balasan sumber emoji bukan PNG')
        } catch (err) {
          lastError = err
        }
      }
      throw lastError || new Error('Gambar emoji tidak ditemukan')
    })
  )
}
