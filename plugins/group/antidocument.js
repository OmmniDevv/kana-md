
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antidocument",
  alias: [],
  category: "group",
  description: { id: "Mengatur antidocument di grup", en: "KANA version of the Elaina-MD antidocument feature, rewritten in KANA style" },
  usage: ".antidocument",
  example: ".antidocument",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antidocument": {
      changed: "╭─❏ 🛡️ 「 *ANTIDOCUMENT* 」\n┊ Siap~ *antidocument* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIDOCUMENT* 」\n┊ Pakai: *.antidocument on* atau *.antidocument off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antidocument": {
      changed: "╭─❏ 🛡️ 「 *ANTIDOCUMENT* 」\n┊ Got it~ *antidocument* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIDOCUMENT* 」\n┊ Use: *.antidocument on* or *.antidocument off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antidocument"
export const test = { input: '.antidocument', expect: /antidocument|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antidocument.usage', { state: ctx.t(settings[KEY] ? 'antidocument.on' : 'antidocument.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antidocument.changed', { state: ctx.t(value ? 'antidocument.on' : 'antidocument.off'), mood: ctx.say('senang') }))
}
