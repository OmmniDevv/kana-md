
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antivirtex",
  alias: [],
  category: "group",
  description: { id: "Hapus otomatis pesan yang mengandung karakter aneh/virtex di grup", en: "KANA version of the Elaina-MD antivirtex feature, rewritten in KANA style" },
  usage: ".antivirtex",
  example: ".antivirtex",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antivirtex": {
      changed: "╭─❏ 🛡️ 「 *ANTIVIRTEX* 」\n┊ Siap~ *antivirtex* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIVIRTEX* 」\n┊ Pakai: *.antivirtex on* atau *.antivirtex off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antivirtex": {
      changed: "╭─❏ 🛡️ 「 *ANTIVIRTEX* 」\n┊ Got it~ *antivirtex* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIVIRTEX* 」\n┊ Use: *.antivirtex on* or *.antivirtex off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antivirtex"
export const test = { input: '.antivirtex', expect: /antivirtex|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antivirtex.usage', { state: ctx.t(settings[KEY] ? 'antivirtex.on' : 'antivirtex.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antivirtex.changed', { state: ctx.t(value ? 'antivirtex.on' : 'antivirtex.off'), mood: ctx.say('senang') }))
}
