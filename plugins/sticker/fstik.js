
import { textImage } from '../../src/services/text-image.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendSticker } from '../maker/sticker.js'
export const config = {
  name: "fstik",
  alias: [],
  category: "sticker",
  description: { id: "Fitur fstik versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD fstik feature, rewritten in KANA style" },
  usage: ".fstik",
  example: ".fstik",
  cooldown: 5,
}

export const i18n = {
  id: {
    "fstik": {
      hint: "╭─❏ 🏷️ 「 *FSTIK* 」\n┊ Tulis teks stikernya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.fstik halo semua*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *STIKER GAGAL* 」\n┊ Mouu, stikernya gagal dibuat: *{message}*\n╰━━━━━━━",
      done: "Stikernya jadii~",
    },
  },
  en: {
    "fstik": {
      hint: "╭─❏ 🏷️ 「 *FSTIK* 」\n┊ Write the sticker text first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.fstik hello everyone*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *STICKER FAILED* 」\n┊ Mouu, the sticker failed: *{message}*\n╰━━━━━━━",
      done: "Your sticker is ready~",
    },
  },
}

const PALETTES = ['0x17102B', '0x0B1F1A', '0x1F1030', '0x101E33', '0x2B1020']
export const test = { input: '.fstik halo semua', expect: /stiker|sticker/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('fstik.hint'))
  try {
    let h = 0
    for (let i = 0; i < 'fstik'.length; i++) h = (h * 31 + 'fstik'.charCodeAt(i)) >>> 0
    const png = await textImage({
      lines: [{ text: text.slice(0, 90), size: 64, bold: true }, { text: ctx.pushName || 'KANA', size: 28, color: '#D8CCFF' }],
      width: 512, height: 512, background: PALETTES[h % PALETTES.length],
    })
    const webp = await toStickerWebp(png, { animated: false })
    await sendSticker(ctx, webp)
    return ctx.reply(ctx.t('fstik.done'))
  } catch (err) {
    return ctx.reply(ctx.t('fstik.fail', { message: err.message }))
  }
}
