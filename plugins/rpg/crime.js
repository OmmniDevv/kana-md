// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "crime",
  alias: [],
  category: "rpg",
  description: { id: "Aksi kriminal generik: peluang berhasil 50 persen, gagal masuk penjara 30 menit", en: "Generic crime run: 50 percent success, failure means 30 minutes in jail" },
  usage: ".crime",
  example: ".crime",
  cooldown: 5,
}

export const i18n = {
  id: { "crime": {
    "jailed": "╭─❏ 🚔 「 *CRIME* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *CRIME* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "success": "╭─❏ 😏 「 *CRIME* 」\n┊ Aksi kriminalmu mulus, dapat *+{gain} KOIN*\n┊ SALDO: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *CRIME* 」\n┊ KETANGKAP! Kamu masuk penjara *{minutes} menit*. Cek .checkjail, bebas pakai .bebaskan~\n╰━━━━━━━"
} },
  en: { "crime": {
    "jailed": "╭─❏ 🚔 「 *CRIME* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *CRIME* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "success": "╭─❏ 😏 「 *CRIME* 」\n┊ Your crime run went smoothly, you got *+{gain} COINS*\n┊ BALANCE: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *CRIME* 」\n┊ BUSTED! You are jailed for *{minutes} minutes*. Check .checkjail, get out with .bebaskan~\n╰━━━━━━━"
} },
}

export const test = { input: ".crime", expect: /mulus|smoothly|ketangkap|busted/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('crime.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('crime.lowEnergy', { energy, need: 20 }))
  profile.energy = energy - 20
  if (Math.random() < 0.5) {
    const gain = 100 + Math.floor(Math.random() * (200))
    profile.balance = (profile.balance ?? 0) + gain
    profile.xp = (profile.xp ?? 0) + 6
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('crime.success', { gain, balance: profile.balance, energy: profile.energy }))
  }
  sendToJail(profile, 30)
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('crime.caught', { minutes: 30 }))
}
