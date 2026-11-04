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
      usage: '╭─❏ ⌨️ 「 *CUSTOM COMMAND* 」\n┊ Pakai: *.customcmd add <pemicu> = <balasan>*\n┊ *.customcmd del <pemicu>* atau *.customcmd list* yaa~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🔒 「 *KHUSUS ADMIN* 」\n┊ Kelola custom command grup cuma buat admin grup yaa~\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *COMMAND DISIMPAN* 」\n┊ Custom command *{trigger}* disimpan~\n┊ Ketik persis *{trigger}* di grup buat coba yaa~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *COMMAND DIHAPUS* 」\n┊ Custom command *{trigger}* udah KANA hapus yaa~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *COMMAND TIDAK KETEMU* 」\n┊ Custom command *{trigger}* nggak ditemukan nih~\n╰━━━━━━━',
      empty: '╭─❏ ⌨️ 「 *CUSTOM COMMAND GRUP* 」\n┊ Belum ada custom command di grup ini~\n╰━━━━━━━',
      list: '╭─❏ ⌨️ 「 *CUSTOM COMMAND GRUP* 」\n┊ {lines}\n╰━━━━━━━',
      line: '*{trigger}* -> {reply}',
      invalid: '╭─❏ ⚠️ 「 *FORMATNYA SALAH* 」\n┊ Formatnya: *.customcmd add <pemicu> = <balasan>*\n┊ Tanda sama dengan wajib ada yaa~\n╰━━━━━━━',
    },
  },
  en: {
    customcmd: {
      usage: '╭─❏ ⌨️ 「 *CUSTOM COMMAND* 」\n┊ Use: *.customcmd add <trigger> = <reply>*\n┊ *.customcmd del <trigger>* or *.customcmd list*~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🔒 「 *ADMINS ONLY* 」\n┊ Managing group custom commands is for group admins only~\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *COMMAND SAVED* 」\n┊ Custom command *{trigger}* saved~\n┊ Type exactly *{trigger}* in the group to try it~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *COMMAND DELETED* 」\n┊ Custom command *{trigger}* has been deleted~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *COMMAND NOT FOUND* 」\n┊ Custom command *{trigger}* was not found~\n╰━━━━━━━',
      empty: '╭─❏ ⌨️ 「 *GROUP CUSTOM COMMANDS* 」\n┊ No custom commands in this group yet~\n╰━━━━━━━',
      list: '╭─❏ ⌨️ 「 *GROUP CUSTOM COMMANDS* 」\n┊ {lines}\n╰━━━━━━━',
      line: '*{trigger}* -> {reply}',
      invalid: '╭─❏ ⚠️ 「 *WRONG FORMAT* 」\n┊ Format: *.customcmd add <trigger> = <reply>*\n┊ The equals sign is required~\n╰━━━━━━━',
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
    const lines = entries.map(([trigger, reply]) => ctx.t('customcmd.line', { trigger, reply })).join('\n┊ ')
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
