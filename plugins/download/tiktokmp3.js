import { tiktokDownload } from '../../src/scrapers/tiktok/tiktok.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendAudio, MAX_AUDIO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'tiktokmp3',
  limitGroup: 'download',
  alias: ['ttmp3'],
  category: 'download',
  description: { id: 'Unduh audio musik dari link video TikTok', en: 'Download the music audio from a TikTok video link' },
  usage: '.tiktokmp3 <link tiktok>',
  example: '.tiktokmp3 https://www.tiktok.com/@user/video/123456789',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    tiktokmp3: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK TIKTOK* 」\n┊ ᴄᴏɴᴛᴏʜ: *.tiktokmp3 https://www.tiktok.com/@user/video/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin musiknya dulu... {mood}\n╰━━━━━━━',
      noAudio: '╭─❏ 🙈 「 *TIDAK ADA AUDIO* 」\n┊ Video ini tidak menyediakan audio musik yang bisa diunduh. {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL AUDIO* 」\n┊ Mouu, gagal ambil audionya: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
    },
  },
  en: {
    tiktokmp3: {
      needUrl: '╭─❏ 🔗 「 *SEND THE TIKTOK LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.tiktokmp3 https://www.tiktok.com/@user/video/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the music... {mood}\n╰━━━━━━━',
      noAudio: '╭─❏ 🙈 「 *NO AUDIO AVAILABLE* 」\n┊ This video does not provide downloadable music audio. {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH AUDIO* 」\n┊ Mouu, failed to fetch the audio: *{message}*\n┊ Try again later~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tiktokmp3 https://www.tiktok.com/@tiktok', expect: /.+/ }

export async function handler(ctx) {
  const m = String(ctx.text || '').match(/https?:\/\/[^\s]*tiktok\.com\/[^\s]+/i)
  const url = m ? m[0].replace(/[),.]+$/, '') : null
  if (!url) return ctx.reply(ctx.t('tiktokmp3.needUrl'))
  await ctx.reply(ctx.t('tiktokmp3.working', { mood: ctx.say('mikir') }))
  try {
    const result = await tiktokDownload(url)
    if (!result?.audio) return ctx.reply(ctx.t('tiktokmp3.noAudio', { mood: ctx.say('gagal') }))
    const media = await downloadBuffer(result.audio, { maxBytes: MAX_AUDIO_BYTES })
    return sendAudio(ctx, media.buffer, { title: result.title ?? 'TikTok Audio' })
  } catch (err) {
    return ctx.reply(ctx.t('tiktokmp3.failed', { message: err.message }))
  }
}
