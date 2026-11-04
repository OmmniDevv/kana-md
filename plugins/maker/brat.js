import { textImage, wrapText } from '../../src/services/text-image.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { sendSticker } from './sticker.js'

export const config = {
  name: 'brat',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin stiker teks gaya brat (putih, hitam, kiri bawah)', en: 'Make a brat style text sticker (white, black, bottom left)' },
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
      menuButton: 'Menu Maker',
    },
  },
  en: {
    brat: {
      needText: 'Type the text first, example: .brat hello world~',
      failed: 'Mouu, failed to make the brat sticker: {message}~',
      done: 'Your brat sticker is ready~',
      menuButton: 'Maker Menu',
    },
  },
}

export const test = { input: '.brat halo semuanya', expect: /Stiker bratnya/i }

export async function handler(ctx) {
  const text = ctx.text.trim().toLowerCase()
  if (!text) return ctx.reply(ctx.t('brat.needText'))
  try {
    const size = 40
    const linesCount = wrapText(text, 16).length
    const y = Math.max(24, 512 - linesCount * Math.ceil(size * 1.35) - 24)
    const png = await textImage({
      width: 512,
      height: 512,
      background: '0xFFFFFF',
      lines: [{ text, size, color: 'black', bold: true, x: 20, y }],
    })
    const webp = await toStickerWebp(png, { animated: false })
    await sendSticker(ctx, webp)
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('brat.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('brat.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('brat.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('brat.failed', { message: err.message }))
  }
}
