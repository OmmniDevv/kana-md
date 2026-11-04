import { playSong } from '../../src/scrapers/youtube/youtube.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'play',
  alias: [],
  category: 'download',
  description: { id: 'Putar lagu dari YouTube, audio dikirim langsung', en: 'Play a song from YouTube, audio sent directly' },
  usage: '.play <judul lagu>',
  example: '.play Dewa 19 Kangen',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    play: {
      needQuery: 'Ketik judul lagunya dulu yaa, contoh: .play Dewa 19 Kangen~',
      searching: 'Sebentar, KANA cariin di YouTube dulu... {mood}',
      notFound: 'Mouu, lagunya nggak ketemu di YouTube. Coba kata kunci lain ya~',
      failed: 'Mouu, gagal ambil audionya: {message}. Coba lagi nanti ya~',
      tooBig: 'Aduh, audionya kegedean buat dikirim lewat WhatsApp (di atas 16 MB). Coba lagu yang lebih pendek ya~',
      caption: '{title} ({duration})',
    },
  },
  en: {
    play: {
      needQuery: 'Type the song title first, example: .play Bohemian Rhapsody~',
      searching: 'One sec, KANA is searching YouTube... {mood}',
      notFound: 'Mouu, the song was not found on YouTube. Try other keywords~',
      failed: 'Mouu, failed to fetch the audio: {message}. Try again later~',
      tooBig: 'Oops, the audio is too big to send over WhatsApp (over 16 MB). Try a shorter song~',
      caption: '{title} ({duration})',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('play.needQuery'))
  await ctx.reply(ctx.t('play.searching', { mood: ctx.say('mikir') }))
  let result
  try {
    result = await playSong(query, { maxBytes: MAX_AUDIO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('play.tooBig'))
    if (/tidak ditemukan|not found/i.test(err.message)) return ctx.reply(ctx.t('play.notFound'))
    return ctx.reply(ctx.t('play.failed', { message: err.message }))
  }
  await sendAudio(ctx, result.buffer, {
    title: result.info.title || result.selected.title,
    performer: result.info.artist || result.selected.artist || '',
    mimetype: result.mimeType,
  })
  await ctx.reply(
    ctx.t('play.caption', {
      title: result.info.title || result.selected.title || '-',
      duration: result.info.durationText || result.selected.durationText || '-',
    })
  )
}
