import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'wink',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: mengedip (SFW, nekos.best)', en: 'Anime reaction GIF: winks at (SFW, nekos.best)' },
  usage: '.wink [@user]',
  example: '.wink',
  cooldown: 5,
}

export const i18n = {
  id: { wink: { captionTarget: '╭─❏ 😉 「 *KEDIPAN* 」\n┊ *@{from}* mengedip ke *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😉 「 *KEDIPAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { wink: { captionTarget: '╭─❏ 😉 「 *WINK* 」\n┊ *@{from}* winks at *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 😉 「 *WINK* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.wink', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('wink')
