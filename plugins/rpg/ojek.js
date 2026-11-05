// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "ojek",
  alias: ["ngojek"],
  category: "rpg",
  description: { id: "Narik ojek online: upah per trip, alias .ngojek", en: "Motorbike taxi trips: paid per trip, alias .ngojek" },
  usage: ".ojek",
  example: ".ojek",
  cooldown: 5,
}

export const i18n = {
  id: { "ojek": {
    "jailed": "╭─❏ 🚔 「 *OJEK* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *OJEK* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *OJEK* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *OJEK* 」\n┊ Trip ojek selesai, penumpang membayar tunai.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *OJEK* 」\n┊ Penumpang membatalkan di tengah jalan~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "ojek": {
    "jailed": "╭─❏ 🚔 「 *OJEK* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *OJEK* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *OJEK* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *OJEK* 」\n┊ The ride is done, the passenger paid cash.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *OJEK* 」\n┊ The passenger cancelled midway~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".ojek", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('ojek.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_ojek) || 0
  const cdMs = 25 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('ojek.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 12) return ctx.reply(ctx.t('ojek.lowEnergy', { energy, need: 12 }))
  profile.energy = energy - 12
  profile.last_ojek = now
  if (Math.random() < 0.1) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('ojek.failed', { energy: profile.energy }))
  }
  const coins = 90 + Math.floor(Math.random() * (110)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 11)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('ojek.done', { coins, xp: 11, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
