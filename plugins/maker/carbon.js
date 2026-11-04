import { textImage, wrapText } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'carbon',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin kartu kode bergaya editor gelap', en: 'Make a dark editor style code card' },
  usage: '.carbon <kode>',
  example: '.carbon console.log("halo")',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    carbon: {
      needCode: 'Ketik kodenya dulu yaa, contoh: .carbon console.log("halo")~',
      failed: 'Mouu, gagal bikin kartu kodenya: {message}~',
      caption: 'Kartu kodenya jadii~',
      dots: '●●●',
    },
  },
  en: {
    carbon: {
      needCode: 'Type the code first, example: .carbon console.log("hello")~',
      failed: 'Mouu, failed to make the code card: {message}~',
      caption: 'Your code card is ready~',
      dots: '●●●',
    },
  },
}

export async function handler(ctx) {
  const code = ctx.text
  if (!code.trim()) return ctx.reply(ctx.t('carbon.needCode'))
  try {
    const codeLines = wrapText(code, 34)
    const lines = [
      { text: ctx.t('carbon.dots'), size: 22, color: 'gray', x: 20, y: 20 },
      ...codeLines.slice(0, 14).map((line, i) => ({
        text: `${i + 1}  ${line}`,
        size: 20,
        color: 'white',
        mono: true,
        x: 20,
      })),
    ]
    const png = await textImage({ width: 512, height: 512, background: '0x0D1117', lines })
    await sendImage(ctx, png, { caption: ctx.t('carbon.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('carbon.failed', { message: err.message }))
  }
}
