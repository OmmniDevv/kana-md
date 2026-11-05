import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'
import { resolveTargetsToPhone } from '../../src/services/group-members.js'

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
  id: { promote: { noTarget: '╭─❏ ❓ 「 *SIAPA YANG JADI ADMIN?* 」\n┊ Mention member grupnya, balas pesannya, atau tulis nomornya yaa~\n╰━━━━━━━', ok: '╭─❏ 👑 「 *ADMIN BARU* 」\n┊ Yayyy, *@{digits}* sekarang jadi admin grup~\n┊ Selamat bertugas yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL PROMOSI* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━', denied: '╭─❏ 🚫 「 *TIDAK BISA PROMOSI* 」\n┊ Maaf yaa, status admin *@{digits}* tidak bisa KANA ubah~\n┊ Biasanya karena dia pemilik grup, atau aksinya di luar wewenang KANA di grup ini~\n╰━━━━━━━' } },
  en: { promote: { noTarget: '╭─❏ ❓ 「 *WHO SHOULD BE PROMOTED?* 」\n┊ Mention the group member, reply to their message, or write their number~\n╰━━━━━━━', ok: '╭─❏ 👑 「 *NEW ADMIN* 」\n┊ Yayyy, *@{digits}* is now a group admin~\n┊ Congrats and good luck~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO PROMOTE* 」\n┊ *@{digits}*: {error}\n╰━━━━━━━', denied: '╭─❏ 🚫 「 *CANNOT PROMOTE* 」\n┊ Sorry, KANA cannot change the admin status of *@{digits}*~\n┊ Usually because they own the group, or the action is beyond KANA authority in this group~\n╰━━━━━━━' } },
}

// Error wewenang dari WhatsApp (mis. mempromosikan pemilik grup membalas
// "forbidden") tidak boleh bocor mentah ke user; kenali di sini.
export function isForbiddenError(err) {
  const code = err?.output?.statusCode ?? err?.status ?? err?.statusCode
  if (code === 403) return true
  return /forbidden|not-authorized/i.test(String(err?.message || err || ''))
}

export const test = { input: '.promote 6285869074622', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = await resolveTargetsToPhone(ctx, resolveTargetJids(ctx))
  if (!targets.length) return ctx.reply(ctx.t('promote.noTarget'))
  for (const jid of targets) {
    const digits = digitsOf(jid)
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'promote')
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('promote.ok', { digits }), mentions: [jid] }, { quoted: ctx.raw })
    } catch (err) {
      if (isForbiddenError(err)) {
        await ctx.reply(ctx.t('promote.denied', { digits }))
      } else {
        await ctx.reply(ctx.t('promote.fail', { digits, error: err.message }))
      }
    }
  }
}
