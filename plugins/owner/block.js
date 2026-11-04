export const config = {
  name: 'block',
  alias: [],
  category: 'owner',
  description: { id: 'Blokir satu nomor di level WhatsApp bot (owner)', en: 'Block one number at the bot WhatsApp level (owner)' },
  usage: '.block <nomor atau mention>',
  example: '.block 6281234567890',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    block: {
      hint: 'Sebut nomor atau mention orangnya yaa, Master~',
      done: 'Siap, Master~ nomor {number} sudah KANA blokir. {mood}',
      fail: 'Gagal memblokir, Master: {error}',
    },
  },
  en: {
    block: {
      hint: 'Mention the number or the person, Master~',
      done: 'Done, Master~ number {number} is blocked. {mood}',
      fail: 'Failed to block, Master: {error}',
    },
  },
}

export const test = { input: '.block', expect: /nomor|number|mention/i }

export function targetDigits(ctx) {
  if (ctx.mentionedJids?.[0]) return ctx.mentionedJids[0].split('@')[0]
  const digits = (ctx.text || '').replace(/\D/g, '')
  return digits.length >= 9 ? digits : null
}

export async function handler(ctx) {
  const digits = targetDigits(ctx)
  if (!digits) return ctx.reply(ctx.t('block.hint'))
  try {
    await ctx.sock.updateBlockStatus(`${digits}@s.whatsapp.net`, 'block')
    return ctx.reply(ctx.t('block.done', { number: digits, mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('block.fail', { error: err.message }))
  }
}
