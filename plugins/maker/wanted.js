import { wantedCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'
import { hashPercent } from '../fun/cekmood.js'

export const config = {
  name: 'wanted',
  alias: ['posterwanted'],
  category: 'maker',
  description: { id: 'Poster WANTED ala koboi buat kamu atau user yang di-tag', en: 'Cowboy style WANTED poster for you or the tagged user' },
  usage: '.wanted [@user atau nama]',
  example: '.wanted',
  cooldown: 5,
}

export const i18n = {
  id: { wanted: { caption: 'Poster wanted {name} dengan bounty {bounty} koin 🤠', fail: 'Gagal bikin poster: {error}' } },
  en: { wanted: { caption: 'Wanted poster of {name} with a {bounty} coin bounty 🤠', fail: 'Failed to make the poster: {error}' } },
}

export const test = { input: '.wanted', expect: /wanted/i }

export async function handler(ctx) {
  const targetDigits = ctx.mentionedJids?.[0]?.split('@')[0] ?? ctx.senderDigits
  const name = (ctx.text || '').replace(/@\d+/g, '').trim() || (ctx.mentionedJids?.length ? `@${targetDigits}` : ctx.pushName || targetDigits)
  const seed = hashPercent(`wanted:${targetDigits}`) // 1..100 deterministik
  const bounty = 1000 + seed * 137
  try {
    const buffer = await wantedCard({ name, bounty })
    return sendImage(ctx, buffer, { caption: ctx.t('wanted.caption', { name, bounty: bounty.toLocaleString('id-ID') }) })
  } catch (err) {
    return ctx.reply(ctx.t('wanted.fail', { error: err.message }))
  }
}
