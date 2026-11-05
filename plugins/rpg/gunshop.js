// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "gunshop",
  alias: [],
  category: "rpg",
  description: { id: "Toko senjata dan alat: daftar harga nyata dari data toko, membeli memakai mesin beli engine", en: "Weapon and tool shop: real prices from shop data, buying uses the engine buy system" },
  usage: ".gunshop [item]",
  example: ".gunshop [item]",
  cooldown: 5,
}

export const i18n = {
  id: { "gunshop": {
    "list": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ DAFTAR SENJATA & ALAT:\n┊ {list}\n┊ BELI: *.gunshop <nama>*\n╰━━━━━━━",
    "unknown": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ *{item}* tidak dijual di sini~\n╰━━━━━━━",
    "fail": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ Pembelian gagal ({reason}). Harganya *{cost} KOIN*.\n╰━━━━━━━",
    "done": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ *{item}* terbeli seharga *{cost} KOIN*, masuk inventaris!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "gunshop": {
    "list": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ WEAPONS & TOOLS:\n┊ {list}\n┊ BUY: *.gunshop <name>*\n╰━━━━━━━",
    "unknown": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ *{item}* is not sold here~\n╰━━━━━━━",
    "fail": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ Purchase failed ({reason}). It costs *{cost} COINS*.\n╰━━━━━━━",
    "done": "╭─❏ 🔫 「 *GUNSHOP* 」\n┊ *{item}* bought for *{cost} COINS*, added to your inventory!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".gunshop", expect: /daftar senjata|weapons|gunshop/i }
export async function handler(ctx) {

  const ids = ['pedangbesi', 'pedangkayu', 'perisai', 'beliung', 'joran']
  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  if (!arg) {
    const list = ids.map((id) => '• ' + (ITEM_MAP[id]?.emoji ?? '') + ' ' + id + ' : ' + SHOP_MAP[id].price + ' koin').join('\n┊ ')
    return ctx.reply(ctx.t('gunshop.list', { list }))
  }
  if (!ids.includes(arg)) return ctx.reply(ctx.t('gunshop.unknown', { item: arg }))
  const result = await buyItem(ctx.storage, ctx.senderDigits, arg, 1)
  if (!result.ok) return ctx.reply(ctx.t('gunshop.fail', { reason: result.reason, cost: result.cost ?? SHOP_MAP[arg].price }))
  return ctx.reply(ctx.t('gunshop.done', { item: arg, cost: result.cost, balance: result.balance }))
}
