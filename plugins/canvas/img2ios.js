
import { textImage } from '../../src/services/text-image.js'
export const config = {
  name: "img2ios",
  alias: [],
  category: "canvas",
  description: { id: "Fitur img2ios versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD img2ios feature, rewritten in KANA style" },
  usage: ".img2ios",
  example: ".img2ios",
  cooldown: 5,
}

export const i18n = {
  id: {
    "img2ios": {
      hint: "╭─❏ 🖼️ 「 *IMG2IOS* 」\n┊ Tulis teksnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.img2ios teks kamu*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *KARTU GAGAL DIBUAT* 」\n┊ Mouu, kartunya gagal dibuat: *{message}*\n╰━━━━━━━",
      caption: "╭─❏ 🖼️ 「 *IMG2IOS* 」\n┊ Kartunya jadii~\n╰━━━━━━━",
    },
  },
  en: {
    "img2ios": {
      hint: "╭─❏ 🖼️ 「 *IMG2IOS* 」\n┊ Write the text first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.img2ios your text*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *CARD FAILED* 」\n┊ Mouu, the card failed to render: *{message}*\n╰━━━━━━━",
      caption: "╭─❏ 🖼️ 「 *IMG2IOS* 」\n┊ Your card is ready~\n╰━━━━━━━",
    },
  },
}

const PALETTES = ['0x17102B', '0x0B1F1A', '0x1F1030', '0x101E33', '0x2B1020', '0x0E2A2B']
const ACCENTS = ['#D946EF', '#34D399', '#FBBF24', '#60A5FA', '#F472B6', '#A78BFA']
export function paletteFor(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return { bg: PALETTES[h % PALETTES.length], accent: ACCENTS[h % ACCENTS.length] }
}
export const test = { input: '.img2ios Halo KANA', expect: /halo/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('img2ios.hint'))
  const pal = paletteFor('img2ios')
  try {
    const image = await textImage({
      lines: [
        { text: 'IMG2IOS', size: 34, bold: true, color: pal.accent },
        { text: text.slice(0, 120), size: 52, bold: true },
        { text: 'Dibuat dengan KANA Canvas', size: 26, color: '#D8CCFF' },
      ],
      width: 900, height: 520, background: pal.bg,
    })
    return ctx.sock.sendMessage(ctx.chat, { image, caption: ctx.t('img2ios.caption') }, { quoted: ctx.raw })
  } catch (err) {
    return ctx.reply(ctx.t('img2ios.fail', { message: err.message }))
  }
}
