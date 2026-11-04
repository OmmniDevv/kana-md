import { reactionHandler } from '../../src/anime/images.js'

export const config = {
  name: 'smile',
  alias: [],
  category: 'anime',
  description: { id: 'GIF reaksi anime: tersenyum ke (SFW, nekos.best)', en: 'Anime reaction GIF: smiles at (SFW, nekos.best)' },
  usage: '.smile [@user]',
  example: '.smile',
  cooldown: 5,
}

export const i18n = {
  id: { smile: { captionTarget: '╭─❏ 🙂 「 *SENYUMAN* 」\n┊ *@{from}* tersenyum ke *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🙂 「 *SENYUMAN* 」\n┊ Nih GIF reaksinya~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL AMBIL GIF* 」\n┊ Mouu, gagal ambil GIF: *{error}*~\n╰━━━━━━━' } },
  en: { smile: { captionTarget: '╭─❏ 🙂 「 *SMILE* 」\n┊ *@{from}* smiles at *@{to}*~\n╰━━━━━━━', captionSelf: '╭─❏ 🙂 「 *SMILE* 」\n┊ Here is the reaction GIF~\n╰━━━━━━━', fail: '╭─❏ 💦 「 *FAILED TO FETCH GIF* 」\n┊ Mouu, failed to fetch the GIF: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.smile', expect: /gif|reaksi|reaction/i }

export const handler = reactionHandler('smile')
