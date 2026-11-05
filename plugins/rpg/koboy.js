// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "koboy",
  alias: [],
  category: "rpg",
  description: { id: "Kerja koboy menggembala ternak: upah besar, energi besar", en: "Cowboy ranch work: big pay, big energy" },
  usage: ".koboy",
  example: ".koboy",
  cooldown: 5,
}

export const i18n = {
  id: { "koboy": {
    "jailed": "╭─❏ 🚔 「 *KOBOY* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *KOBOY* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *KOBOY* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *KOBOY* 」\n┊ Ternak tergembala rapi sampai petang.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *KOBOY* 」\n┊ Sapi kabur dari kandang, upah dipotong habis~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "koboy": {
    "jailed": "╭─❏ 🚔 「 *KOBOY* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *KOBOY* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *KOBOY* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *KOBOY* 」\n┊ The herd was tended neatly until dusk.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *KOBOY* 」\n┊ Cattle escaped the pen, the pay was fully docked~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".koboy", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('koboy.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_koboy) || 0
  const cdMs = 60 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('koboy.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 15) return ctx.reply(ctx.t('koboy.lowEnergy', { energy, need: 15 }))
  profile.energy = energy - 15
  profile.last_koboy = now
  if (Math.random() < 0.2) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('koboy.failed', { energy: profile.energy }))
  }
  const coins = 150 + Math.floor(Math.random() * (170)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 14)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('koboy.done', { coins, xp: 14, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
