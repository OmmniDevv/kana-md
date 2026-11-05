
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antidana",
  alias: [],
  category: "group",
  description: { id: "Fitur antidana versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD antidana feature, rewritten in KANA style" },
  usage: ".antidana",
  example: ".antidana",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antidana": {
      changed: "╭─❏ 🛡️ 「 *ANTIDANA* 」\n┊ Siap~ *antidana* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIDANA* 」\n┊ Pakai: *.antidana on* atau *.antidana off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antidana": {
      changed: "╭─❏ 🛡️ 「 *ANTIDANA* 」\n┊ Got it~ *antidana* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIDANA* 」\n┊ Use: *.antidana on* or *.antidana off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antispam"
export const test = { input: '.antidana', expect: /antidana|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antidana.usage', { state: ctx.t(settings[KEY] ? 'antidana.on' : 'antidana.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antidana.changed', { state: ctx.t(value ? 'antidana.on' : 'antidana.off'), mood: ctx.say('senang') }))
}
