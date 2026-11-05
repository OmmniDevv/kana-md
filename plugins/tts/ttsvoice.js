
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
export const config = {
  name: "ttsvoice",
  alias: [],
  category: "tts",
  description: { id: "Fitur ttsvoice versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD ttsvoice feature, rewritten in KANA style" },
  usage: ".ttsvoice",
  example: ".ttsvoice",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ttsvoice": {
      hint: "╭─❏ 🎙️ 「 *TTSVOICE* 」\n┊ Tulis teks yang mau diucapkan dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.ttsvoice halo semua*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SUARA GAGAL* 」\n┊ Mouu, suaranya gagal dibuat: *{message}*\n╰━━━━━━━",
      done: "Voice note-nya udah KANA kirim di atas yaa~",
    },
  },
  en: {
    "ttsvoice": {
      hint: "╭─❏ 🎙️ 「 *TTSVOICE* 」\n┊ Write the text to speak first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.ttsvoice hello everyone*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *VOICE FAILED* 」\n┊ Mouu, the voice failed: *{message}*\n╰━━━━━━━",
      done: "KANA sent the voice note above~",
    },
  },
}

export const test = { input: '.ttsvoice halo semuanya', expect: /voice|suara/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim().slice(0, 400)
  if (!text) return ctx.reply(ctx.t('ttsvoice.hint'))
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=' + encodeURIComponent(text.slice(0, 200))
    const media = await withBreaker('google-tts', () => downloadBuffer(url, { maxBytes: 5 * 1024 * 1024, timeout: 20000 }))
    await ctx.sock.sendMessage(ctx.chat, { audio: media.buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: ctx.raw })
    return ctx.reply(ctx.t('ttsvoice.done'))
  } catch (err) {
    return ctx.reply(ctx.t('ttsvoice.fail', { message: err.message }))
  }
}
