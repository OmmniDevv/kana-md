import { instagramDownload } from '../../src/scrapers/instagram/instagram.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendVideo, sendImage, MAX_VIDEO_BYTES, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'ig',
  alias: ['igdl', 'instagram'],
  category: 'download',
  description: { id: 'Unduh foto atau video Instagram dari link', en: 'Download an Instagram photo or video from a link' },
  usage: '.ig <link instagram>',
  example: '.ig https://www.instagram.com/reel/xxxx/',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ig: {
      needUrl: 'Kirim link Instagram-nya dulu yaa, contoh: .ig https://www.instagram.com/reel/...~',
      working: 'Sebentar, KANA ambilin medianya dulu... {mood}',
      failed: 'Mouu, gagal ambil medianya: {message}. Pastikan linknya dari akun publik ya~',
      tooBig: 'Aduh, ada media yang kegedean buat dikirim lewat WhatsApp, jadi KANA lewati ya~',
      caption: '{title}',
    },
  },
  en: {
    ig: {
      needUrl: 'Send the Instagram link first, example: .ig https://www.instagram.com/reel/...~',
      working: 'One sec, KANA is fetching the media... {mood}',
      failed: 'Mouu, failed to fetch the media: {message}. Make sure the link is from a public account~',
      tooBig: 'Oops, some media was too big to send over WhatsApp, so KANA skipped it~',
      caption: '{title}',
    },
  },
}

export async function handler(ctx) {
  const url = ctx.args[0]
  if (!url) return ctx.reply(ctx.t('ig.needUrl'))
  await ctx.reply(ctx.t('ig.working', { mood: ctx.say('mikir') }))
  const result = await instagramDownload(url)
  if (!result.status) return ctx.reply(ctx.t('ig.failed', { message: result.message }))
  const items = result.result.downloads.slice(0, 3)
  let skipped = false
  for (const [index, item] of items.entries()) {
    try {
      if (item.type === 'photo') {
        const media = await downloadBuffer(item.url, { maxBytes: MAX_IMAGE_BYTES })
        await sendImage(ctx, media.buffer, { caption: index === 0 ? ctx.t('ig.caption', { title: result.result.title }) : undefined })
      } else {
        const media = await downloadBuffer(item.url, { maxBytes: MAX_VIDEO_BYTES })
        await sendVideo(ctx, media.buffer, { caption: index === 0 ? ctx.t('ig.caption', { title: result.result.title }) : undefined })
      }
    } catch (err) {
      if (err.code === 'TOO_BIG') skipped = true
      else return ctx.reply(ctx.t('ig.failed', { message: err.message }))
    }
  }
  if (skipped) await ctx.reply(ctx.t('ig.tooBig'))
}
