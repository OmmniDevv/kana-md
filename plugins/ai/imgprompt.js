
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "imgprompt",
  alias: [],
  category: "ai",
  description: { id: "Fitur imgprompt versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD imgprompt feature, rewritten in KANA style" },
  usage: ".imgprompt",
  example: ".imgprompt",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "imgprompt": {
      hint: "╭─❏ 🎨 「 *IMGPROMPT* 」\n┊ Tulis deskripsi gambarnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.imgprompt kucing oren di taman*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *LAGI DIGAMBAR* 」\n┊ Siap, KANA gambar dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAMBAR GAGAL DIBUAT* 」\n┊ Mouu, gambarnya gagal dibuat: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *GAMBAR JADI* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Buat Lagi",
    },
  },
  en: {
    "imgprompt": {
      hint: "╭─❏ 🎨 「 *IMGPROMPT* 」\n┊ Write the image description first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.imgprompt orange cat in a garden*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *DRAWING IT* 」\n┊ Got it, KANA is drawing it now... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to generate: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *IMAGE READY* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Make Again",
    },
  },
}

const STYLE = ""
export const test = { input: '.imgprompt kucing oren lucu', expect: /kucing|gambar|drawing/i }
export async function handler(ctx) {
  const prompt = (ctx.text || '').trim()
  if (!prompt) return ctx.reply(ctx.t('imgprompt.hint'))
  await ctx.reply(ctx.t('imgprompt.working', { mood: ctx.say('mikir') }))
  const full = STYLE ? prompt + ', ' + STYLE : prompt
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) + '?width=1024&height=1024&nologo=true'
  let media
  try {
    media = await withBreaker('pollinations-image', () => downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 60000 }))
  } catch (err) {
    return ctx.reply(ctx.t('imgprompt.fail', { message: err.message }))
  }
  const caption = ctx.t('imgprompt.caption', { prompt: prompt.slice(0, 120) })
  await sendImage(ctx, media.buffer, { caption })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body: caption, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('imgprompt.btnAgain'), id: '.imgprompt ' + prompt.slice(0, 60) }], textFallback: caption })
}
