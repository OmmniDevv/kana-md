import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'wink',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: mengedip (SFW, nekos.best)', en: 'Anime reaction GIF: winks at (SFW, nekos.best)' },
  usage: '.wink [@user]',
  example: '.wink',
  cooldown: 5,
}

export const i18n = {
  id: { wink: { captionTarget: '@{from} mengedip @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { wink: { captionTarget: '@{from} winks at @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.wink', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('wink')
