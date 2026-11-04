import { animeImageHandler } from '../../src/anime/images.js'

export const config = {
  name: 'kitsune',
  alias: [],
  category: 'anime',
  description: { id: 'Gambar kitsune anime SFW acak dari nekos.best', en: 'Random SFW anime kitsune image from nekos.best' },
  usage: '.kitsune',
  example: '.kitsune',
  cooldown: 5,
}

export const i18n = {
  id: { kitsune: { caption: '╭─❏ 🦊 「 *KITSUNE* 」\n┊ ᴅᴀʀɪ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🦊 「 *KITSUNE* 」\n┊ Nih gambarnya~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GAMBAR* 」\n┊ Mouu, gagal ambil gambar: *{error}*~\n╰━━━━━━━' } },
  en: { kitsune: { caption: '╭─❏ 🦊 「 *KITSUNE* 」\n┊ ꜰʀᴏᴍ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🦊 「 *KITSUNE* 」\n┊ Here is the image~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH IMAGE* 」\n┊ Mouu, failed to fetch the image: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.kitsune', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('kitsune')
