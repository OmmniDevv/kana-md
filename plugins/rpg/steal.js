// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail, fineAmount } from '../../src/rpg/crime.js'
export const config = {
  name: "steal",
  alias: [],
  category: "rpg",
  description: { id: "Mencuri: peluang 55 persen, gagal masuk penjara 15 menit", en: "Stealing: 55 percent chance, failure means 15 minutes in jail" },
  usage: ".steal",
  example: ".steal",
  cooldown: 5,
}

export const i18n = {
  id: { "steal": {
    "jailed": "╭─❏ 🚔 「 *STEAL* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *STEAL* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "success": "╭─❏ 😏 「 *STEAL* 」\n┊ Tanganmu lincah, hasil curian *+{gain} KOIN*\n┊ SALDO: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *STEAL* 」\n┊ KETANGKAP! Kamu masuk penjara *{minutes} menit*. Cek .checkjail, bebas pakai .bebaskan~\n╰━━━━━━━"
} },
  en: { "steal": {
    "jailed": "╭─❏ 🚔 「 *STEAL* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *STEAL* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "success": "╭─❏ 😏 「 *STEAL* 」\n┊ Your hands were quick, the loot is *+{gain} COINS*\n┊ BALANCE: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "caught": "╭─❏ 🚨 「 *STEAL* 」\n┊ BUSTED! You are jailed for *{minutes} minutes*. Check .checkjail, get out with .bebaskan~\n╰━━━━━━━"
} },
}

export const test = { input: ".steal", expect: /lincah|quick|ketangkap|busted/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('steal.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 15) return ctx.reply(ctx.t('steal.lowEnergy', { energy, need: 15 }))
  profile.energy = energy - 15
  if (Math.random() < 0.55) {
    const gain = 60 + Math.floor(Math.random() * (160))
    profile.balance = (profile.balance ?? 0) + gain
    profile.xp = (profile.xp ?? 0) + 6
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('steal.success', { gain, balance: profile.balance, energy: profile.energy }))
  }
  sendToJail(profile, 15)
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('steal.caught', { minutes: 15 }))
}
