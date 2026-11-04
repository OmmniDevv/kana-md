export const config = {
  name: 'join',
  alias: [],
  category: 'owner',
  description: { id: 'Bot bergabung ke grup dari link undangan (owner)', en: 'Bot joins a group from an invite link (owner)' },
  usage: '.join <link undangan grup>',
  example: '.join https://chat.whatsapp.com/AbCdEfGh',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    join: {
      hint: 'Kasih link undangannya yaa, Master. Contoh: .join https://chat.whatsapp.com/xxxx',
      done: 'Siap, Master~ KANA sudah bergabung ke grup itu. {mood}',
      fail: 'Gagal bergabung, Master: {error}. Linknya mungkin sudah tidak berlaku~',
    },
  },
  en: {
    join: {
      hint: 'Give me the invite link, Master. Example: .join https://chat.whatsapp.com/xxxx',
      done: 'Done, Master~ KANA joined that group. {mood}',
      fail: 'Failed to join, Master: {error}. The link may have expired~',
    },
  },
}

export const test = { input: '.join', expect: /link|invite/i }

export function extractInviteCode(text) {
  const m = String(text || '').match(/chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9_-]{10,})/)
  if (m) return m[1]
  const bare = String(text || '').trim()
  return /^[A-Za-z0-9_-]{15,}$/.test(bare) ? bare : null
}

export async function handler(ctx) {
  const code = extractInviteCode(ctx.text)
  if (!code) return ctx.reply(ctx.t('join.hint'))
  try {
    await ctx.sock.groupAcceptInvite(code)
    return ctx.reply(ctx.t('join.done', { mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('join.fail', { error: err.message }))
  }
}
