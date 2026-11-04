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
  id: { smug: { captionTarget: '╭─❏ 😏 「 *SENYUM SOMBONG* 」\n┊ *@{from}* tersenyum sombong ke *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😏 「 *SENYUM SOMBONG* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { smug: { captionTarget: '╭─❏ 😏 「 *SMUG* 」\n┊ *@{from}* smirks at *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😏 「 *SMUG* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.smug', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('smug')
