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
      needText: '╭─❏ 🔲 「 *BUAT QR* 」\n┊ Ketik teks atau linknya dulu yaa~\n┊ Contoh: *.qr https://example.com*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *QR GAGAL DIBUAT* 」\n┊ Mouu, QR-nya gagal dibuat: *{message}*\n┊ Teksnya mungkin kepanjangan, coba yang lebih pendek yaa~\n╰━━━━━━━',
      caption: '╭─❏ 🔲 「 *QR BUAT* 」\n┊ {text}\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *INFO* 」\n┊ Buat baca QR dari gambar, balas gambar itu dengan *.scanqr* yaa~\n╰━━━━━━━',
    },
  },
  en: {
    qr: {
      needText: '╭─❏ 🔲 「 *MAKE A QR* 」\n┊ Type the text or link first~\n┊ Example: *.qr https://example.com*\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *QR FAILED* 」\n┊ Mouu, failed to make the QR: *{message}*\n┊ The text may be too long, try something shorter~\n╰━━━━━━━',
      caption: '╭─❏ 🔲 「 *QR FOR* 」\n┊ {text}\n╰━━━━━━━',
      hint: '╭─❏ 💡 「 *INFO* 」\n┊ To read a QR from an image, reply to that image with *.scanqr*~\n╰━━━━━━━',
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
