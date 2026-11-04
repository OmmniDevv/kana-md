import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'tagadmin',
  alias: ['panggiladmin'],
  category: 'group',
  description: { id: 'Tag semua admin grup, buat laporan atau minta bantuan', en: 'Tag all group admins, for reports or asking help' },
  usage: '.tagadmin [pesan]',
  example: '.tagadmin ada spam nih',
  cooldown: 10,
  isGroup: true,
}

export const i18n = {
  id: {
    tagadmin: {
      body: '╭─❏ 👑 「 *MEMANGGIL ADMIN GRUP* 」\n┊ {message}\n┊ {list}\n╰━━━━━━━',
      defaultMessage: 'Ada yang butuh bantuan admin nih~',
      empty: '╭─❏ 👑 「 *MEMANGGIL ADMIN GRUP* 」\n┊ Grup ini belum punya admin yang tercatat~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL DATA* 」\n┊ Gagal ambil data grup: {error}\n╰━━━━━━━',
    },
  },
  en: {
    tagadmin: {
      body: '╭─❏ 👑 「 *CALLING GROUP ADMINS* 」\n┊ {message}\n┊ {list}\n╰━━━━━━━',
      defaultMessage: 'Someone needs admin help~',
      empty: '╭─❏ 👑 「 *CALLING GROUP ADMINS* 」\n┊ This group has no recorded admins yet~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO GET DATA* 」\n┊ Failed to get group data: {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tagadmin', expect: /admin/i }

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('tagadmin.fail', { error: err.message })) }
  }
  const admins = (meta?.participants ?? []).filter((p) => p.admin)
  if (!admins.length) return ctx.reply(ctx.t('tagadmin.empty', { mood: ctx.say('malu') }))
  const mentions = admins.map((p) => p.id).filter(Boolean)
  const list = admins.map((p) => `@${digitsOf(p.id)}`).join(' ')
  const message = (ctx.text || '').trim() || ctx.t('tagadmin.defaultMessage')
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('tagadmin.body', { message, list }), mentions }, { quoted: ctx.raw })
}
