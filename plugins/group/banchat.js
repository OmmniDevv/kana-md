import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'banchat',
  alias: [],
  category: 'group',
  description: { id: 'Ban grup dari penggunaan bot; bot diam total di grup ini kecuali untuk owner', en: 'Ban a group from using the bot; the bot stays fully silent in this group except for the owner' },
  usage: '.banchat atau .banchat off',
  example: '.banchat',
  cooldown: 3,
  isGroup: true,
  isOwner: true,
  priority: 15,
}

export const i18n = {
  id: {
    banchat: {
      banned: '╭─❏ 🚫 「 *GRUP DIBAN* 」\n┊ Siap~ grup ini KANA *ban* dari penggunaan bot~\n┊ KANA bakal diam total di sini, kecuali owner~\n┊ Buka lagi dengan *.banchat off* yaa~\n╰━━━━━━━ {mood}',
      unbanned: '╭─❏ ✅ 「 *BAN GRUP DIBUKA* 」\n┊ Siap~ ban grup ini udah KANA buka~\n┊ Semua member bisa pakai KANA lagi di sini~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🚫 「 *SUDAH DIBAN* 」\n┊ Grup ini memang lagi KANA ban~\n┊ Buka dengan *.banchat off* yaa~\n╰━━━━━━━',
    },
  },
  en: {
    banchat: {
      banned: '╭─❏ 🚫 「 *GROUP BANNED* 」\n┊ Got it~ this group is *banned* from using the bot~\n┊ KANA will stay fully silent here, except for the owner~\n┊ Lift it with *.banchat off*~\n╰━━━━━━━ {mood}',
      unbanned: '╭─❏ ✅ 「 *GROUP BAN LIFTED* 」\n┊ Got it~ this group ban has been lifted~\n┊ Everyone can use KANA here again~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🚫 「 *ALREADY BANNED* 」\n┊ This group is already banned~\n┊ Lift it with *.banchat off*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.banchat', expect: /GRUP DIBAN|GROUP BANNED/ }

export async function handler(ctx) {
  const arg = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (arg === 'off') {
    if (!settings.banchat) return ctx.reply(ctx.t('banchat.unbanned', { mood: ctx.say('senang') }))
    await updateGroupSettings(ctx.storage, ctx.chat, { banchat: false })
    return ctx.reply(ctx.t('banchat.unbanned', { mood: ctx.say('senang') }))
  }
  if (settings.banchat) return ctx.reply(ctx.t('banchat.already'))
  await updateGroupSettings(ctx.storage, ctx.chat, { banchat: true })
  return ctx.reply(ctx.t('banchat.banned', { mood: ctx.say('senang') }))
}

// Penegakan ban: selama grup diban, semua pesan non-owner dihentikan di
// sini sehingga tidak ada perintah atau hook lain yang merespons. Owner
// selalu lolos supaya bisa membuka ban dengan .banchat off.
export async function before(ctx) {
  if (!ctx.isGroup || ctx.isOwner) return
  let settings
  try {
    settings = await getGroupSettings(ctx.storage, ctx.chat)
  } catch {
    return
  }
  if (settings.banchat) return false
}
