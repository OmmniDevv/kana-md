export const config = {
  name: 'leave',
  alias: ['keluargrup'],
  category: 'owner',
  description: { id: 'Bot keluar dari grup ini atau JID grup yang disebut (owner)', en: 'Bot leaves this group or the mentioned group JID (owner)' },
  usage: '.leave [jid grup]',
  example: '.leave',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    leave: {
      hint: 'Perintah ini dipakai di dalam grup, atau sebut JID grupnya yaa, Master: .leave 120363xxx@g.us',
      done: 'Siap, Master~ KANA keluar dari grup itu. {mood}',
      fail: 'Gagal keluar, Master: {error}',
    },
  },
  en: {
    leave: {
      hint: 'Use this inside a group, or mention the group JID, Master: .leave 120363xxx@g.us',
      done: 'Done, Master~ KANA left that group. {mood}',
      fail: 'Failed to leave, Master: {error}',
    },
  },
}

export const test = { input: '.leave', expect: /grup|group/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const target = arg.endsWith('@g.us') ? arg : ctx.isGroup ? ctx.chat : null
  if (!target) return ctx.reply(ctx.t('leave.hint'))
  try {
    await ctx.sock.groupLeave(target)
    if (target !== ctx.chat) return ctx.reply(ctx.t('leave.done', { mood: ctx.say('sukses') }))
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('leave.fail', { error: err.message }))
  }
}
