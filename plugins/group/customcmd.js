import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'customcmd',
  alias: ['addcmd'],
  category: 'group',
  description: { id: 'Kelola perintah kustom grup', en: 'Manage custom group commands' },
  usage: '.customcmd add <pemicu> = <balasan> | del <pemicu> | list',
  example: '.customcmd add halo = Halo juga, {name}~',
  cooldown: 3,
  isGroup: true,
  needsAdminInfo: true,
  priority: 40,
}

export const i18n = {
  id: {
    customcmd: {
      usage: 'Pakai: .customcmd add <pemicu> = <balasan>, .customcmd del <pemicu>, atau .customcmd list yaa~',
      adminOnly: 'Kelola custom command cuma buat admin grup yaa~',
      added: 'Siap~ custom command "{trigger}" disimpan. Ketik persis "{trigger}" di grup buat coba yaa~',
      deleted: 'Custom command "{trigger}" udah KANA hapus yaa~',
      notFound: 'Custom command "{trigger}" nggak ditemukan nih~',
      empty: 'Belum ada custom command di grup ini~',
      list: 'Custom command grup ini:\n{lines}',
      line: '"{trigger}" -> {reply}',
      invalid: 'Formatnya: .customcmd add <pemicu> = <balasan>. Tanda sama dengan wajib ada yaa~',
    },
  },
  en: {
    customcmd: {
      usage: 'Use: .customcmd add <trigger> = <reply>, .customcmd del <trigger>, or .customcmd list~',
      adminOnly: 'Managing custom commands is for group admins only~',
      added: 'Got it~ custom command "{trigger}" saved. Type exactly "{trigger}" in the group to try it~',
      deleted: 'Custom command "{trigger}" has been deleted~',
      notFound: 'Custom command "{trigger}" was not found~',
      empty: 'No custom commands in this group yet~',
      list: 'Custom commands of this group:\n{lines}',
      line: '"{trigger}" -> {reply}',
      invalid: 'Format: .customcmd add <trigger> = <reply>. The equals sign is required~',
    },
  },
}

export const test = { input: '.customcmd list', expect: /grup|group/i }

export async function handler(ctx) {
  const sub = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const commands = { ...(settings.customCommands ?? {}) }

  if (sub === 'list') {
    const entries = Object.entries(commands)
    if (!entries.length) return ctx.reply(ctx.t('customcmd.empty'))
    const lines = entries.map(([trigger, reply]) => ctx.t('customcmd.line', { trigger, reply })).join('\n')
    return ctx.reply(ctx.t('customcmd.list', { lines }))
  }

  if (sub === 'add' || sub === 'del') {
    if (!ctx.isAdmin) return ctx.reply(ctx.t('customcmd.adminOnly'))
    if (sub === 'del') {
      const trigger = ctx.args.slice(1).join(' ').trim().toLowerCase()
      if (!trigger || !commands[trigger]) return ctx.reply(ctx.t('customcmd.notFound', { trigger: trigger || '' }))
      delete commands[trigger]
      await updateGroupSettings(ctx.storage, ctx.chat, { customCommands: commands })
      return ctx.reply(ctx.t('customcmd.deleted', { trigger }))
    }
    const rest = ctx.text.replace(/^add\s+/i, '')
    const idx = rest.indexOf('=')
    if (idx < 1) return ctx.reply(ctx.t('customcmd.invalid'))
    const trigger = rest.slice(0, idx).trim().toLowerCase()
    const replyText = rest.slice(idx + 1).trim()
    if (!trigger || !replyText) return ctx.reply(ctx.t('customcmd.invalid'))
    commands[trigger] = replyText
    await updateGroupSettings(ctx.storage, ctx.chat, { customCommands: commands })
    return ctx.reply(ctx.t('customcmd.added', { trigger }))
  }

  return ctx.reply(ctx.t('customcmd.usage'))
}

export async function before(ctx) {
  if (!ctx.isGroup || !ctx.text) return
  if (/^[.!/#]/.test(ctx.text.trim())) return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const commands = settings.customCommands ?? {}
  const trigger = ctx.text.trim().toLowerCase()
  const replyText = commands[trigger]
  if (!replyText) return
  const name = ctx.pushName || ctx.senderDigits || ''
  await ctx.sock.sendMessage(ctx.chat, { text: String(replyText).replaceAll('{name}', name) })
  return false
}
