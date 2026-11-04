import { animeImageHandler } from '../../src/anime/images.js'

export const config = {
  name: 'waifu',
  alias: ['shinobu', 'maid', 'megumin'],
  category: 'anime',
  description: { id: 'Gambar waifu anime SFW acak dari nekos.best', en: 'Random SFW anime waifu image from nekos.best' },
  usage: '.waifu',
  example: '.waifu',
  cooldown: 5,
}

export const i18n = {
  id: { waifu: { caption: '╭─❏ 🌸 「 *WAIFU* 」\n┊ ᴅᴀʀɪ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🌸 「 *WAIFU* 」\n┊ Nih gambarnya~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GAMBAR* 」\n┊ Mouu, gagal ambil gambar: *{error}*~\n╰━━━━━━━' } },
  en: { waifu: { caption: '╭─❏ 🌸 「 *WAIFU* 」\n┊ ꜰʀᴏᴍ: *{source}* ✨\n╰━━━━━━━', captionPlain: '╭─❏ 🌸 「 *WAIFU* 」\n┊ Here is the image~ ✨\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH IMAGE* 」\n┊ Mouu, failed to fetch the image: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.waifu', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('waifu')
