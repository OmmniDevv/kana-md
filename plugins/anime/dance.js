import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'dance',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menari bareng (SFW, nekos.best)', en: 'Anime reaction GIF: dances with (SFW, nekos.best)' },
  usage: '.dance [@user]',
  example: '.dance',
  cooldown: 5,
}

export const i18n = {
  id: { dance: { captionTarget: '@{from} menari bareng @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { dance: { captionTarget: '@{from} dances with @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.dance', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('dance')
