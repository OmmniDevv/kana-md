import { animeImageHandler } from '../../src/anime/images.js'

export const config = {
  name: 'waifu',
  alias: [],
  category: 'anime',
  description: { id: 'Gambar waifu anime SFW acak dari nekos.best', en: 'Random SFW anime waifu image from nekos.best' },
  usage: '.waifu',
  example: '.waifu',
  cooldown: 5,
}

export const i18n = {
  id: { waifu: { caption: 'Dari: {source} ✨', captionPlain: 'Nih gambarnya~ ✨', fail: 'Gagal ambil gambar: {error}' } },
  en: { waifu: { caption: 'From: {source} ✨', captionPlain: 'Here is the image~ ✨', fail: 'Failed to fetch the image: {error}' } },
}

export const test = { input: '.waifu', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('waifu')
