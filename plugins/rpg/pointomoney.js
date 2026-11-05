// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "pointomoney",
  alias: [],
  category: "rpg",
  description: { id: "Tukar XP menjadi koin dengan kurs 1 XP = 5 koin (level ikut turun)", en: "Exchange XP into coins at 1 XP = 5 coins (your level drops too)" },
  usage: ".pointomoney [jumlah]",
  example: ".pointomoney [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "pointomoney": {
    "done": "╭─❏ 🔄 「 *POIN KE KOIN* 」\n┊ *{amount} XP* ditukar jadi *+{coins} KOIN* (kurs 1:5). Levelmu ikut menyesuaikan~\n┊ SALDO: *{balance} KOIN* | SISA XP: *{totalXp}*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *POIN KE KOIN* 」\n┊ XP kamu *{Xp}*, tidak cukup buat tukar *{amount}*~\n╰━━━━━━━",
    "bad": "╭─❏ 🔄 「 *POIN KE KOIN* 」\n┊ Jumlah minimal 10 XP yaa: *.pointomoney 50*\n╰━━━━━━━"
} },
  en: { "pointomoney": {
    "done": "╭─❏ 🔄 「 *POINTS TO COINS* 」\n┊ *{amount} XP* eXchanged for *+{coins} COINS* (rate 1:5). Your level adjusts accordingly~\n┊ BALANCE: *{balance} COINS* | XP LEFT: *{totalXp}*\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *POINTS TO COINS* 」\n┊ Your XP is *{Xp}*, not enough to eXchange *{amount}*~\n╰━━━━━━━",
    "bad": "╭─❏ 🔄 「 *POINTS TO COINS* 」\n┊ Minimum amount is 10 XP: *.pointomoney 50*\n╰━━━━━━━"
} },
}

export const test = { input: ".pointomoney 50", expect: /ditukar|exchanged|saldo|balance|xp kamu/i }
export async function handler(ctx) {

  const amount = Math.floor(Number((ctx.args ?? [])[0]) || 50)
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!Number.isFinite(amount) || amount < 10) return ctx.reply(ctx.t('pointomoney.bad'))
  if ((profile.xp ?? 0) < amount) return ctx.reply(ctx.t('pointomoney.poor', { xp: profile.xp ?? 0, amount }))
  const coins = amount * 5
  await updateProfile(ctx.storage, ctx.senderDigits, { xp: (profile.xp ?? 0) - amount, balance: (profile.balance ?? 0) + coins })
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('pointomoney.done', { amount, coins, balance: fresh.balance ?? 0, totalXp: fresh.xp ?? 0 }))
}
