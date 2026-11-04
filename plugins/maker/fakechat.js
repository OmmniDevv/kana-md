import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'fakechat',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin kartu obrolan parodi (berlabel PARODI jelas)', en: 'Make a parody chat card (clearly labelled PARODY)' },
  usage: '.fakechat <nama>|<pesan>',
  example: '.fakechat Budi|halo, apa kabar?',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    fakechat: {
      needArgs: 'Formatnya: .fakechat <nama>|<pesan>, contoh: .fakechat Budi|halo~ Kartunya selalu berlabel PARODI yaa.',
      failed: 'Mouu, gagal bikin kartu obrolannya: {message}~',
      caption: 'Kartu obrolan PARODI, bukan chat asli yaa~',
      parody: 'PARODI',
      parodyNote: 'Ini kartu parodi buatan KANA, bukan tangkapan layar asli.',
    },
  },
  en: {
    fakechat: {
      needArgs: 'Format: .fakechat <name>|<message>, example: .fakechat Budi|hello~ The card is always labelled PARODY.',
      failed: 'Mouu, failed to make the chat card: {message}~',
      caption: 'A PARODY chat card, not a real chat~',
      parody: 'PARODI',
      parodyNote: 'This is a parody card made by KANA, not a real screenshot.',
    },
  },
}

export const test = { input: '.fakechat', expect: /format/i }

export async function handler(ctx) {
  const [nameRaw, ...msgParts] = ctx.text.split('|')
  const name = (nameRaw || '').trim()
  const message = msgParts.join('|').trim()
  if (!name || !message) return ctx.reply(ctx.t('fakechat.needArgs'))
  try {
    const png = await textImage({
      width: 512,
      height: 512,
      background: '0x0B141A',
      lines: [
        { text: ctx.t('fakechat.parody'), size: 48, color: 'red', bold: true, y: 28 },
        { text: name, size: 30, color: 'cyan', bold: true, y: 120 },
        { text: message, size: 28, color: 'white', y: 190 },
        { text: ctx.t('fakechat.parodyNote'), size: 18, color: 'gray', y: 440 },
        { text: ctx.t('fakechat.parody'), size: 30, color: 'red', bold: true, y: 472 },
      ],
    })
    await sendImage(ctx, png, { caption: ctx.t('fakechat.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('fakechat.failed', { message: err.message }))
  }
}
