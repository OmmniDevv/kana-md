import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'poke',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: mencolek (SFW, nekos.best)', en: 'Anime reaction GIF: pokes (SFW, nekos.best)' },
  usage: '.poke [@user]',
  example: '.poke',
  cooldown: 5,
}

export const i18n = {
  id: { poke: { captionTarget: '@{from} mencolek @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { poke: { captionTarget: '@{from} pokes @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.poke', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('poke')
