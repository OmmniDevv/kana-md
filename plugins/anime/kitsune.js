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
  id: { kitsune: { caption: 'Dari: {source} ✨', captionPlain: 'Nih gambarnya~ ✨', fail: 'Gagal ambil gambar: {error}' } },
  en: { kitsune: { caption: 'From: {source} ✨', captionPlain: 'Here is the image~ ✨', fail: 'Failed to fetch the image: {error}' } },
}

export const test = { input: '.kitsune', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('kitsune')
