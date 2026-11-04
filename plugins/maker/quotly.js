import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'quotly',
  alias: [],
  category: 'maker',
  description: { id: 'Ubah pesan yang dikutip jadi kartu kutipan', en: 'Turn a quoted message into a quote card' },
  usage: '.quotly (kutip pesan teks)',
  example: '.quotly',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    quotly: {
      needQuoted: 'Kutip pesannya dulu yaa, terus ketik .quotly~',
      noText: 'Mouu, pesan yang dikutip nggak ada teksnya. Kutip pesan teks yaa~',
      failed: 'Mouu, gagal bikin kartu kutipannya: {message}~',
      caption: 'Kartu kutipannya jadii~',
      done: 'Kartu kutipannya jadii~',
      menuButton: 'Menu Maker',
      unknown: 'tidak dikenal',
    },
  },
  en: {
    quotly: {
      needQuoted: 'Quote a message first, then type .quotly~',
      noText: 'Mouu, the quoted message has no text. Quote a text message~',
      failed: 'Mouu, failed to make the quote card: {message}~',
      caption: 'Your quote card is ready~',
      done: 'Your quote card is ready~',
      menuButton: 'Maker Menu',
      unknown: 'unknown',
    },
  },
}

export function extractQuotedText(message) {
  if (!message) return ''
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    ''
  ).trim()
}

export async function handler(ctx) {
  if (!ctx.quoted) return ctx.reply(ctx.t('quotly.needQuoted'))
  const text = extractQuotedText(ctx.quoted.message)
  if (!text) return ctx.reply(ctx.t('quotly.noText'))
  const digits = String(ctx.quoted.sender || '').replace(/\D/g, '')
  const name = digits || ctx.t('quotly.unknown')
  try {
    const png = await textImage({
      width: 512,
      height: 512,
      background: '0x17102B',
      lines: [
        { text: `+${name}`, size: 26, color: 'magenta', bold: true, y: 60 },
        { text, size: 32, color: 'white', y: 130 },
      ],
    })
    await sendImage(ctx, png, { caption: ctx.t('quotly.caption') })
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body: ctx.t('quotly.done'),
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('quotly.menuButton'), id: '.menu maker' }],
      textFallback: ctx.t('quotly.done'),
    })
  } catch (err) {
    return ctx.reply(ctx.t('quotly.failed', { message: err.message }))
  }
}
