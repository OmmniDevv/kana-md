// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "checkjail",
  alias: [],
  category: "rpg",
  description: { id: "Cek status penjaramu dan denda bebas saat ini dari sistem penjara sungguhan", en: "Check your real jail status and current bail fine" },
  usage: ".checkjail",
  example: ".checkjail",
  cooldown: 5,
}

export const i18n = {
  id: { "checkjail": {
    "free": "╭─❏ 🕊️ 「 *CHECKJAIL* 」\n┊ Kamu *bebas*, tidak sedang dipenjara. Jangan macam macam yaa~\n╰━━━━━━━",
    "jailed": "╭─❏ 🚔 「 *CHECKJAIL* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*.\n┊ Denda bebas sekarang: *{fine} KOIN* via .bebaskan\n╰━━━━━━━"
} },
  en: { "checkjail": {
    "free": "╭─❏ 🕊️ 「 *CHECKJAIL* 」\n┊ You are *free*, not jailed. Behave~\n╰━━━━━━━",
    "jailed": "╭─❏ 🚔 「 *CHECKJAIL* 」\n┊ You are still jailed, *{minutes} minutes* left.\n┊ Bail fine right now: *{fine} COINS* via .bebaskan\n╰━━━━━━━"
} },
}

export const test = { input: ".checkjail", expect: /bebas|dipenjara|free|jailed/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!isJailed(profile)) return ctx.reply(ctx.t('checkjail.free'))
  return ctx.reply(ctx.t('checkjail.jailed', { minutes: jailMinutesLeft(profile), fine: fineAmount(profile) }))
}
