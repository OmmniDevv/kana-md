import { downloadVideoByUrlOrQuery } from '../../src/scrapers/download/ytmp4.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'ytmp4',
  alias: ['ytvideo', 'ytv', 'youtubemp4', 'ytvhd'],
  category: 'download',
  description: { id: 'Unduh video YouTube sebagai mp4 dari link atau judul', en: 'Download a YouTube video as mp4 from a link or title' },
  usage: '.ytmp4 <link youtube atau judul>',
  example: '.ytmp4 https://youtu.be/xxxx',
  cooldown: 20,
  limit: 3,
}

export const i18n = {
  id: {
    ytmp4: {
      needQuery: '╭─❏ 🔗 「 *KIRIM LINK ATAU JUDUL* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ytmp4 https://youtu.be/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA unduhin videonya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNDUH VIDEO* 」\n┊ Mouu, gagal unduh videonya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO KEGEDEAN* 」\n┊ Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*).\n┊ Coba video yang lebih pendek ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *YOUTUBE MP4* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n╰━━━━━━━',
    },
  },
  en: {
    ytmp4: {
      needQuery: '╭─❏ 🔗 「 *SEND A LINK OR TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ytmp4 https://youtu.be/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is downloading the video... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO DOWNLOAD VIDEO* 」\n┊ Mouu, failed to download the video: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO TOO BIG* 」\n┊ Oops, the video is too big to send over WhatsApp (over *64 MB*).\n┊ Try a shorter video~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *YOUTUBE MP4* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ytmp4 https://www.youtube.com/watch?v=jNQXAC9IVRw', expect: /Me at the zoo/i }

export async function handler(ctx) {
  const input = ctx.text.trim()
  if (!input) return ctx.reply(ctx.t('ytmp4.needQuery'))
  await ctx.reply(ctx.t('ytmp4.working', { mood: ctx.say('mikir') }))
  let result
  try {
    result = await downloadVideoByUrlOrQuery(input, { maxBytes: MAX_VIDEO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('ytmp4.tooBig'))
    return ctx.reply(ctx.t('ytmp4.failed', { message: err.message }))
  }
  await sendVideo(ctx, result.buffer, {
    caption: ctx.t('ytmp4.caption', {
      title: result.info.title || '-',
      duration: result.info.durationText || '-',
    }),
  })
}
