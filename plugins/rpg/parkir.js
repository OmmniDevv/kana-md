// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "parkir",
  alias: [],
  category: "rpg",
  description: { id: "Jaga parkir: upah kecil tapi stabil", en: "Parking attendant: small but steady pay" },
  usage: ".parkir",
  example: ".parkir",
  cooldown: 5,
}

export const i18n = {
  id: { "parkir": {
    "jailed": "╭─❏ 🚔 「 *PARKIR* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *PARKIR* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *PARKIR* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *PARKIR* 」\n┊ Giliran jaga parkir selesai tanpa insiden.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *PARKIR* 」\n┊ Ada kendaraan lecet, upahmu dipotong~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "parkir": {
    "jailed": "╭─❏ 🚔 「 *PARKIR* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *PARKIR* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *PARKIR* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *PARKIR* 」\n┊ Your parking shift ended without incidents.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *PARKIR* 」\n┊ A vehicle got scratched, your pay was docked~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".parkir", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('parkir.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_parkir) || 0
  const cdMs = 20 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('parkir.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 6) return ctx.reply(ctx.t('parkir.lowEnergy', { energy, need: 6 }))
  profile.energy = energy - 6
  profile.last_parkir = now
  if (Math.random() < 0.05) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('parkir.failed', { energy: profile.energy }))
  }
  const coins = 50 + Math.floor(Math.random() * (60)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 7)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('parkir.done', { coins, xp: 7, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
