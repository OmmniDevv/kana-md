import { generateQr } from '../../src/scrapers/search/qr.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'qr',
  alias: ['qrcode'],
  category: 'search',
  description: { id: 'Buat gambar QR code dari teks atau link', en: 'Generate a QR code image from text or a link' },
  usage: '.qr <teks atau link>',
  example: '.qr https://example.com',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    qr: {
      needText: 'Ketik teks atau linknya dulu yaa, contoh: .qr https://example.com~',
      failed: 'Mouu, QR-nya gagal dibuat: {message}. Teksnya mungkin kepanjangan, coba yang lebih pendek ya~',
      caption: 'QR buat: {text}',
      hint: 'Buat baca QR dari gambar, balas gambar itu dengan .scanqr yaa~',
    },
  },
  en: {
    qr: {
      needText: 'Type the text or link first, example: .qr https://example.com~',
      failed: 'Mouu, failed to make the QR: {message}. The text may be too long, try something shorter~',
      caption: 'QR for: {text}',
      hint: 'To read a QR from an image, reply to that image with .scanqr~',
    },
  },
}

export const test = { input: '.qr https://omnidevv.vercel.app', expect: /QR buat/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('qr.needText'))
  let buffer
  try {
    buffer = await generateQr(text)
  } catch (err) {
    return ctx.reply(ctx.t('qr.failed', { message: err.message }))
  }
  await sendImage(ctx, buffer, { caption: ctx.t('qr.caption', { text: text.slice(0, 80) }) })
  await ctx.reply(ctx.t('qr.hint'))
}
