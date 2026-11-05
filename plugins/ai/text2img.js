
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "text2img",
  alias: [],
  category: "ai",
  description: { id: "Fitur text2img versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD text2img feature, rewritten in KANA style" },
  usage: ".text2img",
  example: ".text2img",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "text2img": {
      hint: "╭─❏ 🎨 「 *TEXT2IMG* 」\n┊ Tulis deskripsi gambarnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.text2img kucing oren di taman*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *LAGI DIGAMBAR* 」\n┊ Siap, KANA gambar dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAMBAR GAGAL DIBUAT* 」\n┊ Mouu, gambarnya gagal dibuat: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *GAMBAR JADI* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Buat Lagi",
    },
  },
  en: {
    "text2img": {
      hint: "╭─❏ 🎨 「 *TEXT2IMG* 」\n┊ Write the image description first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.text2img orange cat in a garden*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *DRAWING IT* 」\n┊ Got it, KANA is drawing it now... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to generate: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *IMAGE READY* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Make Again",
    },
  },
}

const STYLE = ""
export const test = { input: '.text2img kucing oren lucu', expect: /kucing|gambar|drawing/i }
export async function handler(ctx) {
  const prompt = (ctx.text || '').trim()
  if (!prompt) return ctx.reply(ctx.t('text2img.hint'))
  await ctx.reply(ctx.t('text2img.working', { mood: ctx.say('mikir') }))
  const full = STYLE ? prompt + ', ' + STYLE : prompt
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) + '?width=1024&height=1024&nologo=true'
  let media
  try {
    media = await withBreaker('pollinations-image', () => downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 60000 }))
  } catch (err) {
    return ctx.reply(ctx.t('text2img.fail', { message: err.message }))
  }
  const caption = ctx.t('text2img.caption', { prompt: prompt.slice(0, 120) })
  await sendImage(ctx, media.buffer, { caption })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body: caption, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('text2img.btnAgain'), id: '.text2img ' + prompt.slice(0, 60) }], textFallback: caption })
}
