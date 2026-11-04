import { textImage } from '../../src/services/text-image.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'faketweet',
  alias: [],
  category: 'maker',
  description: { id: 'Bikin kartu unggahan X parodi (berlabel PARODI jelas)', en: 'Make a parody X post card (clearly labelled PARODY)' },
  usage: '.faketweet <nama>|<isi>',
  example: '.faketweet Budi|hari ini seru banget',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    faketweet: {
      needArgs: 'Formatnya: .faketweet <nama>|<isi>, contoh: .faketweet Budi|halo semua~ Kartunya selalu berlabel PARODI yaa.',
      failed: 'Mouu, gagal bikin kartu unggahannya: {message}~',
      caption: 'Kartu unggahan PARODI, bukan unggahan asli yaa~',
      parody: 'PARODI',
      handle: '@parodi_bukan_asli',
      parodyNote: 'Ini kartu parodi buatan KANA, bukan unggahan asli.',
    },
  },
  en: {
    faketweet: {
      needArgs: 'Format: .faketweet <name>|<content>, example: .faketweet Budi|hello all~ The card is always labelled PARODY.',
      failed: 'Mouu, failed to make the post card: {message}~',
      caption: 'A PARODY post card, not a real post~',
      parody: 'PARODI',
      handle: '@parody_not_real',
      parodyNote: 'This is a parody card made by KANA, not a real post.',
    },
  },
}

export const test = { input: '.faketweet', expect: /format/i }

export async function handler(ctx) {
  const [nameRaw, ...msgParts] = ctx.text.split('|')
  const name = (nameRaw || '').trim()
  const content = msgParts.join('|').trim()
  if (!name || !content) return ctx.reply(ctx.t('faketweet.needArgs'))
  try {
    const png = await textImage({
      width: 512,
      height: 512,
      background: '0x000000',
      lines: [
        { text: ctx.t('faketweet.parody'), size: 48, color: 'red', bold: true, y: 28 },
        { text: name, size: 30, color: 'white', bold: true, y: 120 },
        { text: ctx.t('faketweet.handle'), size: 20, color: 'gray', y: 165 },
        { text: content, size: 28, color: 'white', y: 220 },
        { text: ctx.t('faketweet.parodyNote'), size: 18, color: 'gray', y: 440 },
        { text: ctx.t('faketweet.parody'), size: 30, color: 'red', bold: true, y: 472 },
      ],
    })
    await sendImage(ctx, png, { caption: ctx.t('faketweet.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('faketweet.failed', { message: err.message }))
  }
}
