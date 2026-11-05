// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "blacksmith",
  alias: [],
  category: "rpg",
  description: { id: "Pandai besi: tempa item dari bahan inventaris memakai resep engine sungguhan", en: "Blacksmith: forge items from inventory materials using real engine recipes" },
  usage: ".blacksmith [resep]",
  example: ".blacksmith [resep]",
  cooldown: 5,
}

export const i18n = {
  id: { "blacksmith": {
    "list": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ RESEP TEMPA:\n┊ {list}\n┊ TEMPA: *.blacksmith <nama>*\n╰━━━━━━━",
    "missing": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ Bahan kurang. Perlu: *{needs}*. Kumpulkan dari .tambang/.nebang~\n╰━━━━━━━",
    "unknown": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ Resep *{item}* tidak ada~\n╰━━━━━━━",
    "done": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ TEMPAAN JADI: *{item}* masuk inventaris!\n┊ INVENTARIS: {inv}\n╰━━━━━━━"
} },
  en: { "blacksmith": {
    "list": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ FORGE RECIPES:\n┊ {list}\n┊ FORGE: *.blacksmith <name>*\n╰━━━━━━━",
    "missing": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ Missing materials. Needs: *{needs}*. Gather them from .tambang/.nebang~\n╰━━━━━━━",
    "unknown": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ Recipe *{item}* does not eXist~\n╰━━━━━━━",
    "done": "╭─❏ 🔨 「 *BLACKSMITH* 」\n┊ FORGED: *{item}* added to your inventory!\n┊ INVENTORY: {inv}\n╰━━━━━━━"
} },
}

export const test = { input: ".blacksmith", expect: /resep tempa|forge recipes|blacksmith/i }
export async function handler(ctx) {

  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  if (!arg) {
    const list = Object.values(RECIPE_MAP).map((r) => {
      const needs = Object.entries(r.needs).map(([id, q]) => id + ' x' + q).join(', ')
      return '• ' + r.id + ' (' + needs + ')'
    }).join('\n┊ ')
    return ctx.reply(ctx.t('blacksmith.list', { list }))
  }
  const result = await craftItem(ctx.storage, ctx.senderDigits, arg)
  if (!result.ok) {
    if (result.reason === 'missing_materials') {
      const needs = Object.entries(result.needs).map(([id, q]) => id + ' x' + q).join(', ')
      return ctx.reply(ctx.t('blacksmith.missing', { needs }))
    }
    return ctx.reply(ctx.t('blacksmith.unknown', { item: arg }))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const invList = Object.entries(profile.inventory ?? {}).map(([id, q]) => id + ' x' + q).join(', ') || '-'
  return ctx.reply(ctx.t('blacksmith.done', { item: arg, inv: invList }))
}
