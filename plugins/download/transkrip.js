import { youtubeTranscript } from '../../src/scrapers/youtube/transcript.js'
import { extractYoutubeUrl } from './ytmp3.js'

export const config = {
  name: 'transkrip',
  alias: ['transcript', 'teksvideo'],
  category: 'download',
  description: { id: 'Ambil transkrip teks dari video YouTube yang punya caption', en: 'Get the text transcript of a YouTube video that has captions' },
  usage: '.transkrip <link youtube>',
  example: '.transkrip https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    transkrip: {
      needUrl: 'Kirim link YouTube-nya dulu yaa, contoh: .transkrip https://www.youtube.com/watch?v=...~',
      working: 'Sebentar, KANA salin transkripnya dulu... {mood}',
      body: '📝 TRANSKRIP: {title}\nBahasa caption: {lang}\n\n{text}',
      failed: 'Mouu, gagal ambil transkripnya: {message}~',
    },
  },
  en: {
    transkrip: {
      needUrl: 'Send the YouTube link first, example: .transkrip https://www.youtube.com/watch?v=...~',
      working: 'One sec, KANA is copying the transcript... {mood}',
      body: '📝 TRANSCRIPT: {title}\nCaption language: {lang}\n\n{text}',
      failed: 'Mouu, failed to get the transcript: {message}~',
    },
  },
}

export const test = { input: '.transkrip https://www.youtube.com/watch?v=dQw4w9WgXcQ', expect: /transkrip|transcript/i }

const MAX_CHARS = 3500

export async function handler(ctx) {
  const url = extractYoutubeUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('transkrip.needUrl'))
  await ctx.reply(ctx.t('transkrip.working', { mood: ctx.say('mikir') }))
  try {
    const { title, lang, text } = await youtubeTranscript(url)
    const trimmed = text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}...` : text
    return ctx.reply(ctx.t('transkrip.body', { title, lang, text: trimmed }))
  } catch (err) {
    return ctx.reply(ctx.t('transkrip.failed', { message: err.message }))
  }
}
