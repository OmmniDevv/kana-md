import { downloadAudio, playSong } from '../../src/scrapers/youtube/youtube.js'
import { isYouTubeUrl } from '../../src/scrapers/download/ytmp4.js'
import { downloadVideoByUrlOrQuery } from '../../src/scrapers/download/ytmp4.js'
import { sendAudio, sendVideo, MAX_AUDIO_BYTES, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

// Pengunduh YouTube serbaguna: bawaan video MP4, tambahkan kata "mp3"
// atau "audio" di akhir untuk mengambil audionya saja.
export const config = {
  name: 'ytdl',
  alias: ['youtubedl', 'youtubedownload', 'youtubeaudio', 'youtubevideo', 'ytmp4hd'],
  category: 'download',
  description: { id: 'Unduh video atau audio YouTube dari link atau judul (tambah kata mp3 untuk audio)', en: 'Download a YouTube video or audio from a link or title (add the word mp3 for audio)' },
  usage: '.ytdl <link youtube atau judul> [mp3]',
  example: '.ytdl https://youtu.be/xxxx',
  cooldown: 20,
  limit: 3,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    ytdl: {
      needQuery: '╭─❏ 🔗 「 *KIRIM LINK ATAU JUDUL* 」\n┊ ᴄᴏɴᴛᴏʜ: *.ytdl https://youtu.be/...*\n┊ ᴍᴀᴜ ᴀᴜᴅɪᴏ? ᴛᴀᴍʙᴀʜ ᴋᴀᴛᴀ *mp3* ᴅɪ ᴀᴋʜɪʀ.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA unduhin medianya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL UNDUH* 」\n┊ Mouu, gagal unduh medianya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *MEDIA KEGEDEAN* 」\n┊ Aduh, medianya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*).\n┊ Coba yang lebih pendek ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *YOUTUBE {mode}* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n╰━━━━━━━',
    },
  },
  en: {
    ytdl: {
      needQuery: '╭─❏ 🔗 「 *SEND A LINK OR TITLE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.ytdl https://youtu.be/...*\n┊ ᴡᴀɴᴛ ᴀᴜᴅɪᴏ? ᴀᴅᴅ ᴛʜᴇ ᴡᴏʀᴅ *mp3* ᴀᴛ ᴛʜᴇ ᴇɴᴅ.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is downloading the media... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *DOWNLOAD FAILED* 」\n┊ Mouu, failed to download the media: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *MEDIA TOO BIG* 」\n┊ Oops, the media is too big to send over WhatsApp (over *64 MB*).\n┊ Try something shorter~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *YOUTUBE {mode}* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ytdl https://www.youtube.com/watch?v=jNQXAC9IVRw', expect: /Me at the zoo/i }

// Pisahkan penanda mode audio dari kueri unduhan.
export function splitMode(text) {
  const m = String(text || '').match(/^(.*?)[\s,]+(mp3|audio)\s*$/i)
  if (m && m[1].trim()) return { query: m[1].trim(), audio: true }
  return { query: String(text || '').trim(), audio: false }
}

export async function handler(ctx) {
  const { query, audio } = splitMode(ctx.text || '')
  if (!query) return ctx.reply(ctx.t('ytdl.needQuery'))
  await ctx.reply(ctx.t('ytdl.working', { mood: ctx.say('mikir') }))
  try {
    if (audio) {
      const result = isYouTubeUrl(query)
        ? await downloadAudio(query, { maxBytes: MAX_AUDIO_BYTES })
        : await playSong(query, { maxBytes: MAX_AUDIO_BYTES })
      const title = result.info?.title || result.selected?.title || 'audio'
      await sendAudio(ctx, result.buffer, {
        title,
        performer: result.info?.artist || result.selected?.artist || '',
        mimetype: result.mimeType,
      })
      return ctx.reply(ctx.t('ytdl.caption', {
        mode: 'AUDIO',
        title,
        duration: result.info?.durationText || result.selected?.durationText || '-',
      }))
    }
    const result = await downloadVideoByUrlOrQuery(query, { maxBytes: MAX_VIDEO_BYTES })
    await sendVideo(ctx, result.buffer, {
      caption: ctx.t('ytdl.caption', {
        mode: 'MP4',
        title: result.info.title || '-',
        duration: result.info.durationText || '-',
      }),
    })
    return undefined
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('ytdl.tooBig'))
    return ctx.reply(ctx.t('ytdl.failed', { message: err.message }))
  }
}
