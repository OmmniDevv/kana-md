// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "ngamen",
  alias: [],
  category: "rpg",
  description: { id: "Ngamen di jalan: saweran acak, kadang sepi", en: "Busking: random tips, sometimes quiet" },
  usage: ".ngamen",
  example: ".ngamen",
  cooldown: 5,
}

export const i18n = {
  id: { "ngamen": {
    "jailed": "╭─❏ 🚔 「 *NGAMEN* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NGAMEN* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NGAMEN* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NGAMEN* 」\n┊ Ngamenmu ramai, saweran mengalir.\n┊ UPAH: *+{coins} KOIN* | XP: *+{Xp}*\n┊ SALDO SEKARANG: *{balance} KOIN* | ENERGI: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NGAMEN* 」\n┊ Tempatnya sepi, tidak ada yang menyawer~\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "ngamen": {
    "jailed": "╭─❏ 🚔 「 *NGAMEN* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *NGAMEN* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *NGAMEN* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 💼 「 *NGAMEN* 」\n┊ Your busking drew a crowd, tips flowed in.\n┊ PAY: *+{coins} COINS* | XP: *+{Xp}*\n┊ BALANCE NOW: *{balance} COINS* | ENERGY: *{energy}*\n╰━━━━━━━",
    "failed": "╭─❏ 😖 「 *NGAMEN* 」\n┊ The spot was quiet, nobody tipped~\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".ngamen", expect: /upah|istirahat dulu|energi|dipenjara|pay|rest first/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('ngamen.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_ngamen) || 0
  const cdMs = 20 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('ngamen.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 8) return ctx.reply(ctx.t('ngamen.lowEnergy', { energy, need: 8 }))
  profile.energy = energy - 8
  profile.last_ngamen = now
  if (Math.random() < 0.25) {
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('ngamen.failed', { energy: profile.energy }))
  }
  const coins = 40 + Math.floor(Math.random() * (80)) + levelFromXp(profile.xp ?? 0) * 4
  profile.balance = (profile.balance ?? 0) + coins
  
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 8)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('ngamen.done', { coins, xp: 8, balance: fresh.balance ?? 0, energy: energyOf(fresh) }))
}
