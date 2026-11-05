
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antijudol",
  alias: [],
  category: "group",
  description: { id: "Deteksi konten judol di grup", en: "KANA version of the Elaina-MD antijudol feature, rewritten in KANA style" },
  usage: ".antijudol",
  example: ".antijudol",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antijudol": {
      changed: "╭─❏ 🛡️ 「 *ANTIJUDOL* 」\n┊ Siap~ *antijudol* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIJUDOL* 」\n┊ Pakai: *.antijudol on* atau *.antijudol off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antijudol": {
      changed: "╭─❏ 🛡️ 「 *ANTIJUDOL* 」\n┊ Got it~ *antijudol* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIJUDOL* 」\n┊ Use: *.antijudol on* or *.antijudol off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antijudol"
export const test = { input: '.antijudol', expect: /antijudol|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antijudol.usage', { state: ctx.t(settings[KEY] ? 'antijudol.on' : 'antijudol.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antijudol.changed', { state: ctx.t(value ? 'antijudol.on' : 'antijudol.off'), mood: ctx.say('senang') }))
}
