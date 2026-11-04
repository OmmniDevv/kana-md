// PP couple: dua gambar anime serasi (satu waifu, satu husbando) dari
// nekos.best (SFW). Pengganti waifu.pics yang sudah mati.
import { fetchNekos } from '../../src/anime/images.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'ppcouple',
  alias: ['ppcp', 'couplepp', 'couple'],
  category: 'anime',
  description: { id: 'Pasangan foto profil anime couple (waifu + husbando) SFW', en: 'A matching anime couple profile picture pair (waifu + husbando), SFW' },
  usage: '.ppcouple',
  example: '.ppcouple',
  cooldown: 8,
}

export const i18n = {
  id: { ppcouple: { first: 'PP couple buat ceweknya~ 💕', second: 'Dan ini buat cowoknya~ 💕', fail: 'Gagal ambil PP couple: {error}' } },
  en: { ppcouple: { first: 'Couple PP for her~ 💕', second: 'And this one for him~ 💕', fail: 'Failed to fetch the couple PP: {error}' } },
}

export const test = { input: '.ppcouple', expect: /couple/i }

export async function handler(ctx) {
  try {
    const [girl, boy] = await Promise.all([fetchNekos('waifu'), fetchNekos('husbando')])
    const g = await downloadBuffer(girl.url, { maxBytes: 16 * 1024 * 1024 })
    await sendImage(ctx, g.buffer, { caption: ctx.t('ppcouple.first') })
    const b = await downloadBuffer(boy.url, { maxBytes: 16 * 1024 * 1024 })
    return sendImage(ctx, b.buffer, { caption: ctx.t('ppcouple.second') })
  } catch (err) {
    return ctx.reply(ctx.t('ppcouple.fail', { error: err.message }))
  }
}
