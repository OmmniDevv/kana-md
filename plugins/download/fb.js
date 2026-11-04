import { facebookDownload } from '../../src/scrapers/facebook/facebook.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'fb',
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
      needUrl: 'Kirim link video Facebook-nya dulu yaa, contoh: .fb https://www.facebook.com/reel/...~',
      working: 'Sebentar, KANA ambilin videonya dulu... {mood}',
      failed: 'Mouu, gagal ambil videonya: {message}. Pastikan linknya publik ya~',
      tooBig: 'Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas 64 MB)~',
      caption: 'Video Facebook, kualitas {quality}~',
      btnRetry: 'Unduh ulang',
      btnMenu: 'Menu unduhan',
      btnAio: 'Coba .aio',
      followUp: 'Lanjutan: .fb {url} • .menu download',
    },
  },
  en: {
    fb: {
      needUrl: 'Send the Facebook video link first, example: .fb https://www.facebook.com/reel/...~',
      working: 'One sec, KANA is fetching the video... {mood}',
      failed: 'Mouu, failed to fetch the video: {message}. Make sure the link is public~',
      tooBig: 'Oops, the video is too big to send over WhatsApp (over 64 MB)~',
      caption: 'Facebook video, quality {quality}~',
      btnRetry: 'Download again',
      btnMenu: 'Download menu',
      btnAio: 'Try .aio',
      followUp: 'Next: .fb {url} • .menu download',
    },
  },
}

// Tombol susulan sesudah media terkirim: unduh ulang URL yang sama + menu
// unduhan. URL tidak tersedia: menu unduhan + .aio saja.
export function buildFbButtons(url, t) {
  return url
    ? [
        { text: t('fb.btnRetry'), id: `.fb ${url}` },
        { text: t('fb.btnMenu'), id: '.menu download' },
      ]
    : [
        { text: t('fb.btnMenu'), id: '.menu download' },
        { text: t('fb.btnAio'), id: '.aio' },
      ]
}

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
