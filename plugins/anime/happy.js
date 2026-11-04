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
  id: { happy: { captionTarget: '╭─❏ 😄 「 *SENANG* 」\n┊ *@{from}* senang bareng *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😄 「 *SENANG* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { happy: { captionTarget: '╭─❏ 😄 「 *HAPPY* 」\n┊ *@{from}* is happy with *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😄 「 *HAPPY* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.happy', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('happy')
