import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { applyWarnToSettings, digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

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
      noTarget: 'Siapa yang mau di-warn? Mention, balas pesannya, atau tulis nomornya yaa~',
      warned: '@{digits} dapat warn. Sekarang {count}/{limit} warn. Jaga sikap yaa~',
      kicked: '@{digits} mencapai batas warn ({limit}) jadi KANA keluarkan dari grup.',
      kickFailed: '@{digits} mencapai batas warn ({limit}), tapi KANA belum bisa mengeluarkannya karena bot bukan admin.',
      self: 'Ehh, nggak bisa warn diri sendiri atau bot yaa~',
    },
  },
  en: {
    warn: {
      noTarget: 'Who should be warned? Mention them, reply to their message, or write their number~',
      warned: '@{digits} has been warned. Now at {count}/{limit} warns. Please behave~',
      kicked: '@{digits} reached the warn limit ({limit}) so I removed them from the group.',
      kickFailed: '@{digits} reached the warn limit ({limit}), but I cannot remove them because the bot is not admin.',
      self: 'Eh, cannot warn yourself or the bot~',
    },
  },
}

export const test = { input: '.warn', expect: /grup|group/i }

export async function handler(ctx) {
  const targets = resolveTargetJids(ctx)
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
