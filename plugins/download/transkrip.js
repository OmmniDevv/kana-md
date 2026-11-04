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
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK YOUTUBE* 」\n┊ ᴄᴏɴᴛᴏʜ: *.transkrip https://www.youtube.com/watch?v=...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA salin transkripnya dulu... {mood}\n╰━━━━━━━',
      body: '╭─❏ 📝 「 *TRANSKRIP* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ʙᴀʜᴀꜱᴀ ᴄᴀᴘᴛɪᴏɴ: *{lang}*\n╰━━━━━━━\n\n{text}',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL TRANSKRIP* 」\n┊ Mouu, gagal ambil transkripnya: *{message}*~\n╰━━━━━━━',
    },
  },
  en: {
    transkrip: {
      needUrl: '╭─❏ 🔗 「 *SEND THE YOUTUBE LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.transkrip https://www.youtube.com/watch?v=...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is copying the transcript... {mood}\n╰━━━━━━━',
      body: '╭─❏ 📝 「 *TRANSCRIPT* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴄᴀᴘᴛɪᴏɴ ʟᴀɴɢᴜᴀɢᴇ: *{lang}*\n╰━━━━━━━\n\n{text}',
      failed: '╭─❏ 😿 「 *FAILED TO GET TRANSCRIPT* 」\n┊ Mouu, failed to get the transcript: *{message}*~\n╰━━━━━━━',
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
