import { downloadVideoByUrlOrQuery } from '../../src/scrapers/download/ytmp4.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'ytmp4',
  alias: ['ytvideo', 'ytv'],
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
      needQuery: 'Kirim link YouTube-nya atau judul videonya dulu yaa, contoh: .ytmp4 https://youtu.be/...~',
      working: 'Sebentar, KANA unduhin videonya dulu... {mood}',
      failed: 'Mouu, gagal unduh videonya: {message}. Coba lagi nanti ya~',
      tooBig: 'Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas 64 MB). Coba video yang lebih pendek ya~',
      caption: '{title} ({duration})',
    },
  },
  en: {
    ytmp4: {
      needQuery: 'Send the YouTube link or the video title first, example: .ytmp4 https://youtu.be/...~',
      working: 'One sec, KANA is downloading the video... {mood}',
      failed: 'Mouu, failed to download the video: {message}. Try again later~',
      tooBig: 'Oops, the video is too big to send over WhatsApp (over 64 MB). Try a shorter video~',
      caption: '{title} ({duration})',
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
