
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "sologo",
  alias: [],
  category: "ai",
  description: { id: "Buat gambar logo dari teks (mesin gambar Pollinations, hasil berupa gambar logo, bukan berkas vektor)", en: "Create a logo image from text (Pollinations image engine, output is a logo image, not a vector file)" },
  usage: ".sologo",
  example: ".sologo",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "sologo": {
      hint: "╭─❏ 🎨 「 *SOLOGO* 」\n┊ Tulis nama usaha dan konsep logonya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.sologo kedai kopi gunung*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *LAGI DIGAMBAR* 」\n┊ Siap, KANA gambar dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAMBAR GAGAL DIBUAT* 」\n┊ Mouu, gambarnya gagal dibuat: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *LOGO JADI* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Buat Lagi",
    },
  },
  en: {
    "sologo": {
      hint: "╭─❏ 🎨 「 *SOLOGO* 」\n┊ Write the brand name and logo concept first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.sologo mountain coffee shop*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *DRAWING IT* 」\n┊ Got it, KANA is drawing it now... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to generate: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *LOGO READY* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Make Again",
    },
  },
}

const STYLE = "minimalist logo design, flat vector style emblem, clean centered composition, plain solid background, crisp edges, professional branding"
export const test = { input: '.sologo kedai kopi gunung', expect: /logo|gambar|drawing/i }
export async function handler(ctx) {
  const prompt = (ctx.text || '').trim()
  if (!prompt) return ctx.reply(ctx.t('sologo.hint'))
  await ctx.reply(ctx.t('sologo.working', { mood: ctx.say('mikir') }))
  const full = STYLE ? prompt + ', ' + STYLE : prompt
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) + '?width=1024&height=1024&nologo=true'
  let media
  try {
    media = await withBreaker('pollinations-image', () => downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 60000 }))
  } catch (err) {
    return ctx.reply(ctx.t('sologo.fail', { message: err.message }))
  }
  const caption = ctx.t('sologo.caption', { prompt: prompt.slice(0, 120) })
  await sendImage(ctx, media.buffer, { caption })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body: caption, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('sologo.btnAgain'), id: '.sologo ' + prompt.slice(0, 60) }], textFallback: caption })
}
