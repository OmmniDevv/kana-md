
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

// Anticulik: toggle setelan PER GRUP (namespace groups, pola antilink).
// Penegakan: hook onParticipantsUpdate di bawah. Bila bot ditambahkan ke
// grup yang anticuliknya aktif oleh orang selain owner, bot memberi
// peringatan lalu keluar grup sendiri (sock.groupLeave), seperti Elaina.
// Catatan jujur: grup yang benar benar baru belum punya setelan tersimpan,
// jadi penegakan berlaku untuk grup yang setelannya sudah pernah dinyalakan
// (setelan grup bertahan walau bot keluar dan dimasukkan lagi).
export const config = {
  name: "anticulik",
  alias: ["antikidnap"],
  category: "group",
  description: { id: "Bot otomatis keluar grup jika ditambah tanpa izin saat anticulik aktif", en: "Bot leaves automatically when added without permission while anticulik is on" },
  usage: ".anticulik on/off/status",
  example: ".anticulik on",
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
      status: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Status di grup ini: *{state}*\n╰━━━━━━━",
      leaving: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Minimal izin dulu yaa, jangan asal culik~\n┊ KANA keluar dulu dari grup ini. Minta owner pakai perintah join resmi yaa~\n╰━━━━━━━",
    },
  },
  en: {
    "anticulik": {
      changed: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Got it~ *anticulik* is now *{state}* in this group~\n╰━━━━━━━ {mood}",
      on: "ON",
      off: "off",
      usage: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Use: *.anticulik on* or *.anticulik off*\n┊ Current status: *{state}*\n╰━━━━━━━",
      status: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Status in this group: *{state}*\n╰━━━━━━━",
      leaving: "╭─❏ 🛡️ 「 *ANTICULIK* 」\n┊ Please ask for permission first, do not just kidnap me~\n┊ KANA is leaving this group. Ask the owner to use the official join command~\n╰━━━━━━━",
    },
  },
}

const KEY = "anticulik"
export const test = { input: '.anticulik', expect: /anticulik|pakai|use/i }
export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (state === 'status') {
    return ctx.reply(ctx.t('anticulik.status', { state: ctx.t(settings[KEY] ? 'anticulik.on' : 'anticulik.off') }))
  }
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('anticulik.usage', { state: ctx.t(settings[KEY] ? 'anticulik.on' : 'anticulik.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('anticulik.changed', { state: ctx.t(value ? 'anticulik.on' : 'anticulik.off'), mood: ctx.say('senang') }))
}

function digitsOf(value) {
  return String(value ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

// Keputusan murni anticulik: true bila bot termasuk peserta yang baru
// ditambahkan, pengundang bukan bot sendiri dan bukan owner.
export function shouldLeaveForAnticulik({ participants = [], botJid = '', author = '', ownerDigits = '' } = {}) {
  const botDigits = digitsOf(botJid)
  if (!botDigits) return false
  const botAdded = (participants ?? []).some((p) => {
    const jid = typeof p === 'string' ? p : p?.phoneNumber || p?.id || p?.jid || ''
    return digitsOf(jid) === botDigits
  })
  if (!botAdded) return false
  const authorDigits = digitsOf(author)
  if (authorDigits && authorDigits === botDigits) return false
  if (ownerDigits && authorDigits === digitsOf(ownerDigits)) return false
  return true
}

export async function onParticipantsUpdate(ctx) {
  if (ctx.action !== 'add') return false
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (!settings[KEY]) return false
  const botJid = ctx.sock?.user?.id || ''
  const ownerDigits = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  const leave = shouldLeaveForAnticulik({ participants: ctx.participants, botJid, author: ctx.author, ownerDigits })
  if (!leave) return false
  try {
    await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('anticulik.leaving') })
  } catch {}
  try {
    await ctx.sock.groupLeave(ctx.chat)
  } catch {}
  return true
}
