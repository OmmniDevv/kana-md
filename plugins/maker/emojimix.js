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
      needEmoji: '╭─❏ 😀 「 *BUTUH DUA EMOJI* 」\n┊ Kasih dua emoji yaa, contoh: *.emojimix 😀 🔥*~\n╰━━━━━━━',
      notAvailable: '╭─❏ 🔍 「 *KOMBINASI TIDAK ADA* 」\n┊ Mouu, kombinasi itu nggak tersedia di Emoji Kitchen. Nggak semua pasangan emoji ada gambarnya, coba pasangan lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL BIKIN EMOJIMIX* 」\n┊ Mouu, gagal bikin emojimix: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ ✨ 「 *EMOJIMIX JADI* 」\n┊ Emojimixnya jadii, lucu banget~\n╰━━━━━━━',
      tryButton: 'Coba 😀 ❤️',
    },
  },
  en: {
    emojimix: {
      needEmoji: '╭─❏ 😀 「 *TWO EMOJIS NEEDED* 」\n┊ Give me two emojis, example: *.emojimix 😀 🔥*~\n╰━━━━━━━',
      notAvailable: '╭─❏ 🔍 「 *COMBO NOT AVAILABLE* 」\n┊ Mouu, that combo is not available in Emoji Kitchen. Not every emoji pair has an image, try another pair~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *EMOJIMIX FAILED* 」\n┊ Mouu, failed to make the emojimix: *{message}*~\n╰━━━━━━━',
      done: '╭─❏ ✨ 「 *EMOJIMIX READY* 」\n┊ Your emojimix is ready, so cute~\n╰━━━━━━━',
      tryButton: 'Try 😀 ❤️',
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

export const test = { input: '.emojimix 😀 🔥', expect: /Emojimixnya/i }

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
    return ctx.reply(ctx.t('emojimix.done'))
  } catch (err) {
    return ctx.reply(ctx.t('emojimix.failed', { message: err.message }))
  }
}
