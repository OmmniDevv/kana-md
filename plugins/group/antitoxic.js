
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antitoxic",
  alias: [],
  category: "group",
  description: { id: "Mengatur antitoxic di grup", en: "KANA version of the Elaina-MD antitoxic feature, rewritten in KANA style" },
  usage: ".antitoxic",
  example: ".antitoxic",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antitoxic": {
      changed: "╭─❏ 🛡️ 「 *ANTITOXIC* 」\n┊ Siap~ *antitoxic* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTITOXIC* 」\n┊ Pakai: *.antitoxic on* atau *.antitoxic off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antitoxic": {
      changed: "╭─❏ 🛡️ 「 *ANTITOXIC* 」\n┊ Got it~ *antitoxic* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTITOXIC* 」\n┊ Use: *.antitoxic on* or *.antitoxic off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antitoxic"
export const test = { input: '.antitoxic', expect: /antitoxic|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antitoxic.usage', { state: ctx.t(settings[KEY] ? 'antitoxic.on' : 'antitoxic.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antitoxic.changed', { state: ctx.t(value ? 'antitoxic.on' : 'antitoxic.off'), mood: ctx.say('senang') }))
}
