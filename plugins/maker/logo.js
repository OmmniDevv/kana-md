import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'logo',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin logo teks sederhana ungu fuchsia', en: 'Make a simple purple fuchsia text logo' },
  usage: '.logo <teks>',
  example: '.logo OmniDevv',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    logo: {
      needText: 'Ketik teks logonya dulu yaa, contoh: .logo OmniDevv~',
      failed: 'Mouu, gagal bikin logonya: {message}~',
      caption: 'Logonya jadii~',
    },
  },
  en: {
    logo: {
      needText: 'Type the logo text first, example: .logo OmniDevv~',
      failed: 'Mouu, failed to make the logo: {message}~',
      caption: 'Your logo is ready~',
    },
  },
}

export const test = { input: '.logo OmniDevv', expect: /Logonya jadii/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('logo.needText'))
  const botName = process.env.BOT_NAME || 'KANA'
  try {
    const png = await textImage({
      width: 768,
      height: 512,
      background: '0x1E0533',
      lines: [
        { text, size: 72, color: 'magenta', bold: true, y: 180 },
        { text: botName, size: 26, color: 'white', y: 300 },
      ],
    })
    await sendImage(ctx, png, { caption: ctx.t('logo.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('logo.failed', { message: err.message }))
  }
}
