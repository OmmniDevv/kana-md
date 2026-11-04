import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'dance',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menari bareng (SFW, nekos.best)', en: 'Anime reaction GIF: dances with (SFW, nekos.best)' },
  usage: '.dance [@user]',
  example: '.dance',
  cooldown: 5,
}

export const i18n = {
  id: { dance: { captionTarget: '╭─❏ 💃 「 *MENARI* 」\n┊ *@{from}* menari bareng *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💃 「 *MENARI* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { dance: { captionTarget: '╭─❏ 💃 「 *DANCING* 」\n┊ *@{from}* dances with *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💃 「 *DANCING* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.dance', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('dance')
