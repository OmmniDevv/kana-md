// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "enchant",
  alias: [],
  category: "rpg",
  description: { id: "Enchant pet: bakar 1 kristal + 300 koin untuk +60 XP pet (level pet menaikkan power)", en: "Enchant your pet: burn 1 crystal + 300 coins for +60 pet XP (pet level raises power)" },
  usage: ".enchant",
  example: ".enchant",
  cooldown: 5,
}

export const i18n = {
  id: { "enchant": {
    "noPet": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Enchant buat pet, kamu belum punya pet. Adopsi dulu pakai .adopt~\n╰━━━━━━━",
    "noCrystal": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Perlu 1 kristal di inventaris. Kristal didapat dari tambang dan dungeon~\n╰━━━━━━━",
    "poor": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Biaya enchant 300 koin, saldomu *{balance} KOIN*~\n╰━━━━━━━",
    "done": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ *{pet}* berkilau kena enchant! Level pet sekarang *{level}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "enchant": {
    "noPet": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Enchant is for pets, you have no pet yet. Adopt one with .adopt~\n╰━━━━━━━",
    "noCrystal": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Needs 1 crystal in your inventory. Crystals come from mining and dungeons~\n╰━━━━━━━",
    "poor": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ Enchant costs 300 coins, your balance is *{balance} COINS*~\n╰━━━━━━━",
    "done": "╭─❏ ✨ 「 *ENCHANT* 」\n┊ *{pet}* glows from the enchant! Pet level is now *{level}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".enchant", expect: /enchant|kristal|crystal|pet/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.pet) return ctx.reply(ctx.t('enchant.noPet'))
  profile.inventory = profile.inventory ?? {}
  if ((profile.inventory.kristal ?? 0) < 1) return ctx.reply(ctx.t('enchant.noCrystal'))
  if ((profile.balance ?? 0) < 300) return ctx.reply(ctx.t('enchant.poor', { balance: profile.balance ?? 0 }))
  profile.inventory.kristal -= 1
  if (profile.inventory.kristal <= 0) delete profile.inventory.kristal
  profile.balance = (profile.balance ?? 0) - 300
  const pet = { ...profile.pet }
  pet.xp = (pet.xp ?? 0) + 60
  pet.level = 1 + Math.floor(pet.xp / 100)
  profile.pet = pet
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('enchant.done', { pet: pet.name, level: pet.level, balance: profile.balance }))
}
