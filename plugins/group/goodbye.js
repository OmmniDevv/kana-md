import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { getGroupText } from '../../src/services/group-settings.js'

export const config = {
  name: 'goodbye',
  alias: [],
  category: 'group',
  description: { id: 'Tampilkan status dan teks goodbye grup saat ini, atau nyalakan/matikan pesan goodbye', en: 'Show the current group goodbye status and text, or turn the goodbye message on/off' },
  usage: '.goodbye atau .goodbye <on|off>',
  example: '.goodbye',
  cooldown: 3,
  isGroup: true,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    goodbye: {
      status: '╭─❏ 👋 「 *GOODBYE GRUP* 」\n┊ ꜱᴛᴀᴛᴜꜱ: *{state}*\n┊ ᴛᴇᴋꜱ ꜱᴇᴋᴀʀᴀɴɢ:\n┊ {text}\n┊ Ubah teks: *.setgoodbye <teks>*\n┊ Placeholder: {user} {group} {count}\n╰━━━━━━━ {mood}',
      changed: '╭─❏ 👋 「 *GOODBYE DIUBAH* 」\n┊ Siap~ pesan goodbye grup ini sekarang *{state}*~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      adminOnly: '╭─❏ 🔒 「 *KHUSUS ADMIN* 」\n┊ Mengubah status goodbye grup cuma buat admin grup yaa~\n╰━━━━━━━',
    },
  },
  en: {
    goodbye: {
      status: '╭─❏ 👋 「 *GROUP GOODBYE* 」\n┊ ꜱᴛᴀᴛᴜꜱ: *{state}*\n┊ ᴄᴜʀʀᴇɴᴛ ᴛᴇxᴛ:\n┊ {text}\n┊ Change the text: *.setgoodbye <text>*\n┊ Placeholders: {user} {group} {count}\n╰━━━━━━━ {mood}',
      changed: '╭─❏ 👋 「 *GOODBYE CHANGED* 」\n┊ Got it~ this group goodbye message is now *{state}*~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      adminOnly: '╭─❏ 🔒 「 *ADMINS ONLY* 」\n┊ Changing the group goodbye status is for group admins only~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.goodbye', expect: /GOODBYE GRUP|GROUP GOODBYE/ }

// Perintah .goodbye: pengelola pesan perpisahan grup (status + teks yang
// sedang berlaku). Pengiriman pesannya sendiri terjadi di event keluar
// member pada welcome.js, bukan di sini.
export async function handler(ctx) {
  const arg = (ctx.args[0] || '').toLowerCase()
  if (arg === 'on' || arg === 'off') {
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply(ctx.t('goodbye.adminOnly'))
    const value = arg === 'on'
    await updateGroupSettings(ctx.storage, ctx.chat, { goodbye: value })
    return ctx.reply(ctx.t('goodbye.changed', { state: ctx.t(value ? 'goodbye.on' : 'goodbye.off'), mood: ctx.say('senang') }))
  }
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const text = await getGroupText(ctx.storage, ctx.chat, 'goodbye')
  return ctx.reply(ctx.t('goodbye.status', {
    state: ctx.t(settings.goodbye ? 'goodbye.on' : 'goodbye.off'),
    text,
    mood: ctx.say('senang'),
  }))
}
