// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "treasure",
  alias: [],
  category: "rpg",
  description: { id: "Berburu harta dari peta lama: koin, peluang peti berisi kristal, cooldown 10 menit", en: "Treasure hunting from an old map: coins, a chance of a crystal chest, 10 minute cooldown" },
  usage: ".treasure",
  example: ".treasure",
  cooldown: 5,
}

export const i18n = {
  id: { "treasure": {
    "jailed": "╭─❏ 🚔 「 *TREASURE* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TREASURE* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TREASURE* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🧭 「 *TREASURE* 」\n┊ Kamu menggali di titik peta lama dan menemukan sisa rampasan.\n┊ KOIN: *+{coins}* | PETI HARTA: *{chest}*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "treasure": {
    "jailed": "╭─❏ 🚔 「 *TREASURE* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TREASURE* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TREASURE* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🧭 「 *TREASURE* 」\n┊ You dug at the old map mark and found leftover loot.\n┊ COINS: *+{coins}* | TREASURE CHEST: *{chest}*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".treasure", expect: /peti harta|treasure chest|istirahat|energi/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('treasure.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_treasure) || 0
  if (now - last < 600000) return ctx.reply(ctx.t('treasure.wait', { minutes: Math.ceil((600000 - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 15) return ctx.reply(ctx.t('treasure.lowEnergy', { energy, need: 15 }))
  profile.energy = energy - 15
  profile.last_treasure = now
  let chestLine = ''
  if (Math.random() < 0.3) {
    const bonus = 200 + Math.floor(Math.random() * 400)
    profile.balance = (profile.balance ?? 0) + bonus
    profile.inventory = profile.inventory ?? {}
    profile.inventory.kristal = (profile.inventory.kristal ?? 0) + 1
    chestLine = '+' + bonus
  }
  const coins = 20 + Math.floor(Math.random() * 40)
  profile.balance = (profile.balance ?? 0) + coins
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 12)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('treasure.done', { coins, chest: chestLine, balance: fresh.balance ?? 0 }))
}
