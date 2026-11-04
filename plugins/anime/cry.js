import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'cry',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menangis (SFW, nekos.best)', en: 'Anime reaction GIF: cries (SFW, nekos.best)' },
  usage: '.cry [@user]',
  example: '.cry',
  cooldown: 5,
}

export const i18n = {
  id: { cry: { captionTarget: '@{from} menangis @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { cry: { captionTarget: '@{from} cries @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.cry', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('cry')
