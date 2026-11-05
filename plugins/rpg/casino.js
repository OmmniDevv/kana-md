// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "casino",
  alias: [],
  category: "rpg",
  description: { id: "Kasino sungguhan: pasang taruhan koin, peluang menang 45 persen, menang dapat dua kali taruhan", en: "Real casino: bet coins, 45 percent win chance, wins pay double the bet" },
  usage: ".casino [taruhan]",
  example: ".casino [taruhan]",
  cooldown: 5,
}

export const i18n = {
  id: { "casino": {
    "jailed": "╭─❏ 🚔 「 *CASINO* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *CASINO* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *CASINO* 」\n┊ Taruhannya angka yaa, contoh: *.casino 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎰 「 *CASINO* 」\n┊ MENANG! Taruhan *{bet} koin* berlipat jadi milikmu.\n┊ SALDO SEKARANG: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🎰 「 *CASINO* 」\n┊ KALAH~ Taruhan *{bet} koin* melayang ke bandar.\n┊ SALDO SEKARANG: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "casino": {
    "jailed": "╭─❏ 🚔 「 *CASINO* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *CASINO* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *CASINO* 」\n┊ The bet must be a number, eXample: *.casino 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎰 「 *CASINO* 」\n┊ YOU WIN! Your *{bet} coin* bet doubled back to you.\n┊ BALANCE NOW: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ 🎰 「 *CASINO* 」\n┊ YOU LOSE~ Your *{bet} coin* bet went to the house.\n┊ BALANCE NOW: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".casino 50", expect: /menang|kalah|saldo|bet|win|lose/i }
export async function handler(ctx) {

  const bet = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  if (!Number.isFinite(bet) || bet <= 0) return ctx.reply(ctx.t('casino.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('casino.jailed', { minutes: jailMinutesLeft(profile) }))
  if ((profile.balance ?? 0) < bet) return ctx.reply(ctx.t('casino.poor', { balance: profile.balance ?? 0, bet }))
  profile.balance = (profile.balance ?? 0) - bet
  const win = Math.random() < 0.45
  if (win) profile.balance += bet * 2
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t(win ? 'casino.win' : 'casino.lose', { bet, balance: fresh.balance ?? 0 }))
}
