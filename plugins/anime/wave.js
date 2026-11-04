import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'wave',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: melambai ke (SFW, nekos.best)', en: 'Anime reaction GIF: waves at (SFW, nekos.best)' },
  usage: '.wave [@user]',
  example: '.wave',
  cooldown: 5,
}

export const i18n = {
  id: { wave: { captionTarget: '╭─❏ 👋 「 *LAMBAIAN* 」\n┊ *@{from}* melambai ke *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 👋 「 *LAMBAIAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { wave: { captionTarget: '╭─❏ 👋 「 *WAVE* 」\n┊ *@{from}* waves at *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 👋 「 *WAVE* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.wave', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('wave')
