import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'smug',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: tersenyum sombong (SFW, nekos.best)', en: 'Anime reaction GIF: smirks (SFW, nekos.best)' },
  usage: '.smug [@user]',
  example: '.smug',
  cooldown: 5,
}

export const i18n = {
  id: { smug: { captionTarget: '@{from} tersenyum sombong @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { smug: { captionTarget: '@{from} smirks @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.smug', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('smug')
