import { capcutDownload, extractCapcutUrl } from '../../src/scrapers/download/capcut.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'capcut',
  alias: ['ccdl'],
  category: 'download',
  description: { id: 'Unduh video template CapCut tanpa watermark dari link template', en: 'Download a CapCut template video without watermark from a template link' },
  usage: '.capcut <link capcut>',
  example: '.capcut https://www.capcut.com/template-detail/7186615508471418114',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    capcut: {
      needUrl: 'Kirim link template CapCut-nya dulu yaa, contoh: .capcut https://www.capcut.com/template-detail/...~',
      working: 'Sebentar, KANA ambilin video templatenya dulu... {mood}',
      failed: 'Mouu, gagal ambil videonya: {message}. Coba lagi nanti ya~',
      tooBig: 'Aduh, videonya kegedean buat dikirim lewat WhatsApp (di atas 64 MB)~',
      caption: '🎬 {title}',
      btnRetry: 'Unduh ulang',
    },
  },
  en: {
    capcut: {
      needUrl: 'Send the CapCut template link first, example: .capcut https://www.capcut.com/template-detail/...~',
      working: 'One sec, KANA is fetching the template video... {mood}',
      failed: 'Mouu, failed to fetch the video: {message}. Try again later~',
      tooBig: 'Oops, the video is too big to send over WhatsApp (over 64 MB)~',
      caption: '🎬 {title}',
      btnRetry: 'Download again',
    },
  },
}

export const test = { input: '.capcut https://www.capcut.com/template-detail/7186615508471418114', expect: /capcut/i }

export async function handler(ctx) {
  const url = extractCapcutUrl(ctx.text)
  if (!url) return ctx.reply(ctx.t('capcut.needUrl'))
  await ctx.reply(ctx.t('capcut.working', { mood: ctx.say('mikir') }))
  try {
    const { title, videoUrl } = await capcutDownload(url)
    const media = await downloadBuffer(videoUrl, { maxBytes: MAX_VIDEO_BYTES })
    if (media.buffer.length > MAX_VIDEO_BYTES) return ctx.reply(ctx.t('capcut.tooBig'))
    await sendVideo(ctx, media.buffer, { caption: ctx.t('capcut.caption', { title }) })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: title,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('capcut.btnRetry'), id: `.capcut ${url}` }],
      textFallback: '',
    })
  } catch (err) {
    return ctx.reply(ctx.t('capcut.failed', { message: err.message }))
  }
}
