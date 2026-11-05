// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
export const config = {
  name: "skill",
  alias: [],
  category: "rpg",
  description: { id: "Status skill nyata: level, pekerjaan, power tempur terhitung, pet, dan energi dari profilmu", en: "Real skill status: level, job, computed battle power, pet, and energy from your profile" },
  usage: ".skill",
  example: ".skill",
  cooldown: 5,
}

export const i18n = {
  id: { "skill": {
    "info": "╭─❏ 📊 「 *SKILL & STATUS* 」\n┊ LEVEL: *{level}* (XP {Xp})\n┊ SKILL/PEKERJAAN: *{job}*\n┊ POWER TEMPUR: *{power}*\n┊ PET: *{pet}* | ENERGI: *{energy}*\n┊ Ganti skill pakai .selectskill\n╰━━━━━━━"
} },
  en: { "skill": {
    "info": "╭─❏ 📊 「 *SKILL & STATUS* 」\n┊ LEVEL: *{level}* (XP {Xp})\n┊ SKILL/JOB: *{job}*\n┊ BATTLE POWER: *{power}*\n┊ PET: *{pet}* | ENERGY: *{energy}*\n┊ Change skills with .selectskill\n╰━━━━━━━"
} },
}

export const test = { input: ".skill", expect: /skill & status|power tempur|battle power/i }
export async function handler(ctx) {

  const { JOB_MAP } = await import('../../src/rpg/data.js')
  const { powerOf } = await import('../../src/rpg/engine.js')
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const job = JOB_MAP[profile.job]
  return ctx.reply(ctx.t('skill.info', {
    level: levelFromXp(profile.xp ?? 0),
    xp: profile.xp ?? 0,
    job: job ? (ctx.lang === 'en' ? job.name.en : job.name.id) : '-',
    power: powerOf(profile),
    pet: profile.pet ? profile.pet.name + ' lv' + (profile.pet.level ?? 1) : '-',
    energy: energyOf(profile),
  }))
}
