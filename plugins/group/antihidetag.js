
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
export const config = {
  name: "antihidetag",
  alias: [],
  category: "group",
  description: { id: "Fitur antihidetag versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD antihidetag feature, rewritten in KANA style" },
  usage: ".antihidetag",
  example: ".antihidetag",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    "antihidetag": {
      changed: "╭─❏ 🛡️ 「 *ANTIHIDETAG* 」\n┊ Siap~ *antihidetag* sekarang *{state}* di grup ini~\n╰━━━━━━━ {mood}",
      on: "AKTIF",
      off: "mati",
      usage: "╭─❏ 🛡️ 「 *ANTIHIDETAG* 」\n┊ Pakai: *.antihidetag on* atau *.antihidetag off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━",
    },
  },
  en: {
    "antihidetag": {
      changed: "╭─❏ 🛡️ 「 *ANTIHIDETAG* 」\n┊ Got it~ *antihidetag* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTIHIDETAG* 」\n┊ Use: *.antihidetag on* or *.antihidetag off*\n┊ Current status: *{state}*\n╰━━━━━━━",
    },
  },
}

const KEY = "antihidetag"
// Penegakan antihidetag hidup di before hook plugins/group/guard.js
// (settings.antihidetag dibaca di sana, pesan hidetag massal dihapus dan
// pengirim kena warn). Plugin ini hanya sakelar setelan per grupnya.
export const test = { input: '.antihidetag', expect: /antihidetag|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('antihidetag.usage', { state: ctx.t(settings[KEY] ? 'antihidetag.on' : 'antihidetag.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('antihidetag.changed', { state: ctx.t(value ? 'antihidetag.on' : 'antihidetag.off'), mood: ctx.say('senang') }))
}
