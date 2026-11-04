import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

export const config = {
  name: 'demote',
  alias: [],
  category: 'group',
  description: { id: 'Turunkan admin grup jadi member biasa', en: 'Demote a group admin to member' },
  usage: '.demote <@user|balas pesan|nomor>',
  example: '.demote @user',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { demote: { noTarget: 'Siapa yang mau diturunkan? Mention, balas pesannya, atau tulis nomornya yaa~', ok: '@{digits} udah KANA turunkan jadi member biasa yaa.', fail: 'Gagal menurunkan @{digits}: {error}' } },
  en: { demote: { noTarget: 'Who should be demoted? Mention them, reply to their message, or write their number~', ok: '@{digits} has been demoted to a regular member.', fail: 'Failed to demote @{digits}: {error}' } },
}

export async function handler(ctx) {
  const targets = resolveTargetJids(ctx)
  if (!targets.length) return ctx.reply(ctx.t('demote.noTarget'))
  for (const jid of targets) {
    const digits = digitsOf(jid)
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'demote')
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('demote.ok', { digits }), mentions: [jid] }, { quoted: ctx.raw })
    } catch (err) {
      await ctx.reply(ctx.t('demote.fail', { digits, error: err.message }))
    }
  }
}
