import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'pat',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: menepuk kepala (SFW, nekos.best)', en: 'Anime reaction GIF: pats the head of (SFW, nekos.best)' },
  usage: '.pat [@user]',
  example: '.pat',
  cooldown: 5,
}

export const i18n = {
  id: { pat: { captionTarget: '╭─❏ 🐾 「 *TEPUKAN KEPALA* 」\n┊ *@{from}* menepuk kepala *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🐾 「 *TEPUKAN KEPALA* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { pat: { captionTarget: '╭─❏ 🐾 「 *HEAD PAT* 」\n┊ *@{from}* pats the head of *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🐾 「 *HEAD PAT* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.pat', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('pat')
