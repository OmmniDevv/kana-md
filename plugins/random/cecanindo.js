
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "cecanindo",
  alias: [],
  category: "random",
  description: { id: "Random gambar cewek cantik Indonesia", en: "KANA version of the Elaina-MD cecanindo feature, rewritten in KANA style" },
  usage: ".cecanindo",
  example: ".cecanindo",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "cecanindo": {
      hint: "╭─❏ 🎨 「 *CECANINDO* 」\n┊ Tulis deskripsi gambarnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.cecanindo kucing oren di taman*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *LAGI DIGAMBAR* 」\n┊ Siap, KANA gambar dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAMBAR GAGAL DIBUAT* 」\n┊ Mouu, gambarnya gagal dibuat: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *GAMBAR JADI* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Buat Lagi",
    },
  },
  en: {
    "cecanindo": {
      hint: "╭─❏ 🎨 「 *CECANINDO* 」\n┊ Write the image description first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.cecanindo orange cat in a garden*\n╰━━━━━━━",
      working: "╭─❏ 🎨 「 *DRAWING IT* 」\n┊ Got it, KANA is drawing it now... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to generate: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      caption: "╭─❏ 🎨 「 *IMAGE READY* 」\n┊ ᴘʀᴏᴍᴘᴛ: *{prompt}*\n╰━━━━━━━",
      btnAgain: "Make Again",
    },
  },
}

const STYLE = "portrait photography, natural light, high quality"
export const test = { input: '.cecanindo kucing oren lucu', expect: /kucing|gambar|drawing/i }
export async function handler(ctx) {
  const prompt = (ctx.text || '').trim()
  if (!prompt) return ctx.reply(ctx.t('cecanindo.hint'))
  await ctx.reply(ctx.t('cecanindo.working', { mood: ctx.say('mikir') }))
  const full = STYLE ? prompt + ', ' + STYLE : prompt
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) + '?width=1024&height=1024&nologo=true'
  let media
  try {
    media = await withBreaker('pollinations-image', () => downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 60000 }))
  } catch (err) {
    return ctx.reply(ctx.t('cecanindo.fail', { message: err.message }))
  }
  const caption = ctx.t('cecanindo.caption', { prompt: prompt.slice(0, 120) })
  await sendImage(ctx, media.buffer, { caption })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body: caption, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('cecanindo.btnAgain'), id: '.cecanindo ' + prompt.slice(0, 60) }], textFallback: caption })
}
