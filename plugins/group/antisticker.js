
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antisticker",
  alias: [],
  category: "group",
  description: { id: "Mengatur antisticker di grup", en: "KANA version of the Elaina-MD antisticker feature, rewritten in KANA style" },
  usage: ".antisticker",
  example: ".antisticker",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antisticker": {
      changed: "╭─❏ 🛡️ 「 *ANTISTICKER* 」\n┊ Siap~ *antisticker* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTISTICKER* 」\n┊ Pakai: *.antisticker on* atau *.antisticker off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antisticker": {
      changed: "╭─❏ 🛡️ 「 *ANTISTICKER* 」\n┊ Got it~ *antisticker* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTISTICKER* 」\n┊ Use: *.antisticker on* or *.antisticker off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antisticker"
export const test = { input: '.antisticker', expect: /antisticker|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antisticker.usage', { state: ctx.t(settings[KEY] ? 'antisticker.on' : 'antisticker.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antisticker.changed', { state: ctx.t(value ? 'antisticker.on' : 'antisticker.off'), mood: ctx.say('senang') }))
}
