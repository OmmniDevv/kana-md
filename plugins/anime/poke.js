import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'poke',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: mencolek (SFW, nekos.best)', en: 'Anime reaction GIF: pokes (SFW, nekos.best)' },
  usage: '.poke [@user]',
  example: '.poke',
  cooldown: 5,
}

export const i18n = {
  id: { poke: { captionTarget: '╭─❏ 👉 「 *COLEKAN* 」\n┊ *@{from}* mencolek *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 👉 「 *COLEKAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { poke: { captionTarget: '╭─❏ 👉 「 *POKE* 」\n┊ *@{from}* pokes *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 👉 「 *POKE* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.poke', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('poke')
