import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

export const config = {
  name: 'warnings',
  alias: ['warnlist'],
  category: 'group',
  description: { id: 'Lihat daftar warn grup', en: 'Show group warnings list' },
  usage: '.warnings [@user] atau .warnings reset @user',
  example: '.warnings',
  cooldown: 3,
  isGroup: true,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    warnings: {
      empty: 'Belum ada yang punya warn di grup ini. Aman, KANA seneng~ {mood}',
      list: 'Daftar warn grup:\n{lines}',
      line: '@{digits}: {count}/{limit} warn',
      one: '@{digits} punya {count}/{limit} warn.',
      reset: 'Warn @{digits} udah KANA reset jadi 0 yaa~',
      resetNoTarget: 'Reset warn siapa? Mention atau tulis nomornya yaa~',
      resetDenied: 'Reset warn cuma buat admin grup yaa~',
    },
  },
  en: {
    warnings: {
      empty: 'Nobody has warnings in this group yet. Peaceful, KANA is happy~ {mood}',
      list: 'Group warnings list:\n{lines}',
      line: '@{digits}: {count}/{limit} warns',
      one: '@{digits} has {count}/{limit} warns.',
      reset: 'Warnings for @{digits} have been reset to 0~',
      resetNoTarget: 'Reset whose warnings? Mention them or write their number~',
      resetDenied: 'Resetting warnings is for group admins only~',
    },
  },
}

export const test = { input: '.warnings', expect: /grup|group/i }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if ((ctx.args[0] || '').toLowerCase() === 'reset') {
    if (!ctx.isAdmin) return ctx.reply(ctx.t('warnings.resetDenied'))
    // isAdmin di ctx terisi bila gates membutuhkan; bila kosong, pipeline
    // dengan needsAdminInfo tidak dipakai di sini, jadi cek lewat metadata.
    const targets = resolveTargetJids({ ...ctx, args: ctx.args.slice(1) })
    if (!targets.length) return ctx.reply(ctx.t('warnings.resetNoTarget'))
    const digits = digitsOf(targets[0])
    const warns = { ...(settings.warns ?? {}) }
    delete warns[digits]
    await updateGroupSettings(ctx.storage, ctx.chat, { warns })
    return ctx.sock.sendMessage(ctx.chat, { text: ctx.t('warnings.reset', { digits }), mentions: [targets[0]] }, { quoted: ctx.raw })
  }
  const targets = resolveTargetJids(ctx)
  if (targets.length) {
    const digits = digitsOf(targets[0])
    const count = Number(settings.warns?.[digits]) || 0
    return ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('warnings.one', { digits, count, limit: settings.warnLimit }),
      mentions: [targets[0]],
    }, { quoted: ctx.raw })
  }
  const entries = Object.entries(settings.warns ?? {}).filter(([, v]) => Number(v) > 0)
  if (!entries.length) return ctx.reply(ctx.t('warnings.empty', { mood: ctx.say('senang') }))
  const lines = entries.map(([digits, count]) => ctx.t('warnings.line', { digits, count, limit: settings.warnLimit })).join('\n')
  const mentions = entries.map(([digits]) => `${digits}@s.whatsapp.net`)
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('warnings.list', { lines }), mentions }, { quoted: ctx.raw })
}
