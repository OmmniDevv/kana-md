
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "anticulik",
  alias: [],
  category: "group",
  description: { id: "Fitur anticulik versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD anticulik feature, rewritten in KANA style" },
  usage: ".anticulik",
  example: ".anticulik",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "anticulik": {
      changed: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Siap~ *anticulik* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Pakai: *.anticulik on* atau *.anticulik off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "anticulik": {
      changed: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Got it~ *anticulik* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Use: *.anticulik on* or *.anticulik off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antispam"
export const test = { input: '.anticulik', expect: /anticulik|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('anticulik.usage', { state: ctx.t(settings[KEY] ? 'anticulik.on' : 'anticulik.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('anticulik.changed', { state: ctx.t(value ? 'anticulik.on' : 'anticulik.off'), mood: ctx.say('senang') }))
}
