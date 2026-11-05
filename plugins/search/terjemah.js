import { translateText } from '../../src/scrapers/search/terjemah.js'

export const config = {
  name: 'terjemah',
  alias: ['tr', 'translate', 'tran'],
  category: 'search',
  description: { id: 'Terjemahkan teks ke bahasa lain', en: 'Translate text to another language' },
  usage: '.tr <kode bahasa> <teks>',
  example: '.tr en selamat pagi dunia',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    terjemah: {
      usage: '╭─❏ 🌐 「 *CARA PAKAI TERJEMAH* 」\n┊ Formatnya: *.tr <kode bahasa> <teks>*\n┊ ᴋᴏᴅᴇ ᴜᴍᴜᴍ: *id* (Indonesia), *en* (Inggris), *ja* (Jepang), *ko* (Korea), *ar* (Arab), *zh* (Mandarin), *es* (Spanyol), *fr* (Prancis), *de* (Jerman), *ru* (Rusia)\n┊ Contoh: *.tr en selamat pagi*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *TERJEMAHAN GAGAL* 」\n┊ Mouu, terjemahannya gagal: *{message}*\n┊ Layanan Google kadang memblokir sebentar, coba lagi nanti yaa~\n╰━━━━━━━',
      detected: '┊ ʙᴀʜᴀꜱᴀ ᴀꜱᴀʟ ᴛᴇʀᴅᴇᴛᴇᴋꜱɪ: *{lang}*',
      result: '╭─❏ 🌐 「 *TERJEMAHAN* 」\n┊ {text}',
    },
  },
  en: {
    terjemah: {
      usage: '╭─❏ 🌐 「 *HOW TO USE TRANSLATE* 」\n┊ Format: *.tr <language code> <text>*\n┊ ᴄᴏᴍᴍᴏɴ ᴄᴏᴅᴇꜱ: *id* (Indonesian), *en* (English), *ja* (Japanese), *ko* (Korean), *ar* (Arabic), *zh* (Chinese), *es* (Spanish), *fr* (French), *de* (German), *ru* (Russian)\n┊ Example: *.tr id good morning*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *TRANSLATION FAILED* 」\n┊ Mouu, translation failed: *{message}*\n┊ The Google service blocks briefly sometimes, try again later~\n╰━━━━━━━',
      detected: '┊ ᴅᴇᴛᴇᴄᴛᴇᴅ ꜱᴏᴜʀᴄᴇ ʟᴀɴɢᴜᴀɢᴇ: *{lang}*',
      result: '╭─❏ 🌐 「 *TRANSLATION* 」\n┊ {text}',
    },
  },
}

const COMMON_CODES = new Set(['id', 'en', 'ja', 'ko', 'ar', 'zh', 'es', 'fr', 'de', 'ru', 'pt', 'it', 'nl', 'th', 'vi', 'ms', 'hi', 'tr'])

export const test = { input: '.tr en selamat pagi dunia', expect: /good morning/i }

export async function handler(ctx) {
  const target = (ctx.args[0] || '').toLowerCase()
  const text = ctx.args.slice(1).join(' ').trim()
  if (!COMMON_CODES.has(target) || !text) return ctx.reply(ctx.t('terjemah.usage'))
  let result
  try {
    result = await translateText(text, target)
  } catch (err) {
    return ctx.reply(ctx.t('terjemah.failed', { message: err.message }))
  }
  const lines = [ctx.t('terjemah.result', { text: result.text })]
  if (result.detectedLang && result.detectedLang !== target) {
    lines.push(ctx.t('terjemah.detected', { lang: result.detectedLang }))
  }
  lines.push('╰━━━━━━━')
  await ctx.reply(lines.join('\n'))
}
