import { getRandomCosplayImage } from '../../src/scrapers/random/bluearchive.js'
import { sendImage } from '../../src/ui/media.js'

// Cosba: gambar cosplay Blue Archive acak dari sumber hidup. API lama
// (ryuu-dev) mati dari VM ini, diganti DAPI Safebooru tag blue_archive
// + cosplay + rating:safe; unduhan divalidasi magic bytes sebelum
// dikirim. Isi sumber pengganti ini gambar bertema cosplay (sebagian
// besar ilustrasi), bukan foto cosplayer asli.
export const config = {
  name: 'cosba',
  alias: ['cosplayba'],
  category: 'random',
  description: { id: 'Gambar cosplay Blue Archive acak', en: 'Random Blue Archive cosplay image' },
  usage: '.cosba',
  example: '.cosba',
  cooldown: 5,
}

export const i18n = {
  id: {
    cosba: {
      caption: '╭─❏ 🎭 「 *RANDOM BLUE ARCHIVE COSPLAY* 」\n┊ Sumber: {url}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *COSPLAY GAGAL* 」\n┊ Mouu, gambar cosplaynya gagal diambil: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    cosba: {
      caption: '╭─❏ 🎭 「 *RANDOM BLUE ARCHIVE COSPLAY* 」\n┊ Source: {url}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *COSPLAY FAILED* 」\n┊ Mouu, the cosplay image failed to load: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.cosba', expect: /blue archive cosplay/i }

export async function handler(ctx) {
  try {
    const { buffer, postUrl } = await getRandomCosplayImage()
    return await sendImage(ctx, buffer, { caption: ctx.t('cosba.caption', { url: postUrl }) })
  } catch (err) {
    return ctx.reply(ctx.t('cosba.fail', { message: err.message }))
  }
}
