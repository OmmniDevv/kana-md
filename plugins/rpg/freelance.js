// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "freelance",
  alias: [],
  category: "rpg",
  description: { id: "Proyek freelance: upah lebih besar, cooldown lebih lama", en: "Freelance project: bigger pay, longer cooldown" },
  usage: ".freelance",
  example: ".freelance",
  cooldown: 5,
}

export const i18n = {
  id: { "freelance": {
    "jailed": "╭─❏ 🚔 「 *FREELANCE* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *FREELANCE* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *FREELANCE* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *FREELANCE* 」\n┊ Proyek freelance selesai dan klien membayar lunas.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *FREELANCE* 」\n┊ Klien membatalkan proyek di tengah jalan~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "freelance": {
    "jailed": "╭─❏ 🚔 「 *FREELANCE* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *FREELANCE* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *FREELANCE* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *FREELANCE* 」\n┊ The freelance project is done and the client paid in full.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *FREELANCE* 」\n┊ The client cancelled the project midway~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".freelance", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('freelance.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_freelance) || 0
  const cdMs = 45 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('freelance.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 10) return ctx.reply(ctx.t('freelance.lowEnergy', { energy, need: 10 }))
  profile.energy = energy - 10
  profile.last_freelance = now
  if (Math.random() < 0.15) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('freelance.failed', { energy: profile.energy }))
  }
  const coins = 100 + Math.floor(Math.random() * (120)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 12)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('freelance.done', { coins, xp: 12, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
