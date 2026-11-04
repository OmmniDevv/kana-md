import { scrape } from '../../src/scrapers/spotify/spotify.js'
import { getSongData } from '../../src/scrapers/spotify/metadata.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'spotify',
  alias: ['spot'],
  category: 'download',
  description: { id: 'Cari lagu Spotify dan kirim audionya', en: 'Search Spotify and send the audio' },
  usage: '.spotify <judul lagu>',
  example: '.spotify Hati-Hati di Jalan',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    spotify: {
      needQuery: 'Ketik judul lagunya dulu yaa, contoh: .spotify Hati-Hati di Jalan~',
      searching: 'Sebentar, KANA cariin lagunya dulu... {mood}',
      notFound: 'Mouu, lagunya nggak ketemu. Coba judul atau nama artis lain ya~',
      failed: 'Mouu, gagal ambil audionya: {message}. Sumber gratisnya kadang ngambek, coba lagi nanti ya~',
      tooBig: 'Aduh, audionya kegedean buat dikirim lewat WhatsApp (di atas 16 MB). Coba lagu lain ya~',
      caption: '{title} - {artist}',
    },
  },
  en: {
    spotify: {
      needQuery: 'Type the song title first, example: .spotify Bohemian Rhapsody~',
      searching: 'One sec, KANA is looking for the song... {mood}',
      notFound: 'Mouu, the song was not found. Try another title or artist name~',
      failed: 'Mouu, failed to fetch the audio: {message}. The free source acts up sometimes, try again later~',
      tooBig: 'Oops, the audio is too big to send over WhatsApp (over 16 MB). Try another song~',
      caption: '{title} - {artist}',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('spotify.needQuery'))
  await ctx.reply(ctx.t('spotify.searching', { mood: ctx.say('mikir') }))
  const result = await scrape(query)
  if (!result.status || !result.download) {
    return ctx.reply(result.message ? ctx.t('spotify.failed', { message: result.message }) : ctx.t('spotify.notFound'))
  }
  // Metadata fallback dari embed/iTunes (kredit Yui Agents) bila hasil
  // utama tidak membawa judul atau artis.
  let title = result.download_info?.title || result.selected?.title || 'Spotify Track'
  let artist = result.download_info?.artist || result.selected?.artist || ''
  if (!result.download_info?.title || !result.download_info?.artist) {
    const meta = await getSongData(result.selected?.url || query, { withLyrics: false }).catch(() => null)
    if (meta) {
      title = meta.title || title
      artist = meta.artist || artist
    }
  }
  let media
  try {
    media = await downloadBuffer(result.download, { maxBytes: MAX_AUDIO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('spotify.tooBig'))
    return ctx.reply(ctx.t('spotify.failed', { message: err.message }))
  }
  await sendAudio(ctx, media.buffer, { title, performer: artist, mimetype: 'audio/mpeg' })
  await ctx.reply(ctx.t('spotify.caption', { title, artist: artist || '-' }))
}
