import { scrape as spotifyScrape, spotifyDownload } from '../../src/scrapers/spotify/spotify.js'
import { isSpotifyUrl } from '../download/spotify.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

// Putar lagu Spotify: cari trek atau terima link Spotify, unduh lewat
// jalur unduh Spotify sehat yang sama dengan .spotify, lalu kirim audio.
export const config = {
  name: 'spotplay',
  alias: [],
  category: 'search',
  description: { id: 'Putar lagu dari Spotify berdasarkan judul atau link', en: 'Play a song from Spotify by title or link' },
  usage: '.spotplay <judul lagu atau link spotify>',
  example: '.spotplay Tulus Sepatu',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    spotplay: {
      needQuery: '╭─❏ 🟢 「 *KETIK JUDUL ATAU LINK* 」\n┊ ᴄᴏɴᴛᴏʜ: *.spotplay Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambil lagunya dari Spotify... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *LAGU TIDAK KETEMU* 」\n┊ Mouu, lagu itu nggak ketemu di Spotify~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL PUTAR* 」\n┊ Mouu, gagal putar lagunya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🟢 「 *SPOTIFY* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴀʀᴛɪꜱ: *{artist}*\n╰━━━━━━━',
    },
  },
  en: {
    spotplay: {
      needQuery: '╭─❏ 🟢 「 *TYPE A TITLE OR LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.spotplay Tulus Sepatu*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the song from Spotify... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SONG NOT FOUND* 」\n┊ Mouu, that song was not found on Spotify~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO PLAY* 」\n┊ Mouu, failed to play the song: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🟢 「 *SPOTIFY* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴀʀᴛɪꜱᴛ: *{artist}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.spotplay Tulus Sepatu', expect: /SPOTIFY|Sepatu/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('spotplay.needQuery'))
  await ctx.reply(ctx.t('spotplay.working', { mood: ctx.say('mikir') }))
  try {
    let downloadUrl = null
    let title = ''
    let artist = ''
    if (isSpotifyUrl(q)) {
      const dl = await spotifyDownload(q)
      downloadUrl = dl?.download
      title = dl?.title || ''
      artist = dl?.artist || ''
    } else {
      const result = await spotifyScrape(q)
      if (result?.status && result.download) {
        downloadUrl = result.download
        title = result.download_info?.title || result.selected?.title || ''
        artist = result.download_info?.artist || result.selected?.artist || ''
      }
    }
    if (!downloadUrl) return ctx.reply(ctx.t('spotplay.notFound'))
    const { buffer } = await downloadBuffer(downloadUrl, { maxBytes: MAX_AUDIO_BYTES, timeout: 60000 })
    await sendAudio(ctx, buffer, { title: title || q, performer: artist, mimetype: 'audio/mpeg' })
    return ctx.reply(ctx.t('spotplay.caption', { title: title || q, artist: artist || '-' }))
  } catch (err) {
    return ctx.reply(ctx.t('spotplay.failed', { message: err.message }))
  }
}
