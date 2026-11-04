import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

export const config = {
  name: 'kick',
  alias: [],
  category: 'group',
  description: { id: 'Keluarkan member dari grup', en: 'Remove a member from the group' },
  usage: '.kick <@user|balas pesan|nomor>',
  example: '.kick @user',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { kick: { noTarget: 'Siapa yang mau dikeluarkan? Mention, balas pesannya, atau tulis nomornya yaa~', ok: '@{digits} udah KANA keluarkan dari grup. Maaf ya, demi ketertiban~', fail: 'Gagal mengeluarkan @{digits}: {error}' } },
  en: { kick: { noTarget: 'Who should be removed? Mention them, reply to their message, or write their number~', ok: '@{digits} has been removed from the group. Sorry, for the group order~', fail: 'Failed to remove @{digits}: {error}' } },
}

export const test = { input: '.kick', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = resolveTargetJids(ctx)
  if (!targets.length) return ctx.reply(ctx.t('kick.noTarget'))
  for (const jid of targets) {
    const digits = digitsOf(jid)
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'remove')
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('kick.ok', { digits }), mentions: [jid] }, { quoted: ctx.raw })
    } catch (err) {
      await ctx.reply(ctx.t('kick.fail', { digits, error: err.message }))
    }
  }
}
