import { downloadAudio, playSong } from '../../src/scrapers/youtube/youtube.js'
import { isYouTubeUrl } from '../../src/scrapers/download/ytmp4.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'yta',
  alias: ['ytvdl'],
  category: 'download',
  description: { id: 'Unduh audio MP3 YouTube dari link atau judul lagu', en: 'Download YouTube MP3 audio from a link or a song title' },
  usage: '.yta <link youtube atau judul>',
  example: '.yta Tulus Sepatu',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    yta: {
      needQuery: '╭─❏ 🔗 「 *KIRIM LINK ATAU JUDUL* 」\n┊ ᴄᴏɴᴛᴏʜ: *.yta Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA unduhin audionya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNDUH AUDIO* 」\n┊ Mouu, gagal unduh audionya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *AUDIO KEGEDEAN* 」\n┊ Aduh, audionya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*).\n┊ Coba lagu yang lebih pendek ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *YOUTUBE AUDIO* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n╰━━━━━━━',
    },
  },
  en: {
    yta: {
      needQuery: '╭─❏ 🔗 「 *SEND A LINK OR TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.yta Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is downloading the audio... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO DOWNLOAD AUDIO* 」\n┊ Mouu, failed to download the audio: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *AUDIO TOO BIG* 」\n┊ Oops, the audio is too big to send over WhatsApp (over *64 MB*).\n┊ Try a shorter song~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *YOUTUBE AUDIO* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.yta https://www.youtube.com/watch?v=jNQXAC9IVRw', expect: /Me at the zoo/i }

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  if (!input) return ctx.reply(ctx.t('yta.needQuery'))
  await ctx.reply(ctx.t('yta.working', { mood: ctx.say('mikir') }))
  let result
  try {
    result = isYouTubeUrl(input)
      ? await downloadAudio(input, { maxBytes: MAX_AUDIO_BYTES })
      : await playSong(input, { maxBytes: MAX_AUDIO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('yta.tooBig'))
    return ctx.reply(ctx.t('yta.failed', { message: err.message }))
  }
  const title = result.info?.title || result.selected?.title || 'audio'
  await sendAudio(ctx, result.buffer, {
    title,
    performer: result.info?.artist || result.selected?.artist || '',
    mimetype: result.mimeType,
  })
  return ctx.reply(ctx.t('yta.caption', {
    title,
    duration: result.info?.durationText || result.selected?.durationText || '-',
  }))
}
