
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antiphising",
  alias: [],
  category: "group",
  description: { id: "Deteksi konten phising di grup", en: "KANA version of the Elaina-MD antiphising feature, rewritten in KANA style" },
  usage: ".antiphising",
  example: ".antiphising",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antiphising": {
      changed: "╭─❏ 🛡️ 「 *ANTIPHISING* 」\n┊ Siap~ *antiphising* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIPHISING* 」\n┊ Pakai: *.antiphising on* atau *.antiphising off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antiphising": {
      changed: "╭─❏ 🛡️ 「 *ANTIPHISING* 」\n┊ Got it~ *antiphising* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIPHISING* 」\n┊ Use: *.antiphising on* or *.antiphising off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antiphising"
export const test = { input: '.antiphising', expect: /antiphising|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antiphising.usage', { state: ctx.t(settings[KEY] ? 'antiphising.on' : 'antiphising.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antiphising.changed', { state: ctx.t(value ? 'antiphising.on' : 'antiphising.off'), mood: ctx.say('senang') }))
}
