// Pencarian lagu Apple Music/iTunes lewat iTunes Search API publik
// (pengecualian metadata musik yang sama dengan .lirik di DECISIONS.md).
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { buildFakeTroliQuoted, coverJpeg300, sendQuotedText } from '../../src/ui/fake-thumb.js'

export const config = {
  name: 'applemusic',
  alias: ['amusic', 'itunes'],
  category: 'search',
  description: { id: 'Cari lagu di Apple Music / iTunes lengkap dengan pratinjau', en: 'Search songs on Apple Music / iTunes with previews' },
  usage: '.applemusic <judul lagu>',
  example: '.applemusic Hati-Hati di Jalan',
  cooldown: 10,
}

export const i18n = {
  id: {
    applemusic: {
      hint: 'Tulis judul lagunya yaa~ Contoh: .applemusic Hati-Hati di Jalan',
      body: '🍎 {track}\nArtis: {artist}\nAlbum: {album}\nDengarkan: {url}',
      heading: 'Pratinjau: {track} - {artist}',
      notFound: 'Lagunya tidak ketemu di Apple Music. {mood}',
      fail: 'Gagal cari di Apple Music: {error}',
    },
  },
  en: {
    applemusic: {
      hint: 'Write the song title please~ Example: .applemusic Perfect Ed Sheeran',
      body: '🍎 {track}\nArtist: {artist}\nAlbum: {album}\nListen: {url}',
      heading: 'Preview: {track} - {artist}',
      notFound: 'The song was not found on Apple Music. {mood}',
      fail: 'Failed to search Apple Music: {error}',
    },
  },
}

export const test = { input: '.applemusic', expect: /judul|title/i }

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('applemusic.hint'))
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`, { signal: AbortSignal.timeout(20000) })
    const data = await res.json()
    const song = data.results?.[0]
    if (!song) return ctx.reply(ctx.t('applemusic.notFound', { mood: ctx.say('gagal') }))
    const body = ctx.t('applemusic.body', {
      track: song.trackName, artist: song.artistName, album: song.collectionName, url: song.trackViewUrl,
    })
    let thumb = null
    if (song.artworkUrl100) {
      try {
        const art = await downloadBuffer(song.artworkUrl100.replace('100x100', '600x600'), { maxBytes: 4 * 1024 * 1024 })
        thumb = art.buffer
      } catch { /* sampul opsional */ }
    }
    if (thumb) {
      const quoted = buildFakeTroliQuoted({
        thumbnail: coverJpeg300(thumb),
        itemCount: 1,
        message: `${song.trackName} - ${song.artistName}`,
      })
      await sendQuotedText(ctx.sock, ctx.chat, body, { quoted })
    } else await ctx.reply(body)
    if (song.previewUrl) {
      const preview = await downloadBuffer(song.previewUrl, { maxBytes: 16 * 1024 * 1024 })
      const { sendAudio } = await import('../../src/ui/media.js')
      return sendAudio(ctx, preview.buffer, { title: ctx.t('applemusic.heading', { track: song.trackName, artist: song.artistName }) })
    }
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('applemusic.fail', { error: err.message }))
  }
}
