import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'pat',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menepuk kepala (SFW, nekos.best)', en: 'Anime reaction GIF: pats the head of (SFW, nekos.best)' },
  usage: '.pat [@user]',
  example: '.pat',
  cooldown: 5,
}

export const i18n = {
  id: { pat: { captionTarget: '@{from} menepuk kepala @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { pat: { captionTarget: '@{from} pats the head of @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.pat', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('pat')
