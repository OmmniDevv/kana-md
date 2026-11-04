import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'wave',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: melambai ke (SFW, nekos.best)', en: 'Anime reaction GIF: waves at (SFW, nekos.best)' },
  usage: '.wave [@user]',
  example: '.wave',
  cooldown: 5,
}

export const i18n = {
  id: { wave: { captionTarget: '@{from} melambai ke @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { wave: { captionTarget: '@{from} waves at @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.wave', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('wave')
