import { animeImageHandler } from '../../src/anime/images.js'

export const config = {
  name: 'neko',
  alias: ['neko2'],
  category: 'anime',
  description: { id: 'Gambar neko anime SFW acak dari nekos.best', en: 'Random SFW anime neko image from nekos.best' },
  usage: '.neko',
  example: '.neko',
  cooldown: 5,
}

export const i18n = {
  id: { neko: { caption: '╭─❏ 🐱 「 *NEKO* 」\n┊ ᴅᴀʀɪ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🐱 「 *NEKO* 」\n┊ Nih gambarnya~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GAMBAR* 」\n┊ Mouu, gagal ambil gambar: *{error}*~\n╰━━━━━━━' } },
  en: { neko: { caption: '╭─❏ 🐱 「 *NEKO* 」\n┊ ꜰʀᴏᴍ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🐱 「 *NEKO* 」\n┊ Here is the image~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH IMAGE* 」\n┊ Mouu, failed to fetch the image: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.neko', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('neko')
