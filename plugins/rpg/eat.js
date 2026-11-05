// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "eat",
  alias: [],
  category: "rpg",
  description: { id: "Makan makanan dari inventaris untuk memulihkan energi (nilai per makanan berbeda)", en: "Eat food from your inventory to restore energy (each food restores differently)" },
  usage: ".eat [makanan]",
  example: ".eat [makanan]",
  cooldown: 5,
}

export const i18n = {
  id: { "eat": {
    "full": "╭─❏ 🍽️ 「 *EAT* 」\n┊ Energimu sudah penuh (100), simpan makanannya buat nanti~\n╰━━━━━━━",
    "none": "╭─❏ 🍽️ 「 *EAT* 」\n┊ Kamu tidak punya makanan di inventaris. Beli di .resto atau kumpulkan ikan/daging/buah~\n╰━━━━━━━",
    "done": "╭─❏ 🍽️ 「 *EAT* 」\n┊ Nyam~ *{food}* dimakan. Energi sekarang: *{energy}*\n╰━━━━━━━"
} },
  en: { "eat": {
    "full": "╭─❏ 🍽️ 「 *EAT* 」\n┊ Your energy is already full (100), save the food for later~\n╰━━━━━━━",
    "none": "╭─❏ 🍽️ 「 *EAT* 」\n┊ You have no food in your inventory. Buy at .resto or gather fish/meat/fruit~\n╰━━━━━━━",
    "done": "╭─❏ 🍽️ 「 *EAT* 」\n┊ Yum~ *{food}* eaten. Energy now: *{energy}*\n╰━━━━━━━"
} },
}

export const test = { input: ".eat", expect: /dimakan|eaten|tidak punya makanan|no food|penuh/i }
export async function handler(ctx) {

  const FOODS = { kue: 40, ramuan: 100, ikan: 25, daging: 30, buah: 20, ikanmas: 25, udang: 25 }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy >= 100) return ctx.reply(ctx.t('eat.full'))
  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  profile.inventory = profile.inventory ?? {}
  let food = arg && FOODS[arg] !== undefined && (profile.inventory[arg] ?? 0) > 0 ? arg : ''
  if (!food) food = Object.keys(FOODS).find((id) => (profile.inventory[id] ?? 0) > 0) ?? ''
  if (!food) return ctx.reply(ctx.t('eat.none'))
  profile.inventory[food] -= 1
  if (profile.inventory[food] <= 0) delete profile.inventory[food]
  const next = Math.min(100, energy + FOODS[food])
  profile.energy = next
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  const def = ITEM_MAP[food]
  const foodName = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : food
  return ctx.reply(ctx.t('eat.done', { food: foodName, energy: next }))
}
