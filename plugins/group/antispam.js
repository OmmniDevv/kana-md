
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antispam",
  alias: [],
  category: "group",
  description: { id: "Fitur antispam versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD antispam feature, rewritten in KANA style" },
  usage: ".antispam",
  example: ".antispam",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antispam": {
      changed: "╭─❏ 🛡️ 「 *ANTISPAM* 」\n┊ Siap~ *antispam* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTISPAM* 」\n┊ Pakai: *.antispam on* atau *.antispam off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antispam": {
      changed: "╭─❏ 🛡️ 「 *ANTISPAM* 」\n┊ Got it~ *antispam* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTISPAM* 」\n┊ Use: *.antispam on* or *.antispam off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antispam"
export const test = { input: '.antispam', expect: /antispam|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antispam.usage', { state: ctx.t(settings[KEY] ? 'antispam.on' : 'antispam.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antispam.changed', { state: ctx.t(value ? 'antispam.on' : 'antispam.off'), mood: ctx.say('senang') }))
}
