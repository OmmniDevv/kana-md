import { soundcloudAudio, extractSoundcloudUrl } from '../../src/scrapers/download/soundcloud.js'
import { sendAudio } from '../../src/ui/media.js'

export const config = {
  name: 'soundcloud',
  alias: ['sc', 'scdl'],
  category: 'download',
  description: { id: 'Unduh audio trek SoundCloud dari link trek', en: 'Download a SoundCloud track audio from a track link' },
  usage: '.soundcloud <link soundcloud>',
  example: '.soundcloud https://soundcloud.com/forss/flickermood',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    soundcloud: {
      needUrl: 'Kirim link trek SoundCloud-nya dulu yaa, contoh: .soundcloud https://soundcloud.com/artist/track~',
      working: 'Sebentar, KANA ambilin audionya dulu... {mood}',
      failed: 'Mouu, gagal ambil audionya: {message}. Coba lagi nanti ya~',
      caption: '🎵 {title} — {author}',
    },
  },
  en: {
    soundcloud: {
      needUrl: 'Send the SoundCloud track link first, example: .soundcloud https://soundcloud.com/artist/track~',
      working: 'One sec, KANA is fetching the audio... {mood}',
      failed: 'Mouu, failed to fetch the audio: {message}. Try again later~',
      caption: '🎵 {title} — {author}',
    },
  },
}

export const test = { input: '.soundcloud https://soundcloud.com/forss/flickermood', expect: /soundcloud/i }

export async function handler(ctx) {
  const url = extractSoundcloudUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('soundcloud.needUrl'))
  await ctx.reply(ctx.t('soundcloud.working', { mood: ctx.say('mikir') }))
  try {
    const { title, author, buffer } = await soundcloudAudio(url)
    await ctx.reply(ctx.t('soundcloud.caption', { title, author }))
    return sendAudio(ctx, buffer, { title, performer: author })
  } catch (err) {
    return ctx.reply(ctx.t('soundcloud.failed', { message: err.message }))
  }
}
