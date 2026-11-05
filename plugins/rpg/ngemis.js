// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "ngemis",
  alias: [],
  category: "rpg",
  description: { id: "Ngemis di lampu merah: recehan acak", en: "Begging at the lights: random small change" },
  usage: ".ngemis",
  example: ".ngemis",
  cooldown: 5,
}

export const i18n = {
  id: { "ngemis": {
    "jailed": "╭─❏ 🚔 「 *NGEMIS* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NGEMIS* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NGEMIS* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NGEMIS* 」\n┊ Recehan dari pengendara terkumpul lumayan.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NGEMIS* 」\n┊ Lampu hijau terus, tidak ada yang sempat memberi~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "ngemis": {
    "jailed": "╭─❏ 🚔 「 *NGEMIS* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NGEMIS* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NGEMIS* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NGEMIS* 」\n┊ Change from drivers added up nicely.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NGEMIS* 」\n┊ The light stayed green, nobody had time to give~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".ngemis", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('ngemis.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_ngemis) || 0
  const cdMs = 60 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('ngemis.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 5) return ctx.reply(ctx.t('ngemis.lowEnergy', { energy, need: 5 }))
  profile.energy = energy - 5
  profile.last_ngemis = now
  if (Math.random() < 0.35) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('ngemis.failed', { energy: profile.energy }))
  }
  const coins = 15 + Math.floor(Math.random() * (55)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 3)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('ngemis.done', { coins, xp: 3, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
