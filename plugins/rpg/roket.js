// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "roket",
  alias: [],
  category: "rpg",
  description: { id: "Roket crash: keluar otomatis di x1.8, roket bisa meledak sebelum itu", en: "Rocket crash: auto cash-out at x1.8, the rocket may explode before that" },
  usage: ".roket [taruhan]",
  example: ".roket [taruhan]",
  cooldown: 5,
}

export const i18n = {
  id: { "roket": {
    "jailed": "╭─❏ 🚔 「 *ROKET* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *ROKET* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *ROKET* 」\n┊ Taruhannya angka yaa, contoh: *.roket 100*\n╰━━━━━━━",
    "win": "╭─❏ 🚀 「 *ROKET* 」\n┊ Roket meledak di *X{crash}*, kamu keluar di X1.8. MENANG!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🚀 「 *ROKET* 」\n┊ Roket meledak di *X{crash}* sebelum X1.8. Taruhan *{bet} koin* hangus~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "roket": {
    "jailed": "╭─❏ 🚔 「 *ROKET* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *ROKET* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *ROKET* 」\n┊ The bet must be a number, eXample: *.roket 100*\n╰━━━━━━━",
    "win": "╭─❏ 🚀 「 *ROCKET* 」\n┊ The rocket crashed at *X{crash}*, you cashed out at X1.8. YOU WIN!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ 🚀 「 *ROCKET* 」\n┊ The rocket crashed at *X{crash}* before X1.8. Your *{bet} coin* bet burned~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".roket 50", expect: /roket meledak|rocket crashed|saldo/i }
export async function handler(ctx) {

  const bet = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  if (!Number.isFinite(bet) || bet <= 0) return ctx.reply(ctx.t('roket.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('roket.jailed', { minutes: jailMinutesLeft(profile) }))
  if ((profile.balance ?? 0) < bet) return ctx.reply(ctx.t('roket.poor', { balance: profile.balance ?? 0, bet }))
  const crash = Math.round((1 + Math.pow(Math.random(), 2) * 4) * 100) / 100
  const cashAt = 1.8
  const win = crash >= cashAt
  const delta = win ? Math.floor(bet * 0.8) : -bet
  profile.balance = (profile.balance ?? 0) + delta
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t(win ? 'roket.win' : 'roket.lose', { crash, bet, balance: fresh.balance ?? 0 }))
}
