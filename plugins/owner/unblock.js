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
      hint: '╭─❏ 🔓 「 *BUKA BLOKIR* 」\n┊ Sebut nomor atau mention orangnya yaa, Master~\n╰━━━━━━━',
      done: '╭─❏ 🔓 「 *BLOKIR DIBUKA* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ Siap, Master~ blokir nomor itu sudah KANA buka. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL BUKA BLOKIR* 」\n┊ Mouu, gagal membuka blokir, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    unblock: {
      hint: '╭─❏ 🔓 「 *UNBLOCK NUMBER* 」\n┊ Mention the number or the person, Master~\n╰━━━━━━━',
      done: '╭─❏ 🔓 「 *UNBLOCKED* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ Done, Master~ that number is unblocked. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *UNBLOCK FAILED* 」\n┊ Mouu, failed to unblock, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
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
