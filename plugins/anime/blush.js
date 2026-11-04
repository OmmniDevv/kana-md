import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'blush',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: merona malu (SFW, nekos.best)', en: 'Anime reaction GIF: blushes (SFW, nekos.best)' },
  usage: '.blush [@user]',
  example: '.blush',
  cooldown: 5,
}

export const i18n = {
  id: { blush: { captionTarget: '@{from} merona malu @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { blush: { captionTarget: '@{from} blushes @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.blush', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('blush')
