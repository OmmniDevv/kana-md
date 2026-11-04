// Foto kucing acak dari CATAAS (Cat as a Service, API publik gambar
// kucing tanpa kunci, pengecualian ringan seperti Dog CEO).
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'cat',
  alias: ['kucing', 'meow'],
  category: 'fun',
  description: { id: 'Foto kucing acak yang gemas dari CATAAS', en: 'A random cute cat photo from CATAAS' },
  usage: '.cat',
  example: '.cat',
  cooldown: 5,
}

export const i18n = {
  id: { cat: { caption: '╭─❏ 🐱 「 *KUCING GEMAS* 」\n┊ Meong~ Nih kucing gemasnya~\n╰━━━━━━━', fail: '╭─❏ 🐱 「 *GAGAL AMBIL FOTO* 」\n┊ Gagal ambil foto kucing: {error}\n╰━━━━━━━' } },
  en: { cat: { caption: '╭─❏ 🐱 「 *CUTE CAT* 」\n┊ Meow~ Here is a cute cat~\n╰━━━━━━━', fail: '╭─❏ 🐱 「 *PHOTO FETCH FAILED* 」\n┊ Failed to fetch a cat photo: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.cat', expect: /meong|meow/i }

export async function handler(ctx) {
  try {
    const media = await downloadBuffer('https://cataas.com/cat', { maxBytes: 16 * 1024 * 1024 })
    return sendImage(ctx, media.buffer, { caption: ctx.t('cat.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('cat.fail', { error: err.message }))
  }
}
