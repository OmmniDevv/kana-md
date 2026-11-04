import { searchChord } from '../../src/scrapers/search/chord.js'

export const config = {
  name: 'chord',
  alias: ['kunci'],
  category: 'search',
  description: { id: 'Cari chord gitar lagu dari Chordtela', en: 'Search guitar chords from Chordtela' },
  usage: '.chord <judul lagu>',
  example: '.chord Dewa Kangen',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    chord: {
      needQuery: 'Ketik judul lagunya dulu yaa, contoh: .chord Dewa Kangen~',
      failed: 'Mouu, sumber chord belum bisa dijangkau sekarang: {message}. Chordtela memang kadang susah diakses, coba lagi nanti ya~',
      header: 'Chord: {title}\nSumber: {url}',
    },
  },
  en: {
    chord: {
      needQuery: 'Type the song title first, example: .chord Dewa Kangen~',
      failed: 'Mouu, the chord source cannot be reached right now: {message}. Chordtela is hard to access sometimes, try again later~',
      header: 'Chords: {title}\nSource: {url}',
    },
  },
}

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('chord.needQuery'))
  let result
  try {
    result = await searchChord(query)
  } catch (err) {
    return ctx.reply(ctx.t('chord.failed', { message: err.message }))
  }
  const text = result.text.length > 3500 ? `${result.text.slice(0, 3500).trimEnd()}\n...` : result.text
  await ctx.reply(`${ctx.t('chord.header', { title: result.title, url: result.url })}\n\n${text}`)
}
