import { downloadBuffer } from '../../src/scrapers/runner.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { sendSticker } from './sticker.js'

export const config = {
  name: 'emojimix',
  alias: [],
  category: 'maker',
  description: { id: 'Gabung dua emoji jadi stiker ala Emoji Kitchen', en: 'Mix two emojis into a sticker, Emoji Kitchen style' },
  usage: '.emojimix <emoji1> <emoji2>',
  example: '.emojimix 😀 🔥',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    emojimix: {
      needEmoji: 'Kasih dua emoji yaa, contoh: .emojimix 😀 🔥~',
      notAvailable: 'Mouu, kombinasi itu nggak tersedia di Emoji Kitchen. Nggak semua pasangan emoji ada gambarnya, coba pasangan lain ya~',
      failed: 'Mouu, gagal bikin emojimix: {message}~',
      done: 'Emojimixnya jadii~',
      tryButton: 'Coba 😀 ❤️',
      menuButton: 'Menu Maker',
    },
  },
  en: {
    emojimix: {
      needEmoji: 'Give me two emojis, example: .emojimix 😀 🔥~',
      notAvailable: 'Mouu, that combo is not available in Emoji Kitchen. Not every emoji pair has an image, try another pair~',
      failed: 'Mouu, failed to make the emojimix: {message}~',
      done: 'Your emojimix is ready~',
      tryButton: 'Try 😀 ❤️',
      menuButton: 'Maker Menu',
    },
  },
}

// Ambil unit emoji utuh (termasuk pasangan surrogate dan rangkaian ZWJ).
export function splitEmojis(input) {
  const text = String(input ?? '').replace(/\s+/g, '')
  if (!text) return []
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return [...seg.segment(text)].map((s) => s.segment).filter((s) => s.trim())
  }
  return [...text]
}

// Kode Emoji Kitchen: heksadesimal huruf kecil per codepoint, FE0F (variation
// selector) dibuang, codepoint majemuk digabung tanda hubung.
// Keterbatasan: hanya kombinasi yang benar-benar dibuat Google yang ada di
// server; urutan pasangan juga berpengaruh, jadi handler mencoba dua urutan.
export function emojiCode(emoji) {
  return [...String(emoji)]
    .map((ch) => ch.codePointAt(0).toString(16))
    .filter((hex) => hex !== 'fe0f')
    .join('-')
}

export function emojiKitchenUrl(a, b) {
  const ca = emojiCode(a)
  const cb = emojiCode(b)
  return `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${ca}/u${ca}_u${cb}.png`
}

export const test = { input: '.emojimix', expect: /emoji/i }

export async function handler(ctx) {
  const emojis = splitEmojis(ctx.text)
  if (emojis.length < 2) return ctx.reply(ctx.t('emojimix.needEmoji'))
  const [a, b] = emojis
  let buffer = null
  for (const url of [emojiKitchenUrl(a, b), emojiKitchenUrl(b, a)]) {
    try {
      const res = await downloadBuffer(url, { maxBytes: 4 * 1024 * 1024, timeout: 20000 })
      buffer = res.buffer
      break
    } catch {
      buffer = null
    }
  }
  if (!buffer) {
    await ctx.reply(ctx.t('emojimix.notAvailable'))
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('emojimix.notAvailable'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('emojimix.tryButton'), id: '.emojimix 😀 ❤️' }],
      textFallback: ctx.t('emojimix.notAvailable'),
    })
  }
  try {
    const webp = await toStickerWebp(buffer, { animated: false })
    await sendSticker(ctx, webp)
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('emojimix.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('emojimix.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('emojimix.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('emojimix.failed', { message: err.message }))
  }
}
