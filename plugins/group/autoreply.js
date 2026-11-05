import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'autoreply',
  alias: [],
  category: 'group',
  description: { id: 'Mengatur autoreply/smart triggers per grup (pemicu yang sama dengan .customcmd)', en: 'Manage per-group autoreply/smart triggers (same triggers as .customcmd)' },
  usage: '.autoreply <on|off|list|add <pemicu> = <balasan>|del <pemicu>>',
  example: '.autoreply add halo = Halo juga~',
  cooldown: 3,
  isGroup: true,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    autoreply: {
      usage: '╭─❏ 💬 「 *AUTOREPLY GRUP* 」\n┊ Status: *{state}* ({count} pemicu)\n┊ *.autoreply on/off* buat nyala/matikan\n┊ *.autoreply add <pemicu> = <balasan>*\n┊ *.autoreply del <pemicu>* / *.autoreply list*\n╰━━━━━━━',
      changed: '╭─❏ 💬 「 *AUTOREPLY GRUP* 」\n┊ Siap~ *autoreply* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      adminOnly: '╭─❏ 🔒 「 *KHUSUS ADMIN* 」\n┊ Mengatur autoreply grup cuma buat admin grup yaa~\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *PEMICU DISIMPAN* 」\n┊ Autoreply *{trigger}* disimpan~\n┊ Ketik persis *{trigger}* di grup buat coba yaa~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *PEMICU DIHAPUS* 」\n┊ Autoreply *{trigger}* udah KANA hapus yaa~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PEMICU TIDAK KETEMU* 」\n┊ Autoreply *{trigger}* nggak ditemukan nih~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *FORMATNYA SALAH* 」\n┊ Formatnya: *.autoreply add <pemicu> = <balasan>*\n┊ Tanda sama dengan wajib ada yaa~\n╰━━━━━━━',
      empty: '╭─❏ 💬 「 *AUTOREPLY GRUP* 」\n┊ Belum ada pemicu autoreply di grup ini~\n┊ Tambah pakai *.autoreply add <pemicu> = <balasan>*\n╰━━━━━━━',
      list: '╭─❏ 💬 「 *AUTOREPLY GRUP* 」\n┊ Status: *{state}*\n┊ {lines}\n╰━━━━━━━',
      line: '*{trigger}* -> {reply}',
    },
  },
  en: {
    autoreply: {
      usage: '╭─❏ 💬 「 *GROUP AUTOREPLY* 」\n┊ Status: *{state}* ({count} triggers)\n┊ *.autoreply on/off* to turn on or off\n┊ *.autoreply add <trigger> = <reply>*\n┊ *.autoreply del <trigger>* / *.autoreply list*\n╰━━━━━━━',
      changed: '╭─❏ 💬 「 *GROUP AUTOREPLY* 」\n┊ Got it~ *autoreply* is now *{state}* in this group~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      adminOnly: '╭─❏ 🔒 「 *ADMINS ONLY* 」\n┊ Managing group autoreply is for group admins only~\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *TRIGGER SAVED* 」\n┊ Autoreply *{trigger}* saved~\n┊ Type exactly *{trigger}* in the group to try it~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *TRIGGER DELETED* 」\n┊ Autoreply *{trigger}* has been deleted~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TRIGGER NOT FOUND* 」\n┊ Autoreply *{trigger}* was not found~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *WRONG FORMAT* 」\n┊ Format: *.autoreply add <trigger> = <reply>*\n┊ The equals sign is required~\n╰━━━━━━━',
      empty: '╭─❏ 💬 「 *GROUP AUTOREPLY* 」\n┊ No autoreply triggers in this group yet~\n┊ Add one with *.autoreply add <trigger> = <reply>*\n╰━━━━━━━',
      list: '╭─❏ 💬 「 *GROUP AUTOREPLY* 」\n┊ Status: *{state}*\n┊ {lines}\n╰━━━━━━━',
      line: '*{trigger}* -> {reply}',
    },
  },
}

export const test = { input: '.autoreply add tesbalasan = Balasan otomatis nyala', expect: /PEMICU DISIMPAN|TRIGGER SAVED/ }

// Autoreply dan .customcmd berbagi data pemicu yang sama
// (settings.customCommands). Yang diatur di sini: saklar aktif grup
// (settings.autoreply, dihormati hook customcmd) plus kelola pemicunya.
export async function handler(ctx) {
  const sub = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const commands = { ...(settings.customCommands ?? {}) }
  const stateText = () => ctx.t(settings.autoreply === false ? 'autoreply.off' : 'autoreply.on')
  const needAdmin = () => (ctx.isAdmin || ctx.isOwner ? null : ctx.reply(ctx.t('autoreply.adminOnly')))

  if (sub === 'list') {
    const entries = Object.entries(commands)
    if (!entries.length) return ctx.reply(ctx.t('autoreply.empty'))
    const lines = entries.map(([trigger, reply]) => ctx.t('autoreply.line', { trigger, reply })).join('\n┊ ')
    return ctx.reply(ctx.t('autoreply.list', { lines, state: stateText() }))
  }
  if (sub === 'on' || sub === 'off') {
    const denied = needAdmin()
    if (denied) return denied
    const value = sub === 'on'
    await updateGroupSettings(ctx.storage, ctx.chat, { autoreply: value })
    return ctx.reply(ctx.t('autoreply.changed', { state: ctx.t(value ? 'autoreply.on' : 'autoreply.off'), mood: ctx.say('senang') }))
  }
  if (sub === 'del') {
    const denied = needAdmin()
    if (denied) return denied
    const trigger = ctx.args.slice(1).join(' ').trim().toLowerCase()
    if (!trigger || !commands[trigger]) return ctx.reply(ctx.t('autoreply.notFound', { trigger: trigger || '' }))
    delete commands[trigger]
    await updateGroupSettings(ctx.storage, ctx.chat, { customCommands: commands })
    return ctx.reply(ctx.t('autoreply.deleted', { trigger }))
  }
  if (sub === 'add') {
    const denied = needAdmin()
    if (denied) return denied
    const rest = ctx.text.replace(/^add\s+/i, '')
    const idx = rest.indexOf('=')
    if (idx < 1) return ctx.reply(ctx.t('autoreply.invalid'))
    const trigger = rest.slice(0, idx).trim().toLowerCase()
    const replyText = rest.slice(idx + 1).trim()
    if (!trigger || !replyText) return ctx.reply(ctx.t('autoreply.invalid'))
    commands[trigger] = replyText
    await updateGroupSettings(ctx.storage, ctx.chat, { customCommands: commands })
    return ctx.reply(ctx.t('autoreply.added', { trigger }))
  }
  return ctx.reply(ctx.t('autoreply.usage', { state: stateText(), count: Object.keys(commands).length }))
}
