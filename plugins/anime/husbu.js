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
  id: { husbando: { caption: 'Dari: {source} ✨', captionPlain: 'Nih gambarnya~ ✨', fail: 'Gagal ambil gambar: {error}' } },
  en: { husbando: { caption: 'From: {source} ✨', captionPlain: 'Here is the image~ ✨', fail: 'Failed to fetch the image: {error}' } },
}

export const test = { input: '.husbu', expect: /gambar|image|✨/i }

export const handler = animeImageHandler('husbando')
