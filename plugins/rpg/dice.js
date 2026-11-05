// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "dice",
  alias: [],
  category: "rpg",
  description: { id: "Adu dadu melawan bandar dengan taruhan koin", en: "Dice duel against the house with a coin bet" },
  usage: ".dice [taruhan]",
  example: ".dice [taruhan]",
  cooldown: 5,
}

export const i18n = {
  id: { "dice": {
    "jailed": "╭─❏ 🚔 「 *DICE* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *DICE* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *DICE* 」\n┊ Taruhannya angka yaa, contoh: *.dice 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎲 「 *DICE* 」\n┊ DADUMU: *{mine}* vs BANDAR: *{house}*\n┊ MENANG! +{bet} KOIN.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🎲 「 *DICE* 」\n┊ DADUMU: *{mine}* vs BANDAR: *{house}*\n┊ KALAH~ -{bet} KOIN.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "tie": "╭─❏ 🎲 「 *DICE* 」\n┊ DADUMU: *{mine}* vs BANDAR: *{house}*\n┊ SERI! Taruhan kembali utuh.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "dice": {
    "jailed": "╭─❏ 🚔 「 *DICE* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *DICE* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *DICE* 」\n┊ The bet must be a number, eXample: *.dice 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎲 「 *DICE* 」\n┊ YOUR DIE: *{mine}* vs HOUSE: *{house}*\n┊ YOU WIN! +{bet} COINS.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "lose": "╭─❏ 🎲 「 *DICE* 」\n┊ YOUR DIE: *{mine}* vs HOUSE: *{house}*\n┊ YOU LOSE~ -{bet} COINS.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "tie": "╭─❏ 🎲 「 *DICE* 」\n┊ YOUR DIE: *{mine}* vs HOUSE: *{house}*\n┊ DRAW! Your bet is returned.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".dice 50", expect: /dadumu|your die|menang|kalah|seri|saldo kamu|your balance/i }
export async function handler(ctx) {

  const bet = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  if (!Number.isFinite(bet) || bet <= 0) return ctx.reply(ctx.t('dice.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('dice.jailed', { minutes: jailMinutesLeft(profile) }))
  if ((profile.balance ?? 0) < bet) return ctx.reply(ctx.t('dice.poor', { balance: profile.balance ?? 0, bet }))
  const mine = 1 + Math.floor(Math.random() * 6)
  const house = 1 + Math.floor(Math.random() * 6)
  let key = 'lose'
  if (mine > house) { profile.balance = (profile.balance ?? 0) + bet; key = 'win' }
  else if (mine < house) { profile.balance = (profile.balance ?? 0) - bet; key = 'lose' }
  else { key = 'tie' }
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('dice.' + key, { bet, mine, house, balance: fresh.balance ?? 0 }))
}
