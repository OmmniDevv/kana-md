import { getSongData } from '../../src/scrapers/spotify/metadata.js'

// Cari info lagu (judul, artis, album, tahun) plus lirik bila tersedia.
// Sumber: metadata iTunes/Spotify sehat yang juga dipakai fitur Spotify.
export const config = {
  name: 'searchthatsong',
  alias: ['thatsong', 'carilagu'],
  category: 'search',
  description: { id: 'Cari info lagu dan liriknya dari judul atau nama artis', en: 'Find song info and lyrics from a title or artist name' },
  usage: '.searchthatsong <judul lagu>',
  example: '.searchthatsong Tulus Sepatu',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    searchthatsong: {
      needQuery: '╭─❏ 🎵 「 *KETIK JUDUL LAGUNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.searchthatsong Tulus Sepatu*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *LAGU TIDAK KETEMU* 」\n┊ Mouu, lagu itu nggak ketemu. Coba judul plus nama artisnya ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian lagunya gagal: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🎵 「 *{title}* 」\n┊ ᴀʀᴛɪꜱ: *{artist}*\n┊ ᴀʟʙᴜᴍ: *{album}*\n┊ ʀɪʟɪꜱ: *{year}*\n┊ ─────',
      lyrics: '┊ *ʟɪʀɪᴋ:*\n┊ {lyrics}',
      noLyrics: '┊ ʟɪʀɪᴋ ʙᴇʟᴜᴍ ᴛᴇʀꜱᴇᴅɪᴀ ʙᴜᴀᴛ ʟᴀɢᴜ ɪɴɪ~',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    searchthatsong: {
      needQuery: '╭─❏ 🎵 「 *TYPE THE SONG TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.searchthatsong Tulus Sepatu*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SONG NOT FOUND* 」\n┊ Mouu, that song was not found. Try the title plus the artist~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *SEARCH FAILED* 」\n┊ Mouu, song search failed: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🎵 「 *{title}* 」\n┊ ᴀʀᴛɪꜱᴛ: *{artist}*\n┊ ᴀʟʙᴜᴍ: *{album}*\n┊ ʀᴇʟᴇᴀꜱᴇ: *{year}*\n┊ ─────',
      lyrics: '┊ *ʟʏʀɪᴄꜱ:*\n┊ {lyrics}',
      noLyrics: '┊ ʟʏʀɪᴄꜱ ᴀʀᴇ ɴᴏᴛ ᴀᴠᴀɪʟᴀʙʟᴇ ꜰᴏʀ ᴛʜɪꜱ ꜱᴏɴɢ ʏᴇᴛ~',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.searchthatsong Tulus Sepatu', expect: /Tulus|Sepatu/ }

export async function handler(ctx, { fetchSong = getSongData } = {}) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('searchthatsong.needQuery'))
  let data
  try {
    data = await fetchSong(q, { withLyrics: true })
  } catch (err) {
    return ctx.reply(ctx.t('searchthatsong.failed', { message: err.message }))
  }
  if (!data?.title) return ctx.reply(ctx.t('searchthatsong.notFound'))
  const lines = [ctx.t('searchthatsong.header', {
    title: data.title,
    artist: data.artist || '-',
    album: data.album || '-',
    year: data.releaseDate ? String(data.releaseDate).slice(0, 4) : '-',
  })]
  if (data.lyrics) {
    const lyrics = String(data.lyrics).split('\n').slice(0, 24).join('\n┊ ')
    lines.push(ctx.t('searchthatsong.lyrics', { lyrics }))
  } else {
    lines.push(ctx.t('searchthatsong.noLyrics'))
  }
  lines.push(ctx.t('searchthatsong.footer'))
  return ctx.reply(lines.join('\n'))
}
