// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "challenge",
  alias: [],
  category: "rpg",
  description: { id: "Tantangan arena: biaya 50 koin, peluang menang naik sesuai level, hadiah 220 koin", en: "Arena challenge: 50 coin entry, win chance scales with level, 220 coin prize" },
  usage: ".challenge",
  example: ".challenge",
  cooldown: 5,
}

export const i18n = {
  id: { "challenge": {
    "jailed": "╭─❏ 🚔 「 *CHALLENGE* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *CHALLENGE* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "win": "╭─❏ 🏆 「 *CHALLENGE* 」\n┊ TANTANGAN TUNTAS! Level {level} kamu cukup kuat. Hadiah *+220 KOIN*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🏆 「 *CHALLENGE* 」\n┊ TANTANGAN GAGAL~ Biaya 50 koin hangus. Latih levelmu (level {level}) dan coba lagi.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "challenge": {
    "jailed": "╭─❏ 🚔 「 *CHALLENGE* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *CHALLENGE* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "win": "╭─❏ 🏆 「 *CHALLENGE* 」\n┊ CHALLENGE CLEARED! Your level {level} was strong enough. Prize *+220 COINS*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ 🏆 「 *CHALLENGE* 」\n┊ CHALLENGE FAILED~ The 50 coin fee is gone. Raise your level ({level}) and retry.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".challenge", expect: /tantangan tuntas|tantangan gagal|challenge cleared|challenge failed|saldo kamu/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('challenge.jailed', { minutes: jailMinutesLeft(profile) }))
  const cost = 50
  if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('challenge.poor', { balance: profile.balance ?? 0, bet: cost }))
  profile.balance = (profile.balance ?? 0) - cost
  const level = levelFromXp(profile.xp ?? 0)
  const chance = Math.min(0.7, 0.35 + level * 0.02)
  const win = Math.random() < chance
  if (win) profile.balance += 220
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, win ? 20 : 6)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t(win ? 'challenge.win' : 'challenge.lose', { level, balance: fresh.balance ?? 0 }))
}
