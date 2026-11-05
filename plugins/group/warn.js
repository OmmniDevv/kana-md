import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { applyWarnToSettings, digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'
import { resolveTargetsToPhone } from '../../src/services/group-members.js'

export const config = {
  name: 'warn',
  alias: [],
  category: 'group',
  description: { id: 'Beri peringatan ke member grup', en: 'Warn a group member' },
  usage: '.warn <@user|balas pesan|nomor>',
  example: '.warn @user',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    warn: {
      noTarget: '╭─❏ ❓ 「 *SIAPA YANG DI-WARN?* 」\n┊ Mention member grupnya, balas pesannya, atau tulis nomornya yaa~\n╰━━━━━━━',
      warned: '╭─❏ ⚠️ 「 *WARN DIBERIKAN* 」\n┊ *@{digits}* dapat warn, sekarang *{count}/{limit}* warn~\n┊ Jaga sikap yaa~\n╰━━━━━━━',
      kicked: '╭─❏ 👋 「 *BATAS WARN TERCAPAI* 」\n┊ *@{digits}* mencapai batas warn *({limit})* jadi KANA keluarkan dari grup~\n╰━━━━━━━',
      kickFailed: '╭─❏ ⚠️ 「 *BATAS WARN TERCAPAI* 」\n┊ *@{digits}* mencapai batas warn *({limit})*, tapi KANA belum bisa mengeluarkannya karena bot bukan admin grup~\n╰━━━━━━━',
      self: '╭─❏ 🙈 「 *TIDAK BISA WARN* 」\n┊ Ehh, nggak bisa warn diri sendiri atau bot yaa~\n╰━━━━━━━',
    },
  },
  en: {
    warn: {
      noTarget: '╭─❏ ❓ 「 *WHO SHOULD BE WARNED?* 」\n┊ Mention the group member, reply to their message, or write their number~\n╰━━━━━━━',
      warned: '╭─❏ ⚠️ 「 *WARNING GIVEN* 」\n┊ *@{digits}* has been warned, now at *{count}/{limit}* warns~\n┊ Please behave~\n╰━━━━━━━',
      kicked: '╭─❏ 👋 「 *WARN LIMIT REACHED* 」\n┊ *@{digits}* reached the warn limit *({limit})* so I removed them from the group~\n╰━━━━━━━',
      kickFailed: '╭─❏ ⚠️ 「 *WARN LIMIT REACHED* 」\n┊ *@{digits}* reached the warn limit *({limit})*, but I cannot remove them because the bot is not a group admin~\n╰━━━━━━━',
      self: '╭─❏ 🙈 「 *CANNOT WARN* 」\n┊ Eh, cannot warn yourself or the bot~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.warn 6285869074622', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = await resolveTargetsToPhone(ctx, resolveTargetJids(ctx))
  if (!targets.length) return ctx.reply(ctx.t('warn.noTarget'))
  const jid = targets[0]
  const digits = digitsOf(jid)
  if (!digits || digits === ctx.senderDigits) return ctx.reply(ctx.t('warn.self'))
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const result = applyWarnToSettings(settings, digits, settings.warnLimit)
  await updateGroupSettings(ctx.storage, ctx.chat, { warns: result.warns })
  if (result.shouldKick) {
    let kicked = false
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'remove')
      kicked = true
    } catch { kicked = false }
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t(kicked ? 'warn.kicked' : 'warn.kickFailed', { digits, limit: result.limit }),
      mentions: [jid],
    })
    return
  }
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('warn.warned', { digits, count: result.count, limit: result.limit }),
    mentions: [jid],
  }, { quoted: ctx.raw })
}
