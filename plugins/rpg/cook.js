// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "cook",
  alias: ["cooking"],
  category: "rpg",
  description: { id: "Memasak kue dari padi dan buah memakai resep engine. Alias .cooking", en: "Cook a cake from rice and fruit using the engine recipe. Alias .cooking" },
  usage: ".cook",
  example: ".cook",
  cooldown: 5,
}

export const i18n = {
  id: { "cook": {
    "missing": "╭─❏ 🍳 「 *COOK* 」\n┊ Bahan kurang. Perlu: *{needs}*. Kumpulkan dulu dari aktivitas gather~\n╰━━━━━━━",
    "unknown": "╭─❏ 🍳 「 *COOK* 」\n┊ Resepnya tidak ditemukan~\n╰━━━━━━━",
    "done": "╭─❏ 🍳 「 *COOK* 」\n┊ Kue matang keemasan dan harum.\n┊ STOK DI INVENTARIS: *{qty}*\n╰━━━━━━━"
} },
  en: { "cook": {
    "missing": "╭─❏ 🍳 「 *COOK* 」\n┊ Missing materials. Needs: *{needs}*. Gather them first~\n╰━━━━━━━",
    "unknown": "╭─❏ 🍳 「 *COOK* 」\n┊ The recipe was not found~\n╰━━━━━━━",
    "done": "╭─❏ 🍳 「 *COOK* 」\n┊ The cake baked golden and fragrant.\n┊ STOCK IN INVENTORY: *{qty}*\n╰━━━━━━━"
} },
}

export const test = { input: ".cook", expect: /bahan kurang|missing materials|stok di inventaris|stock in inventory/i }
export async function handler(ctx) {

  const result = await craftItem(ctx.storage, ctx.senderDigits, 'kue')
  if (!result.ok) {
    if (result.reason === 'missing_materials') {
      const needs = Object.entries(result.needs).map(([id, q]) => id + ' x' + q).join(', ')
      return ctx.reply(ctx.t('cook.missing', { needs }))
    }
    return ctx.reply(ctx.t('cook.unknown'))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const qty = (profile.inventory ?? {})['kue'] ?? 0
  return ctx.reply(ctx.t('cook.done', { qty }))
}
