import { soundcloudAudio, extractSoundcloudUrl } from '../../src/scrapers/download/soundcloud.js'
import { sendAudio } from '../../src/ui/media.js'

export const config = {
  name: 'soundcloud',
  limitGroup: 'download',
  alias: ['sc', 'scdl'],
  category: 'download',
  description: { id: 'Unduh audio trek SoundCloud dari link trek', en: 'Download a SoundCloud track audio from a track link' },
  usage: '.soundcloud <link soundcloud>',
  example: '.soundcloud https://soundcloud.com/forss/flickermood',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    soundcloud: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK SOUNDCLOUD* 」\n┊ ᴄᴏɴᴛᴏʜ: *.soundcloud https://soundcloud.com/artist/track*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin audionya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL AUDIO* 」\n┊ Mouu, gagal ambil audionya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *SOUNDCLOUD* 」\n┊ ᴊᴜᴅᴜʟ: *{title}*\n┊ ᴀʀᴛɪꜱ: *{author}*\n╰━━━━━━━',
    },
  },
  en: {
    soundcloud: {
      needUrl: '╭─❏ 🔗 「 *SEND THE SOUNDCLOUD LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.soundcloud https://soundcloud.com/artist/track*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the audio... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH AUDIO* 」\n┊ Mouu, failed to fetch the audio: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '╭─❏ 🎵 「 *SOUNDCLOUD* 」\n┊ ᴛɪᴛʟᴇ: *{title}*\n┊ ᴀʀᴛɪꜱᴛ: *{author}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.soundcloud https://soundcloud.com/forss/flickermood', expect: /soundcloud/i }

export async function handler(ctx) {
  const url = extractSoundcloudUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('soundcloud.needUrl'))
  await ctx.reply(ctx.t('soundcloud.working', { mood: ctx.say('mikir') }))
  try {
    const { title, author, buffer } = await soundcloudAudio(url)
    await ctx.reply(ctx.t('soundcloud.caption', { title, author }))
    return sendAudio(ctx, buffer, { title, performer: author })
  } catch (err) {
    return ctx.reply(ctx.t('soundcloud.failed', { message: err.message }))
  }
}
