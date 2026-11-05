
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antiflood",
  alias: [],
  category: "group",
  description: { id: "Deteksi banjir pesan cepat dan kick bertahap", en: "KANA version of the Elaina-MD antiflood feature, rewritten in KANA style" },
  usage: ".antiflood",
  example: ".antiflood",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antiflood": {
      changed: "╭─❏ 🛡️ 「 *ANTIFLOOD* 」\n┊ Siap~ *antiflood* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIFLOOD* 」\n┊ Pakai: *.antiflood on* atau *.antiflood off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antiflood": {
      changed: "╭─❏ 🛡️ 「 *ANTIFLOOD* 」\n┊ Got it~ *antiflood* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIFLOOD* 」\n┊ Use: *.antiflood on* or *.antiflood off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antiflood"
// Penegakan antiflood hidup di before hook plugins/group/guard.js
// (settings.antiflood dibaca di sana, pesan banjir dihapus). Plugin ini
// hanya sakelar setelan per grupnya, pola antilink.
export const test = { input: '.antiflood', expect: /antiflood|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antiflood.usage', { state: ctx.t(settings[KEY] ? 'antiflood.on' : 'antiflood.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antiflood.changed', { state: ctx.t(value ? 'antiflood.on' : 'antiflood.off'), mood: ctx.say('senang') }))
}
