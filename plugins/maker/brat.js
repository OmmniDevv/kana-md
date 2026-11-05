import { bratGen } from 'brat-canvas'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendSticker } from './sticker.js'

export const config = {
  name: 'brat',
  alias: ['brat2', 'bratv'],
  category: 'maker',
  description: { id: 'Bikin stiker teks gaya brat asli (putih, teks hitam rata kiri-kanan, agak blur)', en: 'Make an authentic brat style text sticker (white, justified black text, slight blur)' },
  usage: '.brat <teks>',
  example: '.brat halo dunia',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    brat: {
      needText: 'Ketik teksnya dulu yaa, contoh: .brat halo dunia~',
      failed: 'Mouu, gagal bikin stiker brat: {message}~',
      done: 'Stiker bratnya jadii~',
    },
  },
  en: {
    brat: {
      needText: 'Type the text first, example: .brat hello world~',
      failed: 'Mouu, failed to make the brat sticker: {message}~',
      done: 'Your brat sticker is ready~',
    },
  },
}

export const test = { input: '.brat halo semuanya', expect: /Stiker bratnya/i }

export async function handler(ctx) {
  const text = ctx.text.trim().toLowerCase()
  if (!text) return ctx.reply(ctx.t('brat.needText'))
  try {
    const png = await bratGen(text)
    const webp = await toStickerWebp(png, { animated: false })
    await sendSticker(ctx, webp)
    return ctx.reply(ctx.t('brat.done'))
  } catch (err) {
    return ctx.reply(ctx.t('brat.failed', { message: err.message }))
  }
}
