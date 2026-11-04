import { quoteCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'buatquote',
  alias: ['quoteimg', 'kartuquote'],
  category: 'maker',
  description: { id: 'Buat kartu gambar kutipan: teks, opsional penulis sesudah tanda |', en: 'Make a quote image card: text, optional author after a | sign' },
  usage: '.buatquote <teks> | <penulis>',
  example: '.buatquote Tetap semangat, gagal itu guru terbaik | Kana',
  cooldown: 5,
}

export const i18n = {
  id: {
    buatquote: {
      hint: 'Tulis kutipannya yaa~ Contoh: .buatquote Tetap semangat | Kana',
      caption: 'Kartu kutipanmu jadii~ {mood}',
      fail: 'Gagal bikin kartu kutipan: {error}',
    },
  },
  en: {
    buatquote: {
      hint: 'Write the quote please~ Example: .buatquote Keep going | Kana',
      caption: 'Your quote card is ready~ {mood}',
      fail: 'Failed to make the quote card: {error}',
    },
  },
}

export const test = { input: '.buatquote', expect: /kutipan|quote/i }

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  if (!raw) return ctx.reply(ctx.t('buatquote.hint'))
  const [textPart, authorPart] = raw.split('|').map((s) => s.trim())
  const author = authorPart || ctx.pushName || 'Anonim'
  try {
    const buffer = await quoteCard({ text: textPart.slice(0, 300), author })
    return sendImage(ctx, buffer, { caption: ctx.t('buatquote.caption', { mood: ctx.say('sukses') }) })
  } catch (err) {
    return ctx.reply(ctx.t('buatquote.fail', { error: err.message }))
  }
}
