import { playSong, downloadAudio } from '../../src/scrapers/youtube/youtube.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'play',
  alias: ['putar', 'playaudio'],
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
      needQuery: '╭─❏ 🎵 「 *KETIK JUDUL LAGUNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.play Dewa 19 Kangen*\n╰━━━━━━━',
      searching: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cariin lagunya di YouTube dulu... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *LAGU TIDAK KETEMU* 」\n┊ Mouu, lagunya nggak ketemu di YouTube. Coba kata kunci lain ya~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL AUDIO* 」\n┊ Mouu, gagal ambil audionya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *AUDIO KEGEDEAN* 」\n┊ Aduh, audionya kegedean buat dikirim lewat WhatsApp (di atas *16 MB*).\n┊ Coba lagu yang lebih pendek ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *LAGU DIPUTAR* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n╰━━━━━━━',
      btnYts: 'Cari di YouTube',
      btnVideo: 'Unduh videonya',
      followUp: 'ʟᴀɴᴊᴜᴛᴀɴ: *.yts {title}* • *.ytmp4 {url}*',
    },
  },
  en: {
    play: {
      needQuery: '╭─❏ 🎵 「 *TYPE THE SONG TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.play Bohemian Rhapsody*\n╰━━━━━━━',
      searching: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is searching YouTube for the song... {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SONG NOT FOUND* 」\n┊ Mouu, the song was not found on YouTube. Try other keywords~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH AUDIO* 」\n┊ Mouu, failed to fetch the audio: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *AUDIO TOO BIG* 」\n┊ Oops, the audio is too big to send over WhatsApp (over *16 MB*).\n┊ Try a shorter song~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *NOW PLAYING* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n╰━━━━━━━',
      btnYts: 'Search on YouTube',
      btnVideo: 'Download the video',
      followUp: 'ɴᴇxᴛ: *.yts {title}* • *.ytmp4 {url}*',
    },
  },
}

// Ambil URL YouTube langsung dari teks (watch atau youtu.be), null bila tidak ada.
export function extractYouTubeUrl(text) {
  const match = String(text || '').match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch[^\s]*|youtu\.be\/[^\s]+)/i)
  return match ? match[0] : null
}

// Tombol susulan sesudah audio terkirim: cari ulang judulnya di YouTube
// atau unduh videonya.
export function buildPlayButtons({ title, url }, t) {
  const replies = []
  if (title) replies.push({ text: t('play.btnYts'), id: `.yts ${title}` })
  if (url) replies.push({ text: t('play.btnVideo'), id: `.ytmp4 ${url}` })
  return replies
}

export const test = { input: '.play https://www.youtube.com/watch?v=jNQXAC9IVRw', expect: /Me at the zoo/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('play.needQuery'))
  await ctx.reply(ctx.t('play.searching', { mood: ctx.say('mikir') }))
  const directUrl = extractYouTubeUrl(query)
  let result
  try {
    if (directUrl) {
      // URL langsung: unduh audio dari URL itu tanpa pencarian dulu.
      const audio = await downloadAudio(directUrl, { maxBytes: MAX_AUDIO_BYTES })
      result = {
        ...audio,
        selected: { title: audio.info?.title || null, artist: audio.info?.artist || null, url: directUrl },
      }
    } else {
      result = await playSong(query, { maxBytes: MAX_AUDIO_BYTES })
    }
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('play.tooBig'))
    if (/tidak ditemukan|not found/i.test(err.message)) return ctx.reply(ctx.t('play.notFound'))
    return ctx.reply(ctx.t('play.failed', { message: err.message }))
  }
  const title = result.info?.title || result.selected?.title || 'audio'
  const artist = result.info?.artist || result.selected?.artist || ''
  const url = result.info?.url || result.selected?.url || directUrl || ''
  await sendAudio(ctx, result.buffer, { title, performer: artist, mimetype: result.mimeType })
  const body = [
    ctx.t('play.caption', { title, duration: result.info?.durationText || result.selected?.durationText || '-' }),
    ctx.t('play.followUp', { title, url: url || '-' }),
  ].join('\n')
  const replies = buildPlayButtons({ title, url }, ctx.t)
  if (!replies.length) return ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
