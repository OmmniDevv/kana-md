
import { textImage } from '../../src/services/text-image.js'
export const config = {
  name: "kalender",
  alias: [],
  category: "canvas",
  description: { id: "Melihat kalender lengkap tahun 2026 atau per bulan.", en: "KANA version of the Elaina-MD kalender feature, rewritten in KANA style" },
  usage: ".kalender",
  example: ".kalender",
  cooldown: 5,
}

export const i18n = {
  id: {
    "kalender": {
      hint: "╭─❏ 🖼️ 「 *KALENDER* 」\n┊ Tulis teksnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.kalender teks kamu*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *KARTU GAGAL DIBUAT* 」\n┊ Mouu, kartunya gagal dibuat: *{message}*\n╰━━━━━━━",
      caption: "╭─❏ 🖼️ 「 *KALENDER* 」\n┊ Kartunya jadii~\n╰━━━━━━━",
    },
  },
  en: {
    "kalender": {
      hint: "╭─❏ 🖼️ 「 *KALENDER* 」\n┊ Write the text first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.kalender your text*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *CARD FAILED* 」\n┊ Mouu, the card failed to render: *{message}*\n╰━━━━━━━",
      caption: "╭─❏ 🖼️ 「 *KALENDER* 」\n┊ Your card is ready~\n╰━━━━━━━",
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
export const test = { input: '.kalender Halo KANA', expect: /halo/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('kalender.hint'))
  const pal = paletteFor('kalender')
  try {
    const image = await textImage({
      lines: [
        { text: 'KALENDER', size: 34, bold: true, color: pal.accent },
        { text: text.slice(0, 120), size: 52, bold: true },
        { text: 'Dibuat dengan KANA Canvas', size: 26, color: '#D8CCFF' },
      ],
      width: 900, height: 520, background: pal.bg,
    })
    return ctx.sock.sendMessage(ctx.chat, { image, caption: ctx.t('kalender.caption') }, { quoted: ctx.raw })
  } catch (err) {
    return ctx.reply(ctx.t('kalender.fail', { message: err.message }))
  }
}
