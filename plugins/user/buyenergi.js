// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { limitState } from '../../src/services/user-service.js'
import { buyItem } from '../../src/rpg/engine.js'
export const config = {
  name: "buyenergi",
  alias: [],
  category: "user",
  description: { id: "Beli isi penuh energi seharga 150 koin", en: "Buy a full energy refill for 150 coins" },
  usage: ".buyenergi",
  example: ".buyenergi",
  cooldown: 5,
}

export const i18n = {
  id: { "buyenergi": {
    "full": "╭─❏ 🔋 「 *BELI ENERGI* 」\n┊ Energimu sudah penuh (100), tidak perlu beli~\n╰━━━━━━━",
    "poor": "╭─❏ 🔋 「 *BELI ENERGI* 」\n┊ Isi penuh energi harganya 150 koin, saldomu *{balance} KOIN*~\n╰━━━━━━━",
    "done": "╭─❏ 🔋 「 *BELI ENERGI* 」\n┊ ENERGI TERISI PENUH (100) seharga 150 koin!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "buyenergi": {
    "full": "╭─❏ 🔋 「 *BUY ENERGY* 」\n┊ Your energy is already full (100), no need to buy~\n╰━━━━━━━",
    "poor": "╭─❏ 🔋 「 *BUY ENERGY* 」\n┊ A full energy refill costs 150 coins, your balance is *{balance} COINS*~\n╰━━━━━━━",
    "done": "╭─❏ 🔋 「 *BUY ENERGY* 」\n┊ ENERGY FULLY REFILLED (100) for 150 coins!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".buyenergi", expect: /terisi penuh|fully refilled|sudah penuh|already full|saldo/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy >= 100) return ctx.reply(ctx.t('buyenergi.full'))
  const cost = 150
  if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('buyenergi.poor', { balance: profile.balance ?? 0 }))
  profile.balance = (profile.balance ?? 0) - cost
  profile.energy = 100
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('buyenergi.done', { balance: profile.balance }))
}
