import { getRandomBlueArchiveImage } from '../../src/scrapers/random/bluearchive.js'
import { sendImage } from '../../src/ui/media.js'

// Barandom: gambar Blue Archive acak beneran dari endpoint Nexray
// (divalidasi magic bytes), bukan teks fakta statis.
export const config = {
  name: 'barandom',
  alias: ['bluearchive', 'ba'],
  category: 'random',
  description: { id: 'Gambar Blue Archive acak', en: 'Random Blue Archive image' },
  usage: '.barandom',
  example: '.barandom',
  cooldown: 5,
}

export const i18n = {
  id: {
    barandom: {
      caption: '╭─❏ 🖼️ 「 *BLUE ARCHIVE RANDOM* 」\n┊ Gambar Blue Archive acak buat kamu~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAMBAR GAGAL* 」\n┊ Mouu, gambarnya gagal diambil: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    barandom: {
      caption: '╭─❏ 🖼️ 「 *BLUE ARCHIVE RANDOM* 」\n┊ A random Blue Archive image for you~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *IMAGE FAILED* 」\n┊ Mouu, the image failed to load: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.barandom', expect: /blue archive random/i }

export async function handler(ctx) {
  try {
    const { buffer } = await getRandomBlueArchiveImage()
    return await sendImage(ctx, buffer, { caption: ctx.t('barandom.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('barandom.fail', { message: err.message }))
  }
}
