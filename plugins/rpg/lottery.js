// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "lottery",
  alias: [],
  category: "rpg",
  description: { id: "Lotere: tiket 100 koin, jackpot 5.000, hadiah kecil 150", en: "Lottery: 100 coin ticket, 5,000 jackpot, 150 small prize" },
  usage: ".lottery",
  example: ".lottery",
  cooldown: 5,
}

export const i18n = {
  id: { "lottery": {
    "jailed": "╭─❏ 🚔 「 *LOTTERY* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *LOTTERY* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "jackpot": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ JACKPOT!! Tiketmu tembus *+{prize} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "small": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ MENANG KECIL! *+{prize} KOIN* dari tiket 100 koin.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ BELUM BERUNTUNG~ Tiket 100 koin hangus.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "lottery": {
    "jailed": "╭─❏ 🚔 「 *LOTTERY* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *LOTTERY* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "jackpot": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ JACKPOT!! Your ticket hit *+{prize} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "small": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ SMALL WIN! *+{prize} COINS* from a 100 coin ticket.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ 🎟️ 「 *LOTTERY* 」\n┊ NO LUCK~ The 100 coin ticket is gone.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".lottery", expect: /jackpot|menang kecil|belum beruntung|small win|saldo/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('lottery.jailed', { minutes: jailMinutesLeft(profile) }))
  const cost = 100
  if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('lottery.poor', { balance: profile.balance ?? 0, bet: cost }))
  profile.balance = (profile.balance ?? 0) - cost
  const roll = Math.random()
  let key = 'lose'
  let prize = 0
  if (roll < 0.02) { prize = 5000; key = 'jackpot' }
  else if (roll < 0.22) { prize = 150; key = 'small' }
  profile.balance += prize
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 3)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('lottery.' + key, { prize, balance: fresh.balance ?? 0 }))
}
