// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "moneytopoin",
  alias: [],
  category: "rpg",
  description: { id: "Tukar koin menjadi XP dengan kurs 10 koin = 1 XP", en: "Exchange coins into XP at 10 coins = 1 XP" },
  usage: ".moneytopoin [jumlah]",
  example: ".moneytopoin [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "moneytopoin": {
    "done": "╭─❏ 🔄 「 *KOIN KE POIN* 」\n┊ *{amount} KOIN* ditukar jadi *+{xp} XP* (kurs 10:1).\n┊ SALDO: *{balance} KOIN* | TOTAL XP: *{totalXp}*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *KOIN KE POIN* 」\n┊ Saldomu *{balance} KOIN*, tidak cukup buat tukar *{amount}*~\n╰━━━━━━━",
    "bad": "╭─❏ 🔄 「 *KOIN KE POIN* 」\n┊ Jumlah minimal 10 koin yaa: *.moneytopoin 100*\n╰━━━━━━━"
} },
  en: { "moneytopoin": {
    "done": "╭─❏ 🔄 「 *COINS TO POINTS* 」\n┊ *{amount} COINS* eXchanged for *+{xp} XP* (rate 10:1).\n┊ BALANCE: *{balance} COINS* | TOTAL XP: *{totalXp}*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *COINS TO POINTS* 」\n┊ Your balance is *{balance} COINS*, not enough to eXchange *{amount}*~\n╰━━━━━━━",
    "bad": "╭─❏ 🔄 「 *COINS TO POINTS* 」\n┊ Minimum amount is 10 coins: *.moneytopoin 100*\n╰━━━━━━━"
} },
}

export const test = { input: ".moneytopoin 100", expect: /ditukar|exchanged|saldo|balance/i }
export async function handler(ctx) {

  const amount = Math.floor(Number((ctx.args ?? [])[0]) || 100)
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!Number.isFinite(amount) || amount < 10) return ctx.reply(ctx.t('moneytopoin.bad'))
  if ((profile.balance ?? 0) < amount) return ctx.reply(ctx.t('moneytopoin.poor', { balance: profile.balance ?? 0, amount }))
  const xpGain = Math.floor(amount / 10)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) - amount })
  await addXp(ctx.storage, ctx.senderDigits, xpGain)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('moneytopoin.done', { amount, xp: xpGain, balance: fresh.balance ?? 0, totalXp: fresh.xp ?? 0 }))
}
