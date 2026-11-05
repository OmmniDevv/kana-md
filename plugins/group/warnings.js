import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'
import { resolveTargetsToPhone } from '../../src/services/group-members.js'

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
      empty: '╭─❏ 🌸 「 *DAFTAR WARN GRUP* 」\n┊ Belum ada yang punya warn di grup ini~\n┊ Aman, KANA seneng~\n╰━━━━━━━ {mood}',
      list: '╭─❏ ⚠️ 「 *DAFTAR WARN GRUP* 」\n┊ {lines}\n╰━━━━━━━',
      line: '*@{digits}*: *{count}/{limit}* warn',
      one: '╭─❏ ⚠️ 「 *WARN MEMBER* 」\n┊ *@{digits}* punya *{count}/{limit}* warn~\n╰━━━━━━━',
      reset: '╭─❏ ✅ 「 *WARN DIRESET* 」\n┊ Warn *@{digits}* udah KANA reset jadi *0* yaa~\n╰━━━━━━━',
      resetNoTarget: '╭─❏ ❓ 「 *RESET WARN SIAPA?* 」\n┊ Mention member grupnya atau tulis nomornya yaa~\n╰━━━━━━━',
      resetDenied: '╭─❏ 🔒 「 *KHUSUS ADMIN* 」\n┊ Reset warn cuma buat admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    warnings: {
      empty: '╭─❏ 🌸 「 *GROUP WARNINGS LIST* 」\n┊ Nobody has warnings in this group yet~\n┊ Peaceful, KANA is happy~\n╰━━━━━━━ {mood}',
      list: '╭─❏ ⚠️ 「 *GROUP WARNINGS LIST* 」\n┊ {lines}\n╰━━━━━━━',
      line: '*@{digits}*: *{count}/{limit}* warns',
      one: '╭─❏ ⚠️ 「 *MEMBER WARNINGS* 」\n┊ *@{digits}* has *{count}/{limit}* warns~\n╰━━━━━━━',
      reset: '╭─❏ ✅ 「 *WARNINGS RESET* 」\n┊ Warnings for *@{digits}* have been reset to *0*~\n╰━━━━━━━',
      resetNoTarget: '╭─❏ ❓ 「 *RESET WHOSE WARNINGS?* 」\n┊ Mention the group member or write their number~\n╰━━━━━━━',
      resetDenied: '╭─❏ 🔒 「 *ADMINS ONLY* 」\n┊ Resetting warnings is for group admins only~\n╰━━━━━━━',
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
    const targets = await resolveTargetsToPhone(ctx, resolveTargetJids({ ...ctx, args: ctx.args.slice(1) }))
    if (!targets.length) return ctx.reply(ctx.t('warnings.resetNoTarget'))
    const digits = digitsOf(targets[0])
    const warns = { ...(settings.warns ?? {}) }
    delete warns[digits]
    await updateGroupSettings(ctx.storage, ctx.chat, { warns })
    return ctx.sock.sendMessage(ctx.chat, { text: ctx.t('warnings.reset', { digits }), mentions: [targets[0]] }, { quoted: ctx.raw })
  }
  const targets = await resolveTargetsToPhone(ctx, resolveTargetJids(ctx))
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
  const lines = entries.map(([digits, count]) => ctx.t('warnings.line', { digits, count, limit: settings.warnLimit })).join('\n┊ ')
  const mentions = entries.map(([digits]) => `${digits}@s.whatsapp.net`)
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('warnings.list', { lines }), mentions }, { quoted: ctx.raw })
}
