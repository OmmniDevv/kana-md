import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

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
      needQuoted: '╭─❏ 💬 「 *BUTUH KUTIPAN* 」\n┊ Kutip pesannya dulu yaa, terus ketik *.quotly*~\n╰━━━━━━━',
      noText: '╭─❏ 🔍 「 *TIDAK ADA TEKS* 」\n┊ Mouu, pesan yang dikutip nggak ada teksnya. Kutip pesan teks yaa~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *GAGAL BIKIN KARTU* 」\n┊ Mouu, gagal bikin kartu kutipannya: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 💬 「 *KARTU KUTIPAN JADI* 」\n┊ Kartu kutipannya jadii, estetik banget~\n╰━━━━━━━',
      unknown: 'tidak dikenal',
    },
  },
  en: {
    quotly: {
      needQuoted: '╭─❏ 💬 「 *QUOTE NEEDED* 」\n┊ Quote a message first, then type *.quotly*~\n╰━━━━━━━',
      noText: '╭─❏ 🔍 「 *NO TEXT FOUND* 」\n┊ Mouu, the quoted message has no text. Quote a text message~\n╰━━━━━━━',
      failed: '╭─❏ 💦 「 *QUOTE CARD FAILED* 」\n┊ Mouu, failed to make the quote card: *{message}*~\n╰━━━━━━━',
      caption: '╭─❏ 💬 「 *QUOTE CARD READY* 」\n┊ Your quote card is ready, so aesthetic~\n╰━━━━━━━',
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

export const test = { input: '.quotly Halo semuanya, aku KANA', expect: /kutip/i }

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
  } catch (err) {
    return ctx.reply(ctx.t('quotly.failed', { message: err.message }))
  }
}
