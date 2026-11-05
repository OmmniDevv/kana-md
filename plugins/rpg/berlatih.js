// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "berlatih",
  alias: [],
  category: "rpg",
  description: { id: "Berlatih: tukar 20 energi jadi XP besar", en: "Training: trade 20 energy for a big XP chunk" },
  usage: ".berlatih",
  example: ".berlatih",
  cooldown: 5,
}

export const i18n = {
  id: { "berlatih": {
    "jailed": "╭─❏ 🚔 「 *BERLATIH* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERLATIH* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERLATIH* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🏋️ 「 *BERLATIH* 」\n┊ Latihanmu tuntas, otot dan refleks naik kelas.\n┊ XP LATIHAN: *+{xp}* | LEVEL: *{level}*\n┊ ENERGI SISA: *{energy}*\n╰━━━━━━━"
} },
  en: { "berlatih": {
    "jailed": "╭─❏ 🚔 「 *BERLATIH* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "wait": "╭─❏ ⏳ 「 *BERLATIH* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERLATIH* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🏋️ 「 *BERLATIH* 」\n┊ Your training is complete, muscles and refleXes leveled up.\n┊ TRAINING XP: *+{xp}* | LEVEL: *{level}*\n┊ ENERGY LEFT: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".berlatih", expect: /xp latihan|istirahat dulu|energi|training xp/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('berlatih.jailed', { minutes: jailMinutesLeft(profile) }))
  const now = Date.now()
  const last = Number(profile.last_berlatih) || 0
  const cdMs = 30 * 60000
  if (now - last < cdMs) return ctx.reply(ctx.t('berlatih.wait', { minutes: Math.ceil((cdMs - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('berlatih.lowEnergy', { energy, need: 20 }))
  profile.energy = energy - 20
  profile.last_berlatih = now
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  const xp = 25 + Math.floor(Math.random() * (15))
  const gain = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('berlatih.done', { xp, level: gain.level, energy: profile.energy }))
}
