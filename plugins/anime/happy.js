import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'happy',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: senang bareng (SFW, nekos.best)', en: 'Anime reaction GIF: is happy with (SFW, nekos.best)' },
  usage: '.happy [@user]',
  example: '.happy',
  cooldown: 5,
}

export const i18n = {
  id: { happy: { captionTarget: '@{from} senang bareng @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { happy: { captionTarget: '@{from} is happy with @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.happy', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('happy')
