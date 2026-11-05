import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

export const config = {
  name: 'promote',
  alias: [],
  category: 'group',
  description: { id: 'Jadikan member sebagai admin grup', en: 'Promote a member to group admin' },
  usage: '.promote <@user|balas pesan|nomor>',
  example: '.promote @user',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { promote: { noTarget: '╭─❏ ❓ 「 *SIAPA YANG JADI ADMIN?* 」\n┊ Mention member grupnya, balas pesannya, atau tulis nomornya yaa~\n╰━━━━━━━', ok: '╭─❏ 👑 「 *ADMIN BARU* 」\n┊ Yayyy, *@{digits}* sekarang jadi admin grup~\n┊ Selamat bertugas yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL PROMOSI* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
  en: { promote: { noTarget: '╭─❏ ❓ 「 *WHO SHOULD BE PROMOTED?* 」\n┊ Mention the group member, reply to their message, or write their number~\n╰━━━━━━━', ok: '╭─❏ 👑 「 *NEW ADMIN* 」\n┊ Yayyy, *@{digits}* is now a group admin~\n┊ Congrats and good luck~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO PROMOTE* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.promote', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = resolveTargetJids(ctx)
  if (!targets.length) return ctx.reply(ctx.t('promote.noTarget'))
  for (const jid of targets) {
    const digits = digitsOf(jid)
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'promote')
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('promote.ok', { digits }), mentions: [jid] }, { quoted: ctx.raw })
    } catch (err) {
      await ctx.reply(ctx.t('promote.fail', { digits, error: err.message }))
    }
  }
}
