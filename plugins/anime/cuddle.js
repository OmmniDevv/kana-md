import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'cuddle',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: berpelukan dengan (SFW, nekos.best)', en: 'Anime reaction GIF: cuddles (SFW, nekos.best)' },
  usage: '.cuddle [@user]',
  example: '.cuddle',
  cooldown: 5,
}

export const i18n = {
  id: { cuddle: { captionTarget: '╭─❏ 🫂 「 *BERPELUKAN* 」\n┊ *@{from}* berpelukan dengan *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🫂 「 *BERPELUKAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { cuddle: { captionTarget: '╭─❏ 🫂 「 *CUDDLE* 」\n┊ *@{from}* cuddles *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🫂 「 *CUDDLE* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.cuddle', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('cuddle')
