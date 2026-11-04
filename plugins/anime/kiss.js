import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'kiss',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: memberi ciuman ke (SFW, nekos.best)', en: 'Anime reaction GIF: kisses (SFW, nekos.best)' },
  usage: '.kiss [@user]',
  example: '.kiss',
  cooldown: 5,
}

export const i18n = {
  id: { kiss: { captionTarget: '╭─❏ 💋 「 *CIUMAN* 」\n┊ *@{from}* memberi ciuman ke *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💋 「 *CIUMAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { kiss: { captionTarget: '╭─❏ 💋 「 *KISS* 」\n┊ *@{from}* kisses *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💋 「 *KISS* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.kiss', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('kiss')
