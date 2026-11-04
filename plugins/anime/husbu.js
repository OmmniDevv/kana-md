import { animeImageHandler } from '../../src/anime/images.js'

export const config = {
  name: 'husbu',
  alias: [],
  category: 'anime',
  description: { id: 'Gambar husbando anime SFW acak dari nekos.best', en: 'Random SFW anime husbando image from nekos.best' },
  usage: '.husbu',
  example: '.husbu',
  cooldown: 5,
}

export const i18n = {
  id: { husbando: { caption: '╭─❏ 🌟 「 *HUSBANDO* 」\n┊ ᴅᴀʀɪ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🌟 「 *HUSBANDO* 」\n┊ Nih gambarnya~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GAMBAR* 」\n┊ Mouu, gagal ambil gambar: *{error}*~\n╰━━━━━━━' } },
  en: { husbando: { caption: '╭─❏ 🌟 「 *HUSBANDO* 」\n┊ ꜰʀᴏᴍ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🌟 「 *HUSBANDO* 」\n┊ Here is the image~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH IMAGE* 」\n┊ Mouu, failed to fetch the image: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.husbu', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('husbando')
