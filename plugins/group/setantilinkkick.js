import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'setantilinkkick',
  alias: [],
  category: 'group',
  description: { id: 'Mengubah aksi antilink grup: warn bertahap atau kick langsung saat member mengirim link', en: 'Set the group antilink action: gradual warns or instant kick when a member sends a link' },
  usage: '.setantilinkkick <kick|warn>',
  example: '.setantilinkkick kick',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    setantilinkkick: {
      status: '╭─❏ 🚫 「 *AKSI ANTILINK* 」\n┊ ᴀɴᴛɪʟɪɴᴋ: *{antilink}*\n┊ ᴀᴋꜱɪ ꜱᴇᴋᴀʀᴀɴɢ: *{action}*\n┊ ᴡᴀʀɴ: link dihapus dan diberi warn sampai batas\n┊ ᴋɪᴄᴋ: link pertama langsung dikeluarkan\n┊ Ubah: *.setantilinkkick kick* atau *.setantilinkkick warn*\n╰━━━━━━━',
      changed: '╭─❏ 🚫 「 *AKSI ANTILINK DIUBAH* 」\n┊ Siap~ aksi antilink grup ini sekarang *{action}*~\n┊ {note}\n╰━━━━━━━ {mood}',
      kickLabel: 'KICK LANGSUNG',
      warnLabel: 'WARN BERTAHAP',
      noteKick: 'Member yang ngirim link langsung KANA keluarkan, tanpa nunggu batas warn~',
      noteWarn: 'Member yang ngirim link KANA hapus pesannya dan diberi warn sampai batas~',
      on: 'AKTIF', off: 'mati',
      invalid: '╭─❏ ⚠️ 「 *AKSI TIDAK VALID* 」\n┊ Aksi *{action}* nggak dikenal~\n┊ ᴘɪʟɪʜᴀɴ: *kick* atau *warn*\n╰━━━━━━━',
    },
  },
  en: {
    setantilinkkick: {
      status: '╭─❏ 🚫 「 *ANTILINK ACTION* 」\n┊ ᴀɴᴛɪʟɪɴᴋ: *{antilink}*\n┊ ᴄᴜʀʀᴇɴᴛ ᴀᴄᴛɪᴏɴ: *{action}*\n┊ ᴡᴀʀɴ: link deleted and warned up to the limit\n┊ ᴋɪᴄᴋ: first link gets removed instantly\n┊ Change: *.setantilinkkick kick* or *.setantilinkkick warn*\n╰━━━━━━━',
      changed: '╭─❏ 🚫 「 *ANTILINK ACTION CHANGED* 」\n┊ Got it~ this group antilink action is now *{action}*~\n┊ {note}\n╰━━━━━━━ {mood}',
      kickLabel: 'INSTANT KICK',
      warnLabel: 'GRADUAL WARN',
      noteKick: 'Members who send a link are removed right away, no warn limit wait~',
      noteWarn: 'Members who send a link get the message deleted and warned up to the limit~',
      on: 'ON', off: 'off',
      invalid: '╭─❏ ⚠️ 「 *INVALID ACTION* 」\n┊ Action *{action}* is unknown~\n┊ ᴏᴘᴛɪᴏɴꜱ: *kick* or *warn*\n╰━━━━━━━',
    },
  },
}

const ACTIONS = ['kick', 'warn']

export const test = { input: '.setantilinkkick kick', expect: /AKSI ANTILINK DIUBAH[\s\S]*KICK|ANTILINK ACTION CHANGED[\s\S]*KICK/ }

// Pengaturan aksi ini dibaca guard.js: 'warn' memakai jalur warn
// bertahap lama, 'kick' mengeluarkan pengirim link pada pelanggaran
// pertama.
export async function handler(ctx) {
  const raw = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const label = (action) => ctx.t(action === 'kick' ? 'setantilinkkick.kickLabel' : 'setantilinkkick.warnLabel')
  if (!raw) {
    return ctx.reply(ctx.t('setantilinkkick.status', {
      antilink: ctx.t(settings.antilink ? 'setantilinkkick.on' : 'setantilinkkick.off'),
      action: label(settings.antilinkAction === 'kick' ? 'kick' : 'warn'),
    }))
  }
  if (!ACTIONS.includes(raw)) return ctx.reply(ctx.t('setantilinkkick.invalid', { action: raw }))
  await updateGroupSettings(ctx.storage, ctx.chat, { antilinkAction: raw })
  return ctx.reply(ctx.t('setantilinkkick.changed', {
    action: label(raw),
    note: ctx.t(raw === 'kick' ? 'setantilinkkick.noteKick' : 'setantilinkkick.noteWarn'),
    mood: ctx.say('senang'),
  }))
}
