import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'resetwarn',
  alias: ['hapuswarn'],
  category: 'group',
  description: { id: 'Reset warn satu member (mention) atau semua member grup (admin)', en: 'Reset warns of one member (mention) or all group members (admin)' },
  usage: '.resetwarn [@user atau all]',
  example: '.resetwarn @6281234567890',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    resetwarn: {
      one: '✅ Warn @{digits} sudah direset ke 0. Kesempatan baru yaa, jangan diulangi~ {mood}',
      all: '✅ Semua warn di grup ini sudah direset. Mulai dari nol lagi yaa semuanya~ {mood}',
      notFound: '@{digits} tidak punya warn tercatat di grup ini. {mood}',
      empty: 'Tidak ada warn tercatat di grup ini kok. {mood}',
    },
  },
  en: {
    resetwarn: {
      one: '✅ Warns of @{digits} reset to 0. A fresh chance, do not repeat it~ {mood}',
      all: '✅ All warns in this group have been reset. Starting from zero everyone~ {mood}',
      notFound: '@{digits} has no recorded warns in this group. {mood}',
      empty: 'No warns recorded in this group. {mood}',
    },
  },
}

export const test = { input: '.resetwarn', expect: /warn/i }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const warns = { ...(settings.warns ?? {}) }
  const arg = (ctx.text || '').trim().toLowerCase()
  const target = ctx.mentionedJids?.[0]
  if (target) {
    const digits = digitsOf(target)
    if (!warns[digits]) return ctx.reply(ctx.t('resetwarn.notFound', { digits, mood: ctx.say('malu') }))
    delete warns[digits]
    await updateGroupSettings(ctx.storage, ctx.chat, { warns })
    return ctx.reply(ctx.t('resetwarn.one', { digits, mood: ctx.say('sukses') }))
  }
  if (arg === 'all' || arg === 'semua') {
    await updateGroupSettings(ctx.storage, ctx.chat, { warns: {} })
    return ctx.reply(ctx.t('resetwarn.all', { mood: ctx.say('sukses') }))
  }
  if (!Object.keys(warns).length) return ctx.reply(ctx.t('resetwarn.empty', { mood: ctx.say('senang') }))
  return ctx.reply(ctx.t('resetwarn.empty', { mood: ctx.say('senang') }))
}
