import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'
import { resolveTargetsToPhone } from '../../src/services/group-members.js'

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
  id: { kick: { noTarget: '╭─❏ ❓ 「 *SIAPA YANG DIKELUARKAN?* 」\n┊ Mention member grupnya, balas pesannya, atau tulis nomornya yaa~\n╰━━━━━━━', ok: '╭─❏ 👋 「 *MEMBER DIKELUARKAN* 」\n┊ *@{digits}* udah KANA keluarkan dari grup~\n┊ Maaf ya, demi ketertiban grup~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL MENGELUARKAN* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
  en: { kick: { noTarget: '╭─❏ ❓ 「 *WHO SHOULD BE REMOVED?* 」\n┊ Mention the group member, reply to their message, or write their number~\n╰━━━━━━━', ok: '╭─❏ 👋 「 *MEMBER REMOVED* 」\n┊ *@{digits}* has been removed from the group~\n┊ Sorry, for the group order~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO REMOVE* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━' } },
}

export const test = { input: '.kick 6285869074622', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = await resolveTargetsToPhone(ctx, resolveTargetJids(ctx))
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
