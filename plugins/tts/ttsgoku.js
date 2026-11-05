
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
export const config = {
  name: "ttsgoku",
  alias: [],
  category: "tts",
  description: { id: "Text to Speech dengan suara Goku", en: "KANA version of the Elaina-MD ttsgoku feature, rewritten in KANA style" },
  usage: ".ttsgoku",
  example: ".ttsgoku",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ttsgoku": {
      hint: "╭─❏ 🎙️ 「 *TTSGOKU* 」\n┊ Tulis teks yang mau diucapkan dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.ttsgoku halo semua*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SUARA GAGAL* 」\n┊ Mouu, suaranya gagal dibuat: *{message}*\n╰━━━━━━━",
      done: "Voice note-nya udah KANA kirim di atas yaa~",
    },
  },
  en: {
    "ttsgoku": {
      hint: "╭─❏ 🎙️ 「 *TTSGOKU* 」\n┊ Write the text to speak first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.ttsgoku hello everyone*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *VOICE FAILED* 」\n┊ Mouu, the voice failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the voice note above~",
    },
  },
}

export const test = { input: '.ttsgoku halo semuanya', expect: /voice|suara/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 400)
  if (!text) return ctx.reply(ctx.t('ttsgoku.hint'))
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=' + encodeURIComponent(text.slice(0, 200))
    const media = await withBreaker('google-tts', () => downloadBuffer(url, { maxBytes: 5 * 1024 * 1024, timeout: 20000 }))
    await ctx.sock.sendMessage(ctx.chat, { audio: media.buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('ttsgoku.done'))
  } catch (err) {
    return ctx.reply(ctx.t('ttsgoku.fail', { message: err.message }))
  }
}
