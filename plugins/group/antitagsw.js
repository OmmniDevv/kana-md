
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antitagsw",
  alias: [],
  category: "group",
  description: { id: "Mengaktifkan/menonaktifkan anti tag status di grup", en: "KANA version of the Elaina-MD antitagsw feature, rewritten in KANA style" },
  usage: ".antitagsw",
  example: ".antitagsw",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antitagsw": {
      changed: "╭─❏ 🛡️ 「 *ANTITAGSW* 」\n┊ Siap~ *antitagsw* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTITAGSW* 」\n┊ Pakai: *.antitagsw on* atau *.antitagsw off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antitagsw": {
      changed: "╭─❏ 🛡️ 「 *ANTITAGSW* 」\n┊ Got it~ *antitagsw* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTITAGSW* 」\n┊ Use: *.antitagsw on* or *.antitagsw off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antitagsw"
export const test = { input: '.antitagsw', expect: /antitagsw|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antitagsw.usage', { state: ctx.t(settings[KEY] ? 'antitagsw.on' : 'antitagsw.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antitagsw.changed', { state: ctx.t(value ? 'antitagsw.on' : 'antitagsw.off'), mood: ctx.say('senang') }))
}
