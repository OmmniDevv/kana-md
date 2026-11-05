// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { limitState } from '../../src/services/user-service.js'
import { buyItem } from '../../src/rpg/engine.js'
export const config = {
  name: "notiflimit",
  alias: [],
  category: "user",
  description: { id: "Nyalakan/matikan notifikasi limit harian; pilihan tersimpan di profilmu", en: "Toggle daily limit notifications; the choice is stored in your profile" },
  usage: ".notiflimit",
  example: ".notiflimit",
  cooldown: 5,
}

export const i18n = {
  id: { "notiflimit": {
    "on": "╭─❏ 🔔 「 *NOTIF LIMIT* 」\n┊ Notifikasi limit *AKTIF*. Kamu akan diingatkan saat limit harianmu habis (sisa sekarang: *{left}*).\n┊ Matikan pakai .notiflimit lagi.\n╰━━━━━━━",
    "off": "╭─❏ 🔕 「 *NOTIF LIMIT* 」\n┊ Notifikasi limit *MATI*. Sisa limitmu sekarang: *{left}*.\n┊ Nyalakan pakai .notiflimit lagi.\n╰━━━━━━━"
} },
  en: { "notiflimit": {
    "on": "╭─❏ 🔔 「 *LIMIT NOTIF* 」\n┊ Limit notifications are *ON*. You will be reminded when your daily limit runs out (left now: *{left}*).\n┊ Turn it off with .notiflimit again.\n╰━━━━━━━",
    "off": "╭─❏ 🔕 「 *LIMIT NOTIF* 」\n┊ Limit notifications are *OFF*. Your remaining limit: *{left}*.\n┊ Turn it on with .notiflimit again.\n╰━━━━━━━"
} },
}

export const test = { input: ".notiflimit", expect: /notifikasi limit|limit notifications/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const next = !profile.notifLimit
  const state = limitState(profile)
  await updateProfile(ctx.storage, ctx.senderDigits, { notifLimit: next })
  return ctx.reply(ctx.t(next ? 'notiflimit.on' : 'notiflimit.off', { left: state.left }))
}
