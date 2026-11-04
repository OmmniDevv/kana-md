import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'kiss',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: memberi ciuman ke (SFW, nekos.best)', en: 'Anime reaction GIF: kisses (SFW, nekos.best)' },
  usage: '.kiss [@user]',
  example: '.kiss',
  cooldown: 5,
}

export const i18n = {
  id: { kiss: { captionTarget: '@{from} memberi ciuman ke @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { kiss: { captionTarget: '@{from} kisses @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.kiss', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('kiss')
