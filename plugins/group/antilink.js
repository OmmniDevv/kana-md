
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antilink",
  alias: [],
  category: "group",
  description: { id: "Hapus otomatis semua link yang dikirim member grup", en: "KANA version of the Elaina-MD antilink feature, rewritten in KANA style" },
  usage: ".antilink",
  example: ".antilink",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antilink": {
      changed: "╭─❏ 🛡️ 「 *ANTILINK* 」\n┊ Siap~ *antilink* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTILINK* 」\n┊ Pakai: *.antilink on* atau *.antilink off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antilink": {
      changed: "╭─❏ 🛡️ 「 *ANTILINK* 」\n┊ Got it~ *antilink* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTILINK* 」\n┊ Use: *.antilink on* or *.antilink off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antilink"
export const test = { input: '.antilink', expect: /antilink|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antilink.usage', { state: ctx.t(settings[KEY] ? 'antilink.on' : 'antilink.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antilink.changed', { state: ctx.t(value ? 'antilink.on' : 'antilink.off'), mood: ctx.say('senang') }))
}
