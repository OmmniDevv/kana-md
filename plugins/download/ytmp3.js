import { downloadAudio } from '../../src/scrapers/youtube/youtube.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'ytmp3',
  alias: ['yta', 'youtubemp3', 'ytaudio'],
  category: 'download',
  description: { id: 'Unduh audio MP3 dari link YouTube langsung', en: 'Download MP3 audio from a direct YouTube link' },
  usage: '.ytmp3 <link youtube>',
  example: '.ytmp3 https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ytmp3: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK YOUTUBE* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ytmp3 https://www.youtube.com/watch?v=...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin audionya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL AUDIO* 」\n┊ Mouu, gagal ambil audionya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
    },
  },
  en: {
    ytmp3: {
      needUrl: '╭─❏ 🔗 「 *SEND THE YOUTUBE LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ytmp3 https://www.youtube.com/watch?v=...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the audio... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH AUDIO* 」\n┊ Mouu, failed to fetch the audio: *{message}*\n┊ Try again later~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ytmp3 https://www.youtube.com/watch?v=dQw4w9WgXcQ', expect: /ytmp3|youtube/i }

export function extractYoutubeUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s]*(youtube\.com|youtu\.be)\/[^\s]+/i)
  return m ? m[0].replace(/[),.]+$/, '') : null
}

export async function handler(ctx) {
  const url = extractYoutubeUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('ytmp3.needUrl'))
  await ctx.reply(ctx.t('ytmp3.working', { mood: ctx.say('mikir') }))
  try {
    const audio = await downloadAudio(url, { maxBytes: MAX_AUDIO_BYTES })
    const buffer = Buffer.isBuffer(audio) ? audio : audio.buffer
    const title = Buffer.isBuffer(audio) ? 'YouTube Audio' : audio.title ?? 'YouTube Audio'
    return sendAudio(ctx, buffer, { title })
  } catch (err) {
    return ctx.reply(ctx.t('ytmp3.failed', { message: err.message }))
  }
}
