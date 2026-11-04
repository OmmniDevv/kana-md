// Foto anjing acak dari Dog CEO (API publik tanpa kunci, pengecualian
// ringan gambar hewan setara Jikan di DECISIONS.md).
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'dog',
  alias: ['anjing', 'doggo'],
  category: 'fun',
  description: { id: 'Foto anjing acak yang lucu dari Dog CEO', en: 'A random cute dog photo from Dog CEO' },
  usage: '.dog',
  example: '.dog',
  cooldown: 5,
}

export const i18n = {
  id: { dog: { caption: 'Guk guk! Nih anjing lucunya~ 🐶', fail: 'Gagal ambil foto anjing: {error}' } },
  en: { dog: { caption: 'Woof woof! Here is a cute dog~ 🐶', fail: 'Failed to fetch a dog photo: {error}' } },
}

export const test = { input: '.dog', expect: /guk|woof/i }

export async function handler(ctx) {
  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random', { signal: AbortSignal.timeout(20000) })
    const data = await res.json()
    if (data.status !== 'success' || !data.message) throw new Error('Dog CEO tidak memberi foto')
    const media = await downloadBuffer(data.message, { maxBytes: 16 * 1024 * 1024 })
    return sendImage(ctx, media.buffer, { caption: ctx.t('dog.caption') })
  } catch (err) {
    return ctx.reply(ctx.t('dog.fail', { error: err.message }))
  }
}
