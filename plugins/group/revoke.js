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
  id: { revoke: { ok: '╭─❏ 🔗 「 *LINK GRUP DIRESET* 」\n┊ Link lama udah dicabut~\n┊ ʟɪɴᴋ ʙᴀʀᴜ: {link}\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL RESET LINK* 」\n┊ Gagal reset link grup: {error}\n╰━━━━━━━' } },
  en: { revoke: { ok: '╭─❏ 🔗 「 *GROUP LINK RESET* 」\n┊ The old link has been revoked~\n┊ ɴᴇᴡ ʟɪɴᴋ: {link}\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO RESET LINK* 」\n┊ Failed to reset group link: {error}\n╰━━━━━━━' } },
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
