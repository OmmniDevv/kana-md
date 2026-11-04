import { searchKbbi } from '../../src/scrapers/search/kbbi.js'

export const config = {
  name: 'kbbi',
  alias: ['kamus'],
  category: 'search',
  description: { id: 'Cari arti kata di KBBI', en: 'Look up a word definition in KBBI' },
  usage: '.kbbi <kata>',
  example: '.kbbi cinta',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    kbbi: {
      needWord: '╭─❏ 📖 「 *KBBI* 」\n┊ Ketik katanya dulu yaa~\n┊ Contoh: *.kbbi cinta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *KATA TIDAK KETEMU* 」\n┊ Mouu, kata *{word}* nggak ketemu di KBBI, atau halamannya berubah format~\n┊ Coba kata dasar lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *KBBI TIDAK TERJANGKAU* 」\n┊ Mouu, KBBI lagi nggak bisa dijangkau: *{message}*\n┊ Situsnya memang sering berat, coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 📖 「 *ARTI KATA: {word}* 」\n┊ ᴍᴇɴᴜʀᴜᴛ *KBBI*:',
      item: '┊ {n}. {definition}',
    },
  },
  en: {
    kbbi: {
      needWord: '╭─❏ 📖 「 *KBBI* 」\n┊ Type the word first~\n┊ Example: *.kbbi cinta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *WORD NOT FOUND* 」\n┊ Mouu, the word *{word}* was not found in KBBI, or its page format changed~\n┊ Try another base word~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *KBBI UNREACHABLE* 」\n┊ Mouu, KBBI cannot be reached right now: *{message}*\n┊ The site is often slow, try again later~\n╰━━━━━━━',
      header: '╭─❏ 📖 「 *MEANING OF: {word}* 」\n┊ ᴀᴄᴄᴏʀᴅɪɴɢ ᴛᴏ *KBBI*:',
      item: '┊ {n}. {definition}',
    },
  },
}

export const test = { input: '.kbbi cinta', expect: /Arti kata/i }

export async function handler(ctx) {
  const word = ctx.args[0]
  if (!word) return ctx.reply(ctx.t('kbbi.needWord'))
  let result
  try {
    result = await searchKbbi(word)
  } catch (err) {
    return ctx.reply(ctx.t('kbbi.failed', { message: err.message }))
  }
  if (!result.definitions.length) return ctx.reply(ctx.t('kbbi.notFound', { word: result.word }))
  const lines = [ctx.t('kbbi.header', { word: result.word })]
  result.definitions.forEach((definition, i) => {
    lines.push(ctx.t('kbbi.item', { n: i + 1, definition }))
  })
  lines.push('╰━━━━━━━')
  await ctx.reply(lines.join('\n'))
}
