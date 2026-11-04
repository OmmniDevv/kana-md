import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument } from '../../src/ui/media.js'
import { extractPixeldrainId, pixeldrainFileUrl, pixeldrainInfo } from '../../src/scrapers/download/pixeldrain.js'

export const config = {
  name: 'pixeldrain',
  alias: ['pd'],
  category: 'download',
  description: { id: 'Unduh berkas publik dari Pixeldrain', en: 'Download a public file from Pixeldrain' },
  usage: '.pixeldrain <link pixeldrain>',
  example: '.pixeldrain https://pixeldrain.com/u/xxxxxxxx',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pixeldrain: {
      needUrl: 'Kirim link Pixeldrain-nya dulu yaa, contoh: .pixeldrain https://pixeldrain.com/u/xxxxxxxx~',
      working: 'Sebentar, KANA ambil berkasnya dari Pixeldrain dulu... {mood}',
      caption: '💾 {name}\nUkuran: {size}',
      tooBig: 'Berkasnya "{name}" kegedean buat dikirim lewat WA ({size}). Unduh langsung di sini yaa: {url}',
      failed: 'Mouu, gagal ambil dari Pixeldrain: {message}~',
    },
  },
  en: {
    pixeldrain: {
      needUrl: 'Send the Pixeldrain link first, example: .pixeldrain https://pixeldrain.com/u/xxxxxxxx~',
      working: 'One sec, KANA is fetching the file from Pixeldrain... {mood}',
      caption: '💾 {name}\nSize: {size}',
      tooBig: 'The file "{name}" is too big to send over WA ({size}). Download it directly here: {url}',
      failed: 'Mouu, failed to fetch from Pixeldrain: {message}~',
    },
  },
}

export const test = { input: '.pixeldrain', expect: /pixeldrain/i }

const MAX_BYTES = 60 * 1024 * 1024

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export async function handler(ctx) {
  const id = extractPixeldrainId(ctx.text)
  if (!id) return ctx.reply(ctx.t('pixeldrain.needUrl'))
  await ctx.reply(ctx.t('pixeldrain.working', { mood: ctx.say('mikir') }))
  try {
    const info = await pixeldrainInfo(id)
    const url = pixeldrainFileUrl(id)
    if (info.size > MAX_BYTES) {
      return ctx.reply(ctx.t('pixeldrain.tooBig', { name: info.name, size: humanSize(info.size), url }))
    }
    const media = await downloadBuffer(url, { maxBytes: MAX_BYTES })
    return sendDocument(ctx, media.buffer, {
      fileName: info.name,
      caption: ctx.t('pixeldrain.caption', { name: info.name, size: humanSize(info.size) }),
    })
  } catch (err) {
    return ctx.reply(ctx.t('pixeldrain.failed', { message: err.message }))
  }
}
