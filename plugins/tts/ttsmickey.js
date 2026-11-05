
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
export const config = {
  name: "ttsmickey",
  alias: [],
  category: "tts",
  description: { id: "Text to Speech dengan suara Mickey Mouse", en: "KANA version of the Elaina-MD ttsmickey feature, rewritten in KANA style" },
  usage: ".ttsmickey",
  example: ".ttsmickey",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ttsmickey": {
      hint: "╭─❏ 🎙️ 「 *TTSMICKEY* 」\n┊ Tulis teks yang mau diucapkan dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.ttsmickey halo semua*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SUARA GAGAL* 」\n┊ Mouu, suaranya gagal dibuat: *{message}*\n╰━━━━━━━",
      done: "Voice note-nya udah KANA kirim di atas yaa~",
    },
  },
  en: {
    "ttsmickey": {
      hint: "╭─❏ 🎙️ 「 *TTSMICKEY* 」\n┊ Write the text to speak first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.ttsmickey hello everyone*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *VOICE FAILED* 」\n┊ Mouu, the voice failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the voice note above~",
    },
  },
}

export const test = { input: '.ttsmickey halo semuanya', expect: /voice|suara/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 400)
  if (!text) return ctx.reply(ctx.t('ttsmickey.hint'))
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=' + encodeURIComponent(text.slice(0, 200))
    const media = await withBreaker('google-tts', () => downloadBuffer(url, { maxBytes: 5 * 1024 * 1024, timeout: 20000 }))
    await ctx.sock.sendMessage(ctx.chat, { audio: media.buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('ttsmickey.done'))
  } catch (err) {
    return ctx.reply(ctx.t('ttsmickey.fail', { message: err.message }))
  }
}
