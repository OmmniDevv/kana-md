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
  id: { promote: { noTarget: 'Siapa yang mau dijadikan admin? Mention, balas pesannya, atau tulis nomornya yaa~', ok: 'Yayyy, @{digits} sekarang jadi admin grup. Selamat bertugas~', fail: 'Gagal mempromosikan @{digits}: {error}' } },
  en: { promote: { noTarget: 'Who should be promoted? Mention them, reply to their message, or write their number~', ok: 'Yayyy, @{digits} is now a group admin. Congrats~', fail: 'Failed to promote @{digits}: {error}' } },
}

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
