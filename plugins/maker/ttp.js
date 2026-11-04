import { textImage } from '../../src/services/text-image.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { sendSticker } from './sticker.js'

export const config = {
  name: 'ttp',
  alias: ['ttp2', 'ttpv2'],
  category: 'maker',
  description: { id: 'Bikin stiker teks besar putih di latar warna aksen', en: 'Make a big white text sticker on an accent background' },
  usage: '.ttp <teks>',
  example: '.ttp semangat',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    ttp: {
      needText: 'Ketik teksnya dulu yaa, contoh: .ttp semangat~',
      failed: 'Mouu, gagal bikin stiker ttp: {message}~',
      done: 'Stiker ttpnya jadii~',
      menuButton: 'Menu Maker',
    },
  },
  en: {
    ttp: {
      needText: 'Type the text first, example: .ttp you can do it~',
      failed: 'Mouu, failed to make the ttp sticker: {message}~',
      done: 'Your ttp sticker is ready~',
      menuButton: 'Maker Menu',
    },
  },
}

export const test = { input: '.ttp semangat terus', expect: /Stiker ttpnya/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('ttp.needText'))
  try {
    const png = await textImage({
      width: 512,
      height: 512,
      background: '0x8B5CF6',
      lines: [{ text, size: 56, color: 'white', bold: true, y: 200 }],
    })
    const webp = await toStickerWebp(png, { animated: false })
    await sendSticker(ctx, webp)
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('ttp.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('ttp.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('ttp.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('ttp.failed', { message: err.message }))
  }
}
