// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "bebaskan",
  alias: [],
  category: "rpg",
  description: { id: "Bayar denda penjara (sesuai level) untuk bebas seketika", en: "Pay the jail fine (scales with level) to get out instantly" },
  usage: ".bebaskan",
  example: ".bebaskan",
  cooldown: 5,
}

export const i18n = {
  id: { "bebaskan": {
    "free": "╭─❏ 🕊️ 「 *BEBASKAN* 」\n┊ Kamu memang lagi bebas, tidak ada yang perlu dibebaskan~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *BEBASKAN* 」\n┊ Dendanya *{fine} KOIN*, saldomu *{balance} KOIN*. Kurang~ Tunggu *{minutes} menit* atau kumpulkan koin dulu.\n╰━━━━━━━",
    "done": "╭─❏ 🔓 「 *BEBASKAN* 」\n┊ DENDA TERBAYAR *{fine} KOIN*. Kamu bebas sekarang!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "bebaskan": {
    "free": "╭─❏ 🕊️ 「 *BEBASKAN* 」\n┊ You are already free, nothing to bail out~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *BEBASKAN* 」\n┊ The fine is *{fine} COINS*, your balance is *{balance} COINS*. Not enough~ Wait *{minutes} minutes* or earn coins first.\n╰━━━━━━━",
    "done": "╭─❏ 🔓 「 *BEBASKAN* 」\n┊ FINE PAID *{fine} COINS*. You are free now!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".bebaskan", expect: /bebas|denda|fine|free/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!isJailed(profile)) return ctx.reply(ctx.t('bebaskan.free'))
  const fine = fineAmount(profile)
  if ((profile.balance ?? 0) < fine) return ctx.reply(ctx.t('bebaskan.poor', { balance: profile.balance ?? 0, fine, minutes: jailMinutesLeft(profile) }))
  profile.balance = (profile.balance ?? 0) - fine
  profile.jailUntil = 0
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('bebaskan.done', { fine, balance: profile.balance }))
}
