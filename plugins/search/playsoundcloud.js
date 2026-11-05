import { soundcloudSearch, soundcloudAudio } from '../../src/scrapers/download/soundcloud.js'
import { sendAudio } from '../../src/ui/media.js'

// Putar lagu dari SoundCloud: cari trek lalu unduh dan kirim audionya.
export const config = {
  name: 'playsoundcloud',
  alias: ['play-sc', 'playsc'],
  category: 'search',
  description: { id: 'Putar lagu dari SoundCloud berdasarkan judul', en: 'Play a song from SoundCloud by title' },
  usage: '.playsoundcloud <judul lagu>',
  example: '.playsoundcloud lofi beats',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    playsoundcloud: {
      needQuery: '╭─❏ 🎧 「 *KETIK JUDUL LAGUNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.playsoundcloud lofi beats*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cari lagunya di SoundCloud... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *LAGU TIDAK KETEMU* 」\n┊ Mouu, lagu itu nggak ketemu di SoundCloud~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL PUTAR* 」\n┊ Mouu, gagal putar lagunya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🎧 「 *SOUNDCLOUD* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n╰━━━━━━━',
    },
  },
  en: {
    playsoundcloud: {
      needQuery: '╭─❏ 🎧 「 *TYPE THE SONG TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.playsoundcloud lofi beats*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is searching SoundCloud... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SONG NOT FOUND* 」\n┊ Mouu, that song was not found on SoundCloud~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO PLAY* 」\n┊ Mouu, failed to play the song: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🎧 「 *SOUNDCLOUD* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.playsoundcloud lofi', expect: /SOUNDCLOUD/ }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('playsoundcloud.needQuery'))
  await ctx.reply(ctx.t('playsoundcloud.working', { mood: ctx.say('mikir') }))
  try {
    const results = await soundcloudSearch(q, { limit: 5 })
    const track = results.find((r) => r.url) || results[0]
    if (!track) return ctx.reply(ctx.t('playsoundcloud.notFound'))
    const audio = await soundcloudAudio(track.url)
    const title = audio.title || track.title || q
    await sendAudio(ctx, audio.buffer, { title, mimetype: audio.mimeType })
    return ctx.reply(ctx.t('playsoundcloud.caption', {
      title,
      duration: track.durationText || '-',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('playsoundcloud.failed', { message: err.message }))
  }
}
