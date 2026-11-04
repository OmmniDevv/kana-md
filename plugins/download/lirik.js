import { getSongData } from '../../src/scrapers/spotify/metadata.js'

export const config = {
  name: 'lirik',
  alias: ['lyrics', 'lyric'],
  category: 'download',
  description: { id: 'Lihat lirik lagu dari judul atau link Spotify', en: 'See song lyrics from a title or a Spotify link' },
  usage: '.lirik <judul lagu> atau .lirik <link track spotify>',
  example: '.lirik Tulus Sepatu',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    lirik: {
      needQuery: 'Ketik judul lagunya atau kirim link track Spotify yaa, contoh: .lirik Tulus Sepatu~',
      searching: 'Sebentar, KANA cariin liriknya dulu... {mood}',
      notFound: 'Mouu, lagunya nggak ketemu. Coba judul plus nama artisnya ya~',
      noLyrics: 'Lagunya ketemu ({title} - {artist}), tapi liriknya belum ada di sumber KANA. Coba lagu lain ya~',
      failed: 'Mouu, gagal ambil lirik: {message}. Coba lagi nanti ya~',
      header: '{title} - {artist}',
      source: 'Sumber lirik: {source}',
      truncated: '\n\n(Dipotong KANA biar nggak kepanjangan~)',
    },
  },
  en: {
    lirik: {
      needQuery: 'Type the song title or send a Spotify track link, example: .lirik Bohemian Rhapsody~',
      searching: 'One sec, KANA is looking for the lyrics... {mood}',
      notFound: 'Mouu, the song was not found. Try the title plus the artist name~',
      noLyrics: 'Found the song ({title} - {artist}), but no lyrics in KANA sources yet. Try another song~',
      failed: 'Mouu, failed to fetch lyrics: {message}. Try again later~',
      header: '{title} - {artist}',
      source: 'Lyrics source: {source}',
      truncated: '\n\n(Trimmed by KANA so it does not get too long~)',
    },
  },
}

const MAX_LYRICS_CHARS = 3500

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('lirik.needQuery'))
  await ctx.reply(ctx.t('lirik.searching', { mood: ctx.say('mikir') }))
  let data
  try {
    data = await getSongData(query)
  } catch (err) {
    return ctx.reply(ctx.t('lirik.failed', { message: err.message }))
  }
  if (!data) return ctx.reply(ctx.t('lirik.notFound'))
  if (!data.lyrics) {
    return ctx.reply(ctx.t('lirik.noLyrics', { title: data.title, artist: data.artist || '-' }))
  }
  const lyrics =
    data.lyrics.length > MAX_LYRICS_CHARS ? data.lyrics.slice(0, MAX_LYRICS_CHARS) + ctx.t('lirik.truncated') : data.lyrics
  await ctx.reply(
    `${ctx.t('lirik.header', { title: data.title, artist: data.artist || '-' })}\n\n${lyrics}\n\n${ctx.t('lirik.source', { source: data.lyricsSource || '-' })}`
  )
}
