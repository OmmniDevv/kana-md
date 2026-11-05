// PP couple: dua gambar anime serasi (satu waifu, satu husbando) dari
// nekos.best (SFW). Pengganti waifu.pics yang sudah mati.
import { fetchNekos } from '../../src/anime/images.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'ppcouple',
  alias: ['couplepp', 'couple'],
  category: 'anime',
  description: { id: 'Pasangan foto profil anime couple (waifu + husbando) SFW', en: 'A matching anime couple profile picture pair (waifu + husbando), SFW' },
  usage: '.ppcouple',
  example: '.ppcouple',
  cooldown: 8,
}

export const i18n = {
  id: { ppcouple: { first: '╭─❏ 💕 「 *PP COUPLE* 」\n┊ PP couple buat ceweknya~ 💕\n╰━━━━━━━', second: '╭─❏ 💕 「 *PP COUPLE* 」\n┊ Dan ini buat cowoknya~ 💕\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL PP COUPLE* 」\n┊ Mouu, gagal ambil PP couple: *{error}*~\n╰━━━━━━━' } },
  en: { ppcouple: { first: '╭─❏ 💕 「 *COUPLE PP* 」\n┊ Couple PP for her~ 💕\n╰━━━━━━━', second: '╭─❏ 💕 「 *COUPLE PP* 」\n┊ And this one for him~ 💕\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH COUPLE PP* 」\n┊ Mouu, failed to fetch the couple PP: *{error}*~\n╰━━━━━━━' } },
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
