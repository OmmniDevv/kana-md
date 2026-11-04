import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'cry',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menangis (SFW, nekos.best)', en: 'Anime reaction GIF: cries (SFW, nekos.best)' },
  usage: '.cry [@user]',
  example: '.cry',
  cooldown: 5,
}

export const i18n = {
  id: { cry: { captionTarget: '╭─❏ 😭 「 *MENANGIS* 」\n┊ *@{from}* menangis *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😭 「 *MENANGIS* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { cry: { captionTarget: '╭─❏ 😭 「 *CRYING* 」\n┊ *@{from}* cries *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😭 「 *CRYING* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.cry', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('cry')
