import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'listadmin',
  alias: ['adminlist'],
  category: 'group',
  description: { id: 'Daftar admin grup ini', en: 'List the admins of this group' },
  usage: '.listadmin',
  example: '.listadmin',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    listadmin: {
      title: '👑 DAFTAR ADMIN GRUP ({count})\n\n{list}',
      superadmin: ' (pemilik)',
      empty: 'Grup ini belum punya admin yang tercatat. {mood}',
      fail: 'Gagal ambil data grup: {error}',
    },
  },
  en: {
    listadmin: {
      title: '👑 GROUP ADMIN LIST ({count})\n\n{list}',
      superadmin: ' (owner)',
      empty: 'This group has no recorded admins yet. {mood}',
      fail: 'Failed to get group data: {error}',
    },
  },
}

export const test = { input: '.listadmin', expect: /admin/i }

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('listadmin.fail', { error: err.message })) }
  }
  const admins = (meta?.participants ?? []).filter((p) => p.admin)
  if (!admins.length) return ctx.reply(ctx.t('listadmin.empty', { mood: ctx.say('malu') }))
  const mentions = admins.map((p) => p.id).filter(Boolean)
  const list = admins.map((p, i) => `${i + 1}. @${digitsOf(p.id)}${p.admin === 'superadmin' ? ctx.t('listadmin.superadmin') : ''}`).join('\n')
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('listadmin.title', { count: admins.length, list }), mentions }, { quoted: ctx.raw })
}
