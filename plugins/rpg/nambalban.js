// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "nambalban",
  alias: [],
  category: "rpg",
  description: { id: "Tukang tambal ban: bayaran per kendaraan", en: "Tire repair: paid per vehicle" },
  usage: ".nambalban",
  example: ".nambalban",
  cooldown: 5,
}

export const i18n = {
  id: { "nambalban": {
    "jailed": "╭─❏ 🚔 「 *NAMBALBAN* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NAMBALBAN* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NAMBALBAN* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NAMBALBAN* 」\n┊ Ban ban pelanggan selesai ditambal semua.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NAMBALBAN* 」\n┊ Tambalannya bocor lagi, pelanggan minta gratis~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "nambalban": {
    "jailed": "╭─❏ 🚔 「 *NAMBALBAN* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NAMBALBAN* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NAMBALBAN* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NAMBALBAN* 」\n┊ All customer tires were patched.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NAMBALBAN* 」\n┊ The patch leaked again, the customer demanded a free redo~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".nambalban", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('nambalban.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_nambalban) || 0
  const cdMs = 30 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('nambalban.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 10) return ctx.reply(ctx.t('nambalban.lowEnergy', { energy, need: 10 }))
  profile.energy = energy - 10
  profile.last_nambalban = now
  if (Math.random() < 0.1) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('nambalban.failed', { energy: profile.energy }))
  }
  const coins = 80 + Math.floor(Math.random() * (90)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 10)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('nambalban.done', { coins, xp: 10, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
