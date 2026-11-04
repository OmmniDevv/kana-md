export const config = {
  name: 'revoke',
  alias: [],
  category: 'group',
  description: { id: 'Reset link undangan grup', en: 'Reset the group invite link' },
  usage: '.revoke',
  example: '.revoke',
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { revoke: { ok: 'Siap~ link lama udah dicabut. Ini link barunya: {link}', fail: 'Gagal reset link grup: {error}' } },
  en: { revoke: { ok: 'Got it~ the old link has been revoked. Here is the new link: {link}', fail: 'Failed to reset group link: {error}' } },
}

export const test = { input: '.revoke', expect: /grup|group/i }

export async function handler(ctx) {
  try {
    const code = await ctx.sock.groupRevokeInvite(ctx.chat)
    await ctx.reply(ctx.t('revoke.ok', { link: `https://chat.whatsapp.com/${code}` }))
  } catch (err) {
    await ctx.reply(ctx.t('revoke.fail', { error: err.message }))
  }
}
