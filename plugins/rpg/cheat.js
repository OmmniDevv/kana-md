// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "cheat",
  alias: [],
  category: "rpg",
  description: { id: "Owner: mode penguji, +10.000 koin dan +100 XP ke profil sendiri", en: "Owner: test mode, +10,000 coins and +100 XP to own profile" },
  usage: ".cheat",
  example: ".cheat",
  isOwner: true,
  cooldown: 5,
}

export const i18n = {
  id: { "cheat": {
    "done": "╭─❏ 🛠️ 「 *CHEAT* 」\n┊ Mode penguji owner: *+10.000 KOIN* dan *+100 XP* masuk.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "cheat": {
    "done": "╭─❏ 🛠️ 「 *CHEAT* 」\n┊ Owner test mode: *+10,000 COINS* and *+100 XP* added.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".cheat", expect: /mode penguji|owner test mode|saldo/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + 10000 })
  await addXp(ctx.storage, ctx.senderDigits, 100)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('cheat.done', { balance: fresh.balance ?? 0 }))
}
