import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'hug',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: memeluk (SFW, nekos.best)', en: 'Anime reaction GIF: hugs (SFW, nekos.best)' },
  usage: '.hug [@user]',
  example: '.hug',
  cooldown: 5,
}

export const i18n = {
  id: { hug: { captionTarget: '@{from} memeluk @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { hug: { captionTarget: '@{from} hugs @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.hug', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('hug')
