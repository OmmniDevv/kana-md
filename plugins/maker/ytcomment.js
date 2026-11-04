import { ytCommentCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'
import { hashPercent } from '../fun/cekmood.js'

export const config = {
  name: 'ytcomment',
  alias: ['komentar', 'ytkomen'],
  category: 'maker',
  description: { id: 'Buat kartu komentar YouTube versi meme berlabel jelas', en: 'Make a clearly labeled meme YouTube comment card' },
  usage: '.ytcomment <nama> | <isi komentar>',
  example: '.ytcomment Malik | Videonya keren banget!',
  cooldown: 8,
}

export const i18n = {
  id: { ytcomment: { hint: 'Formatnya: .ytcomment <nama> | <isi komentar>. Contoh: .ytcomment Malik | Videonya keren banget!', fail: 'Gagal bikin kartunya: {error}' } },
  en: { ytcomment: { hint: 'Format: .ytcomment <name> | <comment text>. Example: .ytcomment Malik | Great video!', fail: 'Failed to make the card: {error}' } },
}

export const test = { input: '.ytcomment', expect: /ytcomment/i }

export async function handler(ctx) {
  const raw = ctx.text || ''
  const sep = raw.indexOf('|')
  if (sep < 1) return ctx.reply(ctx.t('ytcomment.hint'))
  const name = raw.slice(0, sep).trim().slice(0, 30)
  const text = raw.slice(sep + 1).trim().slice(0, 220)
  if (!name || !text) return ctx.reply(ctx.t('ytcomment.hint'))
  try {
    const png = await ytCommentCard({
      name,
      handle: name.toLowerCase().replace(/\s+/g, ''),
      text,
      likes: hashPercent(`ytc:${name}:${text}`) * 13,
    })
    return sendImage(ctx, png, {})
  } catch (err) {
    return ctx.reply(ctx.t('ytcomment.fail', { error: err.message }))
  }
}
