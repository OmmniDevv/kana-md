// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "pelabuhan",
  alias: [],
  category: "rpg",
  description: { id: "Buruh pelabuhan: angkat kargo, upah lumayan", en: "Harbor labor: haul cargo, decent pay" },
  usage: ".pelabuhan",
  example: ".pelabuhan",
  cooldown: 5,
}

export const i18n = {
  id: { "pelabuhan": {
    "jailed": "╭─❏ 🚔 「 *PELABUHAN* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *PELABUHAN* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *PELABUHAN* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *PELABUHAN* 」\n┊ Kargo selesai dibongkar tepat waktu.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *PELABUHAN* 」\n┊ Satu peti jatuh ke laut, upah hangus~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "pelabuhan": {
    "jailed": "╭─❏ 🚔 「 *PELABUHAN* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *PELABUHAN* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *PELABUHAN* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *PELABUHAN* 」\n┊ The cargo was unloaded right on time.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *PELABUHAN* 」\n┊ One crate fell into the sea, the pay is gone~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".pelabuhan", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('pelabuhan.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_pelabuhan) || 0
  const cdMs = 45 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('pelabuhan.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 14) return ctx.reply(ctx.t('pelabuhan.lowEnergy', { energy, need: 14 }))
  profile.energy = energy - 14
  profile.last_pelabuhan = now
  if (Math.random() < 0.15) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('pelabuhan.failed', { energy: profile.energy }))
  }
  const coins = 120 + Math.floor(Math.random() * (140)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 12)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('pelabuhan.done', { coins, xp: 12, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
