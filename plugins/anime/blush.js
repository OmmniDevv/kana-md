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
  id: { blush: { captionTarget: '╭─❏ 😳 「 *MERONA* 」\n┊ *@{from}* merona malu *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😳 「 *MERONA* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { blush: { captionTarget: '╭─❏ 😳 「 *BLUSH* 」\n┊ *@{from}* blushes *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😳 「 *BLUSH* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.blush', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('blush')
