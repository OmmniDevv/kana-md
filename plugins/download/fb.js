import { facebookDownload } from '../../src/scrapers/facebook/facebook.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'fb',
  limitGroup: 'download',
  alias: ['fbdl', 'facebook'],
  category: 'download',
  description: { id: 'Unduh video atau reel Facebook dari link', en: 'Download a Facebook video or reel from a link' },
  usage: '.fb <link video facebook>',
  example: '.fb https://www.facebook.com/reel/123456789/',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    fb: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK FACEBOOK* 」\n┊ ᴄᴏɴᴛᴏʜ: *.fb https://www.facebook.com/reel/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin videonya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL VIDEO* 」\n┊ Mouu, gagal ambil videonya: *{message}*\n┊ Pastikan linknya publik ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO KEGEDEAN* 」\n┊ Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *VIDEO FACEBOOK* 」\n┊ ᴋᴜᴀʟɪᴛᴀꜱ: *{quality}*\n╰━━━━━━━',
      btnRetry: 'Unduh ulang',
      btnAio: 'Coba .aio',
      followUp: 'ʟᴀɴᴊᴜᴛᴀɴ: *.fb {url}*',
    },
  },
  en: {
    fb: {
      needUrl: '╭─❏ 🔗 「 *SEND THE FACEBOOK LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.fb https://www.facebook.com/reel/...*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the video... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH VIDEO* 」\n┊ Mouu, failed to fetch the video: *{message}*\n┊ Make sure the link is public~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *VIDEO TOO BIG* 」\n┊ Oops, the video is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 🎬 「 *FACEBOOK VIDEO* 」\n┊ ǫᴜᴀʟɪᴛʏ: *{quality}*\n╰━━━━━━━',
      btnRetry: 'Download again',
      btnAio: 'Try .aio',
      followUp: 'ɴᴇxᴛ: *.fb {url}*',
    },
  },
}

// Tombol susulan sesudah media terkirim: unduh ulang URL yang sama.
// URL tidak tersedia: coba .aio saja.
export function buildFbButtons(url, t) {
  return url ? [{ text: t('fb.btnRetry'), id: `.fb ${url}` }] : [{ text: t('fb.btnAio'), id: '.aio' }]
}

export const test = { input: '.fb https://www.facebook.com/fossbytes/videos/1135171799944065/', expect: /Video Facebook/i }

export async function handler(ctx) {
  const url = ctx.args[0]
  if (!url) return ctx.reply(ctx.t('fb.needUrl'))
  await ctx.reply(ctx.t('fb.working', { mood: ctx.say('mikir') }))
  const result = await facebookDownload(url)
  if (!result.status) return ctx.reply(ctx.t('fb.failed', { message: result.message }))
  const best = result.result.downloads[0]
  let media
  try {
    media = await downloadBuffer(best.url, { maxBytes: MAX_VIDEO_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('fb.tooBig'))
    return ctx.reply(ctx.t('fb.failed', { message: err.message }))
  }
  await sendVideo(ctx, media.buffer, { caption: ctx.t('fb.caption', { quality: best.quality }) })
  const body = [ctx.t('fb.caption', { quality: best.quality }), ctx.t('fb.followUp', { url })].join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buildFbButtons(url, ctx.t),
    textFallback: body,
  })
}
