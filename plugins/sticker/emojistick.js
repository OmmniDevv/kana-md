import { fetchEmojiPng, firstEmoji } from '../../src/services/emoji-image.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendSticker } from '../maker/sticker.js'

export const config = {
  name: 'emojistick',
  alias: ['emojisticker'],
  category: 'sticker',
  description: { id: 'Ubah emoji menjadi stiker gambar emoji aslinya (Noto/Twemoji)', en: 'Turn an emoji into a sticker of its real glyph (Noto/Twemoji)' },
  usage: '.emojistick <emoji>',
  example: '.emojistick 😀',
  cooldown: 5,
}

export const i18n = {
  id: {
    emojistick: {
      needEmoji: '╭─❏ 😀 「 *KIRIM EMOJINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.emojistick 😀*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL BUAT STIKER* 」\n┊ Mouu, gagal ambil gambar emojinya: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    emojistick: {
      needEmoji: '╭─❏ 😀 「 *SEND THE EMOJI* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.emojistick 😀*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *STICKER FAILED* 」\n┊ Mouu, failed to fetch the emoji image: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.emojistick 😀', expect: /stiker|sticker/i }

export async function handler(ctx) {
  const emoji = firstEmoji(ctx.text || '')
  if (!emoji) return ctx.reply(ctx.t('emojistick.needEmoji'))
  let webp
  try {
    const png = await fetchEmojiPng(emoji)
    webp = await toStickerWebp(png)
  } catch (err) {
    return ctx.reply(ctx.t('emojistick.failed', { message: err.message }))
  }
  return sendSticker(ctx, webp)
}
