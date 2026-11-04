import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'cuddle',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: berpelukan dengan (SFW, nekos.best)', en: 'Anime reaction GIF: cuddles (SFW, nekos.best)' },
  usage: '.cuddle [@user]',
  example: '.cuddle',
  cooldown: 5,
}

export const i18n = {
  id: { cuddle: { captionTarget: '@{from} berpelukan dengan @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { cuddle: { captionTarget: '@{from} cuddles @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.cuddle', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('cuddle')
