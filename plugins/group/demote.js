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
  id: { demote: { noTarget: '╭─❏ ❓ 「 *SIAPA YANG DITURUNKAN?* 」\n┊ Mention admin grupnya, balas pesannya, atau tulis nomornya yaa~\n╰━━━━━━━', ok: '╭─❏ 🌸 「 *SUDAH DITURUNKAN* 」\n┊ *@{digits}* sekarang jadi member biasa yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL MENURUNKKAN* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
  en: { demote: { noTarget: '╭─❏ ❓ 「 *WHO SHOULD BE DEMOTED?* 」\n┊ Mention the group admin, reply to their message, or write their number~\n╰━━━━━━━', ok: '╭─❏ 🌸 「 *DEMOTED* 」\n┊ *@{digits}* is now a regular member~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO DEMOTE* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.demote 6285869074622', expect: /grup|group/i }

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
