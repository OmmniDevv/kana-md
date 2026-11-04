import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'slap',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menampar (SFW, nekos.best)', en: 'Anime reaction GIF: slaps (SFW, nekos.best)' },
  usage: '.slap [@user]',
  example: '.slap',
  cooldown: 5,
}

export const i18n = {
  id: { slap: { captionTarget: '@{from} menampar @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { slap: { captionTarget: '@{from} slaps @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.slap', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('slap')
