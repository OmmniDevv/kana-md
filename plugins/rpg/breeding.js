// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "breeding",
  alias: [],
  category: "rpg",
  description: { id: "Breeding pet level 2+: menghasilkan 1 telur misterius per hari", en: "Breed a level 2+ pet: produces 1 mysterious egg per day" },
  usage: ".breeding",
  example: ".breeding",
  cooldown: 5,
}

export const i18n = {
  id: { "breeding": {
    "noPet": "╭─❏ 🥚 「 *BREEDING* 」\n┊ Kamu belum punya pet buat diternak. .adopt dulu~\n╰━━━━━━━",
    "young": "╭─❏ 🥚 「 *BREEDING* 」\n┊ Pet kamu baru level *{level}*, breeding butuh level 2+. Kasih makan petmu (.enchant juga menaikkan XP pet)~\n╰━━━━━━━",
    "wait": "╭─❏ 🥚 「 *BREEDING* 」\n┊ Petmu masih pemulihan, coba *{hours} jam* lagi~\n╰━━━━━━━",
    "done": "╭─❏ 🥚 「 *BREEDING* 」\n┊ *{pet}* menghasilkan 1 *Telur Misterius*! Masuk inventaris~\n╰━━━━━━━"
} },
  en: { "breeding": {
    "noPet": "╭─❏ 🥚 「 *BREEDING* 」\n┊ You have no pet to breed yet. Use .adopt first~\n╰━━━━━━━",
    "young": "╭─❏ 🥚 「 *BREEDING* 」\n┊ Your pet is only level *{level}*, breeding needs level 2+. Feed your pet (.enchant also raises pet XP)~\n╰━━━━━━━",
    "wait": "╭─❏ 🥚 「 *BREEDING* 」\n┊ Your pet is still recovering, try again in *{hours} hours*~\n╰━━━━━━━",
    "done": "╭─❏ 🥚 「 *BREEDING* 」\n┊ *{pet}* produced 1 *Mysterious Egg*! Added to your inventory~\n╰━━━━━━━"
} },
}

export const test = { input: ".breeding", expect: /breeding|telur misterius|mysterious egg|pet/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.pet) return ctx.reply(ctx.t('breeding.noPet'))
  if ((profile.pet.level ?? 1) < 2) return ctx.reply(ctx.t('breeding.young', { level: profile.pet.level ?? 1 }))
  const now = Date.now()
  const last = Number(profile.last_breeding) || 0
  if (now - last < 86400000) return ctx.reply(ctx.t('breeding.wait', { hours: Math.ceil((86400000 - (now - last)) / 3600000) }))
  profile.inventory = profile.inventory ?? {}
  profile.inventory.telurmisterius = (profile.inventory.telurmisterius ?? 0) + 1
  profile.last_breeding = now
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('breeding.done', { pet: profile.pet.name }))
}
