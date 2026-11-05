// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "taksi",
  alias: ["taxi", "taxy"],
  category: "rpg",
  description: { id: "Narik taksi: upah per trip lebih besar dari ojek, alias .taxi/.taxy", en: "Taxi trips: bigger pay than motorbike taxi, alias .taxi/.taxy" },
  usage: ".taksi",
  example: ".taksi",
  cooldown: 5,
}

export const i18n = {
  id: { "taksi": {
    "jailed": "╭─❏ 🚔 「 *TAKSI* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TAKSI* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TAKSI* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *TAKSI* 」\n┊ Penumpang sampai tujuan, argo dibayar penuh.\n┊ UPAH: *+{coins} KOIN* | XP: *+{xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *TAKSI* 」\n┊ Penumpang kabur sebelum membayar~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "taksi": {
    "jailed": "╭─❏ 🚔 「 *TAKSI* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TAKSI* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TAKSI* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *TAKSI* 」\n┊ The passenger arrived, the meter was paid in full.\n┊ PAY: *+{coins} COINS* | XP: *+{xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *TAKSI* 」\n┊ The passenger ran off before paying~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".taksi", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('taksi.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_taksi) || 0
  const cdMs = 25 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('taksi.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 12) return ctx.reply(ctx.t('taksi.lowEnergy', { energy, need: 12 }))
  profile.energy = energy - 12
  profile.last_taksi = now
  if (Math.random() < 0.1) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('taksi.failed', { energy: profile.energy }))
  }
  const coins = 110 + Math.floor(Math.random() * (120)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 11)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('taksi.done', { coins, xp: 11, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
