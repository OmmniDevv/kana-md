// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "alchemy",
  alias: [],
  category: "rpg",
  description: { id: "Alkimia: racik ramuan dari bunga dan buah memakai resep engine", en: "Alchemy: brew a potion from flowers and fruit using the engine recipe" },
  usage: ".alchemy",
  example: ".alchemy",
  cooldown: 5,
}

export const i18n = {
  id: { "alchemy": {
    "missing": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ Bahan kurang. Perlu: *{needs}*. Kumpulkan dulu dari aktivitas gather~\n╰━━━━━━━",
    "unknown": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ Resepnya tidak ditemukan~\n╰━━━━━━━",
    "done": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ Ramuanmu jadi dan bergelembung ungu.\n┊ STOK DI INVENTARIS: *{qty}*\n╰━━━━━━━"
} },
  en: { "alchemy": {
    "missing": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ Missing materials. Needs: *{needs}*. Gather them first~\n╰━━━━━━━",
    "unknown": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ The recipe was not found~\n╰━━━━━━━",
    "done": "╭─❏ ⚗️ 「 *ALCHEMY* 」\n┊ Your potion is done and bubbling purple.\n┊ STOCK IN INVENTORY: *{qty}*\n╰━━━━━━━"
} },
}

export const test = { input: ".alchemy", expect: /bahan kurang|missing materials|stok di inventaris|stock in inventory/i }
export async function handler(ctx) {

  const result = await craftItem(ctx.storage, ctx.senderDigits, 'ramuan')
  if (!result.ok) {
    if (result.reason === 'missing_materials') {
      const needs = Object.entries(result.needs).map(([id, q]) => id + ' x' + q).join(', ')
      return ctx.reply(ctx.t('alchemy.missing', { needs }))
    }
    return ctx.reply(ctx.t('alchemy.unknown'))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const qty = (profile.inventory ?? {})['ramuan'] ?? 0
  return ctx.reply(ctx.t('alchemy.done', { qty }))
}
