// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "meditation",
  alias: [],
  category: "rpg",
  description: { id: "Meditasi: pulihkan 35 energi gratis, cooldown 30 menit", en: "Meditation: restore 35 energy for free, 30 minute cooldown" },
  usage: ".meditation",
  example: ".meditation",
  cooldown: 5,
}

export const i18n = {
  id: { "meditation": {
    "wait": "╭─❏ ⏳ 「 *MEDITATION* 」\n┊ Istirahat dulu, coba lagi *{minutes} menit* lagi yaa~\n╰━━━━━━━",
    "full": "╭─❏ 🧘 「 *MEDITATION* 」\n┊ Energimu sudah penuh, pikiranmu jernih~\n╰━━━━━━━",
    "done": "╭─❏ 🧘 「 *MEDITATION* 」\n┊ Hening... energi pulih jadi *{energy}*. +5 XP ketenangan.\n╰━━━━━━━"
} },
  en: { "meditation": {
    "wait": "╭─❏ ⏳ 「 *MEDITATION* 」\n┊ Rest first, try again in *{minutes} minutes*~\n╰━━━━━━━",
    "full": "╭─❏ 🧘 「 *MEDITATION* 」\n┊ Your energy is already full, your mind is clear~\n╰━━━━━━━",
    "done": "╭─❏ 🧘 「 *MEDITATION* 」\n┊ Silence... energy restored to *{energy}*. +5 calm XP.\n╰━━━━━━━"
} },
}

export const test = { input: ".meditation", expect: /energi pulih|energy restored|penuh|istirahat/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const now = Date.now()
  const last = Number(profile.last_meditation) || 0
  if (now - last < 1800000) return ctx.reply(ctx.t('meditation.wait', { minutes: Math.ceil((1800000 - (now - last)) / 60000) }))
  const energy = energyOf(profile)
  if (energy >= 100) return ctx.reply(ctx.t('meditation.full'))
  const next = Math.min(100, energy + 35)
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: next, last_meditation: now })
  await addXp(ctx.storage, ctx.senderDigits, 5)
  return ctx.reply(ctx.t('meditation.done', { energy: next }))
}
