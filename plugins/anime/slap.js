import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'slap',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menampar (SFW, nekos.best)', en: 'Anime reaction GIF: slaps (SFW, nekos.best)' },
  usage: '.slap [@user]',
  example: '.slap',
  cooldown: 5,
}

export const i18n = {
  id: { slap: { captionTarget: '╭─❏ 💥 「 *TAMPARAN* 」\n┊ *@{from}* menampar *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💥 「 *TAMPARAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { slap: { captionTarget: '╭─❏ 💥 「 *SLAP* 」\n┊ *@{from}* slaps *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 💥 「 *SLAP* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.slap', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('slap')
