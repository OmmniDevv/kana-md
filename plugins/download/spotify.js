import { scrape, spotifyDownload } from '../../src/scrapers/spotify/spotify.js'
import { getSongData } from '../../src/scrapers/spotify/metadata.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

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
      resultsHeader: 'Hasil pencarian Spotify buat "{query}":',
      resultItem: '{n}. {title} - {artist}\n.spotify {url}',
      btnTrack: '{n}. {title}',
      btnAgain: 'Cari lagi',
      btnLyrics: 'Lihat lirik',
      btnMenu: 'Menu unduhan',
      followUp: 'Lanjutan: .spotify {input} • .lirik {title} • .menu download',
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
      resultsHeader: 'Spotify search results for "{query}":',
      resultItem: '{n}. {title} - {artist}\n.spotify {url}',
      btnTrack: '{n}. {title}',
      btnAgain: 'Search again',
      btnLyrics: 'See lyrics',
      btnMenu: 'Download menu',
      followUp: 'Next: .spotify {input} • .lirik {title} • .menu download',
    },
  },
}

// Teks tombol native flow tampil sempit di HP; jaga tetap pendek.
const MAX_BUTTON_TEXT = 25
const shortText = (text) => (text.length > MAX_BUTTON_TEXT ? text.slice(0, MAX_BUTTON_TEXT) : text)

// Input berupa URL Spotify langsung (track/album/playlist atau spotify.link)?
export function isSpotifyUrl(text) {
  return /(?:open\.)?spotify\.com\/|spotify\.link\//i.test(String(text || ''))
}

// Tombol per hasil pencarian: satu quick_reply per track (maks 5),
// id = perintah .spotify dengan URL track itu.
export function buildSpotifyResultButtons(results, t) {
  return (results || [])
    .filter((track) => track?.url)
    .slice(0, 5)
    .map((track, i) => ({
      text: shortText(t('spotify.btnTrack', { n: i + 1, title: track.title || '-' })),
      id: `.spotify ${track.url}`,
    }))
}

// Tombol susulan sesudah unduhan terkirim: hasil pencarian (maks 5) +
// cari ulang input terakhir + lirik + menu unduhan. Total maks 10.
export function buildSpotifyDoneButtons({ input, title, results }, t) {
  const replies = buildSpotifyResultButtons(results, t)
  const add = (text, id) => {
    if (id && replies.length < 10 && !replies.some((r) => r.id === id)) replies.push({ text, id })
  }
  if (input) add(t('spotify.btnAgain'), `.spotify ${input}`)
  if (title) add(t('spotify.btnLyrics'), `.lirik ${title}`)
  add(t('spotify.btnMenu'), '.menu download')
  return replies
}

export const test = { input: '.spotify https://open.spotify.com/track/73DWDOjVUyJ8sAiAcySvgS', expect: /Sepatu - Tulus/i }

export async function handler(ctx) {
  const input = ctx.text.trim()
  if (!input) return ctx.reply(ctx.t('spotify.needQuery'))
  await ctx.reply(ctx.t('spotify.searching', { mood: ctx.say('mikir') }))
  let title = 'Spotify Track'
  let artist = ''
  let downloadUrl = null
  let searchResults = []
  if (isSpotifyUrl(input)) {
    // URL langsung: unduh track itu lewat spotifyDownload tanpa pencarian.
    let downloaded
    try {
      downloaded = await spotifyDownload(input)
    } catch (err) {
      return ctx.reply(ctx.t('spotify.failed', { message: err.message }))
    }
    if (!downloaded?.download) return ctx.reply(ctx.t('spotify.notFound'))
    title = downloaded.title || title
    artist = downloaded.artist || ''
    downloadUrl = downloaded.download
  } else {
    const result = await scrape(input)
    if (!result.status || !result.download) {
      return ctx.reply(result.message ? ctx.t('spotify.failed', { message: result.message }) : ctx.t('spotify.notFound'))
    }
    // Metadata fallback dari embed/iTunes (kredit Yui Agents) bila hasil
    // utama tidak membawa judul atau artis.
    title = result.download_info?.title || result.selected?.title || 'Spotify Track'
    artist = result.download_info?.artist || result.selected?.artist || ''
    if (!result.download_info?.title || !result.download_info?.artist) {
      const meta = await getSongData(result.selected?.url || input, { withLyrics: false }).catch(() => null)
      if (meta) {
        title = meta.title || title
        artist = meta.artist || artist
      }
    }
    downloadUrl = result.download
    searchResults = (result.search?.results || []).filter((track) => track.type === 'track' && track.url)
  }
  let media
  try {
    media = await downloadBuffer(downloadUrl, { maxBytes: MAX_AUDIO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('spotify.tooBig'))
    return ctx.reply(ctx.t('spotify.failed', { message: err.message }))
  }
  await sendAudio(ctx, media.buffer, { title, performer: artist, mimetype: 'audio/mpeg' })
  const lines = [ctx.t('spotify.caption', { title, artist: artist || '-' })]
  if (searchResults.length) {
    lines.push(ctx.t('spotify.resultsHeader', { query: input }))
    searchResults.slice(0, 5).forEach((track, i) => {
      lines.push(ctx.t('spotify.resultItem', { n: i + 1, title: track.title || '-', artist: track.artist || '-', url: track.url }))
    })
  }
  lines.push(ctx.t('spotify.followUp', { input, title }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buildSpotifyDoneButtons({ input, title, results: searchResults }, ctx.t),
    textFallback: body,
  })
}
