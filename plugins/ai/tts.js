// .tts: ubah teks jadi voice note lewat Google Translate TTS publik.
// Endpoint translate_tts publik tanpa key; nasibnya bisa berubah
// (kadang diblokir Google), jadi kegagalan dibalas jujur, bukan
// pura-pura berhasil. Teks dipotong per permintaan maksimal 200
// karakter di batas kata, total maksimal 600 karakter.
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tts',
  premium: true,
  alias: ['suara', 'voice', 'tts2', 'voiceondoku'],
  category: 'ai',
  description: { id: 'Ubah teks jadi pesan suara', en: 'Turn text into a voice note' },
  usage: '.tts <teks>',
  example: '.tts halo, selamat pagi semua',
  cooldown: 10,
  limit: 3,
}

export const i18n = {
  id: {
    tts: {
      needText: '╭─❏ 🎙️ 「 *TULIS TEKSNYA DULU* 」\n┊ Tulis teksnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.tts halo selamat pagi*\n╰━━━━━━━',
      tooLong: '╭─❏ ✂️ 「 *TEKS DIPOTONG* 」\n┊ Teksnya kepanjangan nih, KANA potong sampai *600 karakter* yaa~\n┊ Sisanya nggak dibacakan ✂️\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *SUARA GAGAL DIBUAT* 」\n┊ Mouu, suara KANA gagal dibuat: *{message}*\n┊ Layanan TTS gratisnya lagi bermasalah, coba lagi nanti ya~ (╥﹏╥)\n╰━━━━━━━',
      done: '╭─❏ 🎙️ 「 *VOICE NOTE TERKIRIM* 」\n┊ Voice note-nya udah KANA kirim di atas yaa~ ✨ {mood}\n╰━━━━━━━',
      btnAgain: 'Ucapkan Lagi',
    },
  },
  en: {
    tts: {
      needText: '╭─❏ 🎙️ 「 *WRITE THE TEXT FIRST* 」\n┊ Write the text first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.tts hello good morning*\n╰━━━━━━━',
      tooLong: '╭─❏ ✂️ 「 *TEXT TRIMMED* 」\n┊ That text is too long, KANA trimmed it to *600 characters*~\n┊ The rest was not read out ✂️\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *VOICE FAILED* 」\n┊ Mouu, KANA failed to make the voice: *{message}*\n┊ The free TTS service is having trouble, try again later~ (╥﹏╥)\n╰━━━━━━━',
      done: '╭─❏ 🎙️ 「 *VOICE NOTE SENT* 」\n┊ KANA sent the Voice note above~ ✨ {mood}\n╰━━━━━━━',
      btnAgain: 'Say Again',
    },
  },
}

export const TTS_CHUNK_CHARS = 200
export const TTS_MAX_CHARS = 600

// Potong teks jadi potongan maksimal maxChars, di batas kata bila bisa.
export function chunkTtsText(text, maxChars = TTS_CHUNK_CHARS) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  const chunks = []
  let rest = clean
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf(' ', maxChars)
    if (cut < Math.floor(maxChars / 2)) cut = maxChars
    chunks.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  if (rest) chunks.push(rest)
  return chunks.filter(Boolean)
}

export const test = { input: '.tts Halo semuanya, aku KANA', expect: /Voice note/i }

export async function handler(ctx) {
  const rawText = ctx.text.trim()
  if (!rawText) return ctx.reply(ctx.t('tts.needText'))
  const truncated = rawText.length > TTS_MAX_CHARS
  const text = truncated ? rawText.slice(0, TTS_MAX_CHARS) : rawText
  const lang = ctx.lang === 'en' ? 'en' : 'id'
  const chunks = chunkTtsText(text, TTS_CHUNK_CHARS)

  const buffers = []
  try {
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunk)}`
      const media = await withBreaker('google-tts', () =>
        downloadBuffer(url, { maxBytes: 5 * 1024 * 1024, timeout: 20000 })
      )
      buffers.push(media.buffer)
    }
  } catch (err) {
    return ctx.reply(ctx.t('tts.failed', { message: err.message }))
  }
  if (!buffers.length) return ctx.reply(ctx.t('tts.failed', { message: 'audio kosong' }))

  const audio = Buffer.concat(buffers)
  await ctx.sock.sendMessage(ctx.chat, { audio, ptt: true, mimetype: 'audio/mpeg' }, { quoted: ctx.raw })
  if (truncated) await ctx.reply(ctx.t('tts.tooLong'))
  const body = ctx.t('tts.done', { mood: ctx.say('senang') })
  const shortText = text.slice(0, 60)
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('tts.btnAgain'), id: `.tts ${shortText}` }],
    textFallback: body,
  })
}
