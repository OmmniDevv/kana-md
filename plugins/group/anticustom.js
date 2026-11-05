
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "anticustom",
  alias: [],
  category: "group",
  description: { id: "Fitur anticustom versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD anticustom feature, rewritten in KANA style" },
  usage: ".anticustom",
  example: ".anticustom",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "anticustom": {
      changed: "╭─❏ 🛡️ 「 *ANTICUSTOM* 」\n┊ Siap~ *anticustom* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTICUSTOM* 」\n┊ Pakai: *.anticustom on* atau *.anticustom off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "anticustom": {
      changed: "╭─❏ 🛡️ 「 *ANTICUSTOM* 」\n┊ Got it~ *anticustom* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTICUSTOM* 」\n┊ Use: *.anticustom on* or *.anticustom off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antispam"
export const test = { input: '.anticustom', expect: /anticustom|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('anticustom.usage', { state: ctx.t(settings[KEY] ? 'anticustom.on' : 'anticustom.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('anticustom.changed', { state: ctx.t(value ? 'anticustom.on' : 'anticustom.off'), mood: ctx.say('senang') }))
}
