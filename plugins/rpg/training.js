// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "training",
  alias: [],
  category: "rpg",
  description: { id: "Training intensif: tukar 25 energi jadi XP lebih besar", en: "Intensive training: trade 25 energy for even more XP" },
  usage: ".training",
  example: ".training",
  cooldown: 5,
}

export const i18n = {
  id: { "training": {
    "jailed": "╭─❏ 🚔 「 *TRAINING* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TRAINING* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TRAINING* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🏋️ 「 *TRAINING* 」\n┊ Sesi training intensif selesai dengan keringat penuh.\n┊ XP LATIHAN: *+{xp}* | LEVEL: *{level}*\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "training": {
    "jailed": "╭─❏ 🚔 「 *TRAINING* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *TRAINING* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *TRAINING* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🏋️ 「 *TRAINING* 」\n┊ The intensive training session ended in full sweat.\n┊ TRAINING XP: *+{xp}* | LEVEL: *{level}*\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".training", expect: /xp latihan|istirahat dulu|energi|training xp/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('training.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_training) || 0
  const cdMs = 45 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('training.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 25) return ctx.reply(ctx.t('training.lowEnergy', { energy, need: 25 }))
  profile.energy = energy - 25
  profile.last_training = now
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  const xp = 30 + Math.floor(Math.random() * (15))
  const gain = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('training.done', { xp, level: gain.level, energy: profile.energy }))
}
