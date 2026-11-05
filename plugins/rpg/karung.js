// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "karung",
  alias: [],
  category: "rpg",
  description: { id: "Isi karung (inventaris) nyata dengan harga jual tiap barang dan total nilainya", en: "Your real sack (inventory) contents with per-item sell prices and total value" },
  usage: ".karung",
  example: ".karung",
  cooldown: 5,
}

export const i18n = {
  id: { "karung": {
    "empty": "╭─❏ 🎒 「 *KARUNG* 」\n┊ Karungmu kosong. Kumpulkan barang dari .tambang, .mancing, .berkebon~\n╰━━━━━━━",
    "list": "╭─❏ 🎒 「 *KARUNG* 」\n┊ {list}\n┊ TOTAL NILAI JUAL: *{total} KOIN* (jual pakai .trading <item>)\n╰━━━━━━━"
} },
  en: { "karung": {
    "empty": "╭─❏ 🎒 「 *SACK* 」\n┊ Your sack is empty. Gather items from .tambang, .mancing, .berkebon~\n╰━━━━━━━",
    "list": "╭─❏ 🎒 「 *SACK* 」\n┊ {list}\n┊ TOTAL SELL VALUE: *{total} COINS* (sell with .trading <item>)\n╰━━━━━━━"
} },
}

export const test = { input: ".karung", expect: /karungmu kosong|sack is empty|total nilai jual|total sell value/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const inv = profile.inventory ?? {}
  const entries = Object.entries(inv).filter(([, q]) => q > 0)
  if (!entries.length) return ctx.reply(ctx.t('karung.empty'))
  let total = 0
  const list = entries.map(([id, q]) => {
    const def = ITEM_MAP[id]
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : id
    const price = def?.price ?? 0
    total += price * q
    return (def?.emoji ?? '•') + ' ' + nm + ' x' + q + ' (@' + price + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('karung.list', { list, total }))
}
