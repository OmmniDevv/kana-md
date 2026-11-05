// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "judidadu",
  alias: [],
  category: "rpg",
  description: { id: "Judi dadu besar/kecil: tebak jumlah dua dadu dengan taruhan koin", en: "Big/small dice betting: call the sum of two dice with a coin bet" },
  usage: ".judidadu [taruhan] [besar/kecil]",
  example: ".judidadu [taruhan] [besar/kecil]",
  cooldown: 5,
}

export const i18n = {
  id: { "judidadu": {
    "jailed": "╭─❏ 🚔 「 *JUDIDADU* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *JUDIDADU* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *JUDIDADU* 」\n┊ Taruhannya angka yaa, contoh: *.judidadu 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎲 「 *JUDI DADU* 」\n┊ DADU: *{d1} + {d2} = {sum}* (tebakanmu: {side})\n┊ MENANG! +{bet} KOIN | SALDO: *{balance}*\n╰━━━━━━━",
    "lose": "╭─❏ 🎲 「 *JUDI DADU* 」\n┊ DADU: *{d1} + {d2} = {sum}* (tebakanmu: {side})\n┊ KALAH~ -{bet} KOIN | SALDO: *{balance}*\n╰━━━━━━━"
} },
  en: { "judidadu": {
    "jailed": "╭─❏ 🚔 「 *JUDIDADU* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *JUDIDADU* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "badBet": "╭─❏ 🎲 「 *JUDIDADU* 」\n┊ The bet must be a number, eXample: *.judidadu 100*\n╰━━━━━━━",
    "win": "╭─❏ 🎲 「 *DICE BET* 」\n┊ DICE: *{d1} + {d2} = {sum}* (your call: {side})\n┊ YOU WIN! +{bet} COINS | BALANCE: *{balance}*\n╰━━━━━━━",
    "lose": "╭─❏ 🎲 「 *DICE BET* 」\n┊ DICE: *{d1} + {d2} = {sum}* (your call: {side})\n┊ YOU LOSE~ -{bet} COINS | BALANCE: *{balance}*\n╰━━━━━━━"
} },
}

export const test = { input: ".judidadu 50 besar", expect: /dadu:|dice:|menang|kalah|saldo kamu|your balance/i }
export async function handler(ctx) {

  const bet = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  if (!Number.isFinite(bet) || bet <= 0) return ctx.reply(ctx.t('judidadu.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('judidadu.jailed', { minutes: jailMinutesLeft(profile) }))
  if ((profile.balance ?? 0) < bet) return ctx.reply(ctx.t('judidadu.poor', { balance: profile.balance ?? 0, bet }))
  const side = ((ctx.args ?? [])[1] || 'besar').toLowerCase() === 'kecil' ? 'kecil' : 'besar'
  const d1 = 1 + Math.floor(Math.random() * 6)
  const d2 = 1 + Math.floor(Math.random() * 6)
  const sum = d1 + d2
  const win = sum === 7 ? false : (side === 'besar' ? sum > 7 : sum < 7)
  profile.balance = (profile.balance ?? 0) + (win ? bet : -bet)
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t(win ? 'judidadu.win' : 'judidadu.lose', { d1, d2, sum, side, bet, balance: fresh.balance ?? 0 }))
}
