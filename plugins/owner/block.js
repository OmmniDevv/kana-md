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
      hint: '╭─❏ ⛔ 「 *BLOKIR NOMOR* 」\n┊ Sebut nomor atau mention orangnya yaa, Master~\n╰━━━━━━━',
      done: '╭─❏ ⛔ 「 *SUDAH DIBLOKIR* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ Siap, Master~ nomor itu sudah KANA blokir. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL BLOKIR* 」\n┊ Mouu, gagal memblokir, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    block: {
      hint: '╭─❏ ⛔ 「 *BLOCK NUMBER* 」\n┊ Mention the number or the person, Master~\n╰━━━━━━━',
      done: '╭─❏ ⛔ 「 *BLOCKED* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ Done, Master~ that number is blocked. {mood}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *BLOCK FAILED* 」\n┊ Mouu, failed to block, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
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
