import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'hug',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: memeluk (SFW, nekos.best)', en: 'Anime reaction GIF: hugs (SFW, nekos.best)' },
  usage: '.hug [@user]',
  example: '.hug',
  cooldown: 5,
}

export const i18n = {
  id: { hug: { captionTarget: '╭─❏ 🤗 「 *PELUKAN* 」\n┊ *@{from}* memeluk *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🤗 「 *PELUKAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { hug: { captionTarget: '╭─❏ 🤗 「 *HUG* 」\n┊ *@{from}* hugs *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🤗 「 *HUG* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.hug', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('hug')
