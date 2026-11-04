import { targetDigits } from './block.js'

export const config = {
  name: 'unblock',
  alias: [],
  category: 'owner',
  description: { id: 'Buka blokir satu nomor di level WhatsApp bot (owner)', en: 'Unblock one number at the bot WhatsApp level (owner)' },
  usage: '.unblock <nomor atau mention>',
  example: '.unblock 6281234567890',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    unblock: {
      hint: 'Sebut nomor atau mention orangnya yaa, Master~',
      done: 'Siap, Master~ blokir nomor {number} sudah KANA buka. {mood}',
      fail: 'Gagal membuka blokir, Master: {error}',
    },
  },
  en: {
    unblock: {
      hint: 'Mention the number or the person, Master~',
      done: 'Done, Master~ number {number} is unblocked. {mood}',
      fail: 'Failed to unblock, Master: {error}',
    },
  },
}

export const test = { input: '.unblock', expect: /nomor|number|mention/i }

export async function handler(ctx) {
  const digits = targetDigits(ctx)
  if (!digits) return ctx.reply(ctx.t('unblock.hint'))
  try {
    await ctx.sock.updateBlockStatus(`${digits}@s.whatsapp.net`, 'unblock')
    return ctx.reply(ctx.t('unblock.done', { number: digits, mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('unblock.fail', { error: err.message }))
  }
}
