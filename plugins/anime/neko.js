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
  id: { neko: { caption: 'Dari: {source} ✨', captionPlain: 'Nih gambarnya~ ✨', fail: 'Gagal ambil gambar: {error}' } },
  en: { neko: { caption: 'From: {source} ✨', captionPlain: 'Here is the image~ ✨', fail: 'Failed to fetch the image: {error}' } },
}

export const test = { input: '.neko', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('neko')
