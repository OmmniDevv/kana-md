// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { reasonText } from '../../src/rpg/reasons.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "trading",
  alias: [],
  category: "rpg",
  description: { id: "Jual barang inventaris dengan harga data item lewat mesin jual engine (bonus pedagang berlaku)", en: "Sell inventory items at item-data prices via the engine sell system (merchant bonus applies)" },
  usage: ".trading <item> [jumlah]",
  example: ".trading <item> [jumlah]",
  cooldown: 5,
}

export const i18n = {
  id: { "trading": {
    "usage": "╭─❏ 🧮 「 *TRADING* 」\n┊ Jual barang inventaris: *.trading <item> [jumlah]*. Isi karungmu: .karung\n╰━━━━━━━",
    "fail": "╭─❏ 🧮 「 *TRADING* 」\n┊ Penjualan *{item}* gagal ({reason})~\n╰━━━━━━━",
    "done": "╭─❏ 🧮 「 *TRADING* 」\n┊ TERJUAL: *{item} X{qty}* = *+{gain} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "trading": {
    "usage": "╭─❏ 🧮 「 *TRADING* 」\n┊ Sell inventory items: *.trading <item> [qty]*. Your sack: .karung\n╰━━━━━━━",
    "fail": "╭─❏ 🧮 「 *TRADING* 」\n┊ Selling *{item}* failed ({reason})~\n╰━━━━━━━",
    "done": "╭─❏ 🧮 「 *TRADING* 」\n┊ SOLD: *{item} X{qty}* = *+{gain} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".trading batu 1", expect: /terjual|sold|gagal|failed|jual barang/i }
export async function handler(ctx) {

  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  const qty = Math.max(1, Math.floor(Number((ctx.args ?? [])[1]) || 1))
  if (!arg) return ctx.reply(ctx.t('trading.usage'))
  const result = await sellItem(ctx.storage, ctx.senderDigits, arg, qty)
  if (!result.ok) return ctx.reply(ctx.t('trading.fail', { reason: reasonText(result.reason, ctx.lang), item: arg }))
  const def = ITEM_MAP[arg]
  const itemName = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : arg
  return ctx.reply(ctx.t('trading.done', { item: itemName, qty: result.qty, gain: result.gain, balance: result.balance }))
}
