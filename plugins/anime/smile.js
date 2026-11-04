import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'smile',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: tersenyum ke (SFW, nekos.best)', en: 'Anime reaction GIF: smiles at (SFW, nekos.best)' },
  usage: '.smile [@user]',
  example: '.smile',
  cooldown: 5,
}

export const i18n = {
  id: { smile: { captionTarget: '@{from} tersenyum ke @{to}~', captionSelf: 'Nih GIF reaksinya~', fail: 'Gagal ambil GIF: {error}' } },
  en: { smile: { captionTarget: '@{from} smiles at @{to}~', captionSelf: 'Here is the reaction GIF~', fail: 'Failed to fetch the GIF: {error}' } },
}

export const test = { input: '.smile', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('smile')
