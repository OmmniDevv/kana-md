// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "slotui",
  alias: [],
  category: "rpg",
  description: { id: "Mesin slot 3 gulungan dengan taruhan koin: jackpot 4x, sepasang 1x", en: "3-reel slot machine with a coin bet: jackpot 4x, a pair pays 1x" },
  usage: ".slotui [taruhan]",
  example: ".slotui [taruhan]",
  cooldown: 5,
}

export const i18n = {
  id: { "slotui": {
    "jailed": "╭─❏ 🚔 「 *SLOTUI* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *SLOTUI* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *SLOTUI* 」\n┊ Taruhannya angka yaa, contoh: *.slotui 100*\n╰━━━━━━━",
    "jackpot": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ JACKPOT! *{delta} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "pair": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ SEPASANG! *{delta} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ ZONK~ *{delta} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "slotui": {
    "jailed": "╭─❏ 🚔 「 *SLOTUI* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *SLOTUI* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *SLOTUI* 」\n┊ The bet must be a number, eXample: *.slotui 100*\n╰━━━━━━━",
    "jackpot": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ JACKPOT! *{delta} COINS*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "pair": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ A PAIR! *{delta} COINS*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "lose": "╭─❏ 🎰 「 *SLOT* 」\n┊ {shown}\n┊ NO LUCK~ *{delta} COINS*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
}

export const test = { input: ".slotui 50", expect: /jackpot|sepasang|zonk|pair|saldo/i }
export async function handler(ctx) {

  const bet = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  if (!Number.isFinite(bet) || bet <= 0) return ctx.reply(ctx.t('slotui.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('slotui.jailed', { minutes: jailMinutesLeft(profile) }))
  if ((profile.balance ?? 0) < bet) return ctx.reply(ctx.t('slotui.poor', { balance: profile.balance ?? 0, bet }))
  const syms = ['🍒', '🍋', '🍇', '💎', '7️⃣']
  const roll = [0, 1, 2].map(() => syms[Math.floor(Math.random() * syms.length)])
  const shown = roll.join(' ')
  let key = 'lose'
  let delta = -bet
  if (roll[0] === roll[1] && roll[1] === roll[2]) { delta = bet * 4; key = 'jackpot' }
  else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) { delta = bet; key = 'pair' }
  profile.balance = (profile.balance ?? 0) + delta
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('slotui.' + key, { shown, bet, delta: (delta >= 0 ? '+' : '') + delta, balance: fresh.balance ?? 0 }))
}
