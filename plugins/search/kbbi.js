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
      needWord: 'Ketik katanya dulu yaa, contoh: .kbbi cinta~',
      notFound: 'Mouu, kata "{word}" nggak ketemu di KBBI, atau halamannya berubah format. Coba kata dasar lain ya~',
      failed: 'Mouu, KBBI lagi nggak bisa dijangkau: {message}. Situsnya memang sering berat, coba lagi nanti ya~',
      header: 'Arti kata "{word}" menurut KBBI:',
      item: '{n}. {definition}',
    },
  },
  en: {
    kbbi: {
      needWord: 'Type the word first, example: .kbbi cinta~',
      notFound: 'Mouu, the word "{word}" was not found in KBBI, or its page format changed. Try another base word~',
      failed: 'Mouu, KBBI cannot be reached right now: {message}. The site is often slow, try again later~',
      header: 'Meaning of "{word}" according to KBBI:',
      item: '{n}. {definition}',
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
  await ctx.reply(lines.join('\n'))
}
