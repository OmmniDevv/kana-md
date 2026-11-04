import { getSongData } from '../../src/scrapers/spotify/metadata.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'lirik',
  alias: ['lyrics', 'lyric', 'lyricyt'],
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
      needQuery: '╭─❏ 🎵 「 *KETIK JUDUL LAGUNYA* 」\n┊ Atau kirim link track Spotify yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.lirik Tulus Sepatu*\n╰━━━━━━━',
      searching: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cariin liriknya dulu... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *LAGU TIDAK KETEMU* 」\n┊ Mouu, lagunya nggak ketemu. Coba judul plus nama artisnya ya~\n╰━━━━━━━',
      noLyrics: '╭─❏ 🙈 「 *LIRIK BELUM ADA* 」\n┊ Lagunya ketemu: *{title} - {artist}*\n┊ Tapi liriknya belum ada di sumber KANA. Coba lagu lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL LIRIK* 」\n┊ Mouu, gagal ambil lirik: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      header: '╭─❏ 🎵 「 *LIRIK LAGU* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴀʀᴛɪꜱ: *{artist}*\n╰━━━━━━━',
      source: 'ꜱᴜᴍʙᴇʀ ʟɪʀɪᴋ: *{source}*',
      truncated: '\n\n(Dipotong KANA biar nggak kepanjangan~)',
      btnSpotify: 'Putar via Spotify',
      btnPlay: 'Putar di YouTube',
      followUp: 'ᴍᴀᴜ ᴅᴇɴɢᴇʀɪɴ ʟᴀɢᴜɴʏᴀ? *.spotify {title}* • *.play {title}*',
    },
  },
  en: {
    lirik: {
      needQuery: '╭─❏ 🎵 「 *TYPE THE SONG TITLE* 」\n┊ Or send a Spotify track link~\n┊ ᴇxᴀᴍᴘʟᴇ: *.lirik Bohemian Rhapsody*\n╰━━━━━━━',
      searching: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is looking for the lyrics... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SONG NOT FOUND* 」\n┊ Mouu, the song was not found. Try the title plus the artist name~\n╰━━━━━━━',
      noLyrics: '╭─❏ 🙈 「 *NO LYRICS YET* 」\n┊ Found the song: *{title} - {artist}*\n┊ But no lyrics in KANA sources yet. Try another song~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH LYRICS* 」\n┊ Mouu, failed to fetch lyrics: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🎵 「 *SONG LYRICS* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴀʀᴛɪꜱᴛ: *{artist}*\n╰━━━━━━━',
      source: 'ʟʏʀɪᴄꜱ ꜱᴏᴜʀᴄᴇ: *{source}*',
      truncated: '\n\n(Trimmed by KANA so it does not get too long~)',
      btnSpotify: 'Play via Spotify',
      btnPlay: 'Play on YouTube',
      followUp: 'ᴡᴀɴᴛ ᴛᴏ ʜᴇᴀʀ ᴛʜᴇ ꜱᴏɴɢ? *.spotify {title}* • *.play {title}*',
    },
  },
}

const MAX_LYRICS_CHARS = 3500

export const test = { input: '.lirik Tulus Sepatu', expect: /Sepatu/i }

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
  // Lirik tetap teks biasa (bisa panjang); tombolnya jadi pesan susulan pendek.
  const body = ctx.t('lirik.followUp', { title: data.title })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('lirik.btnSpotify'), id: `.spotify ${data.title}` },
      { text: ctx.t('lirik.btnPlay'), id: `.play ${data.title}` },
    ],
    textFallback: body,
  })
}
