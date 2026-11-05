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
  name: "resto",
  alias: [],
  category: "rpg",
  description: { id: "Resto: pesan makanan pet dan ramuan, tersimpan di inventaris lewat mesin beli engine", en: "Resto: order pet food and potions, stored in inventory via the engine buy system" },
  usage: ".resto [item]",
  example: ".resto [item]",
  cooldown: 5,
}

export const i18n = {
  id: { "resto": {
    "list": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ MENU HARI INI:\n┊ {list}\n┊ PESAN: *.resto <nama>* (tersimpan di inventaris, makan pakai .eat)\n╰━━━━━━━",
    "unknown": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ *{item}* tidak ada di menu~\n╰━━━━━━━",
    "fail": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ Pesanan gagal ({reason}). Harganya *{cost} KOIN*.\n╰━━━━━━━",
    "done": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ *{item}* tersaji! Tersimpan di inventaris seharga *{cost} KOIN*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "resto": {
    "list": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ TODAY'S MENU:\n┊ {list}\n┊ ORDER: *.resto <name>* (stored in inventory, eat with .eat)\n╰━━━━━━━",
    "unknown": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ *{item}* is not on the menu~\n╰━━━━━━━",
    "fail": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ Order failed ({reason}). It costs *{cost} COINS*.\n╰━━━━━━━",
    "done": "╭─❏ 🍽️ 「 *RESTO* 」\n┊ *{item}* served! Stored in your inventory for *{cost} COINS*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".resto", expect: /menu hari ini|today's menu|resto/i }
export async function handler(ctx) {

  const ids = ['makananpet', 'ramuan']
  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  if (!arg) {
    const list = ids.map((id) => '• ' + (ITEM_MAP[id]?.emoji ?? '') + ' ' + id + ' : ' + SHOP_MAP[id].price + ' koin').join('\n┊ ')
    return ctx.reply(ctx.t('resto.list', { list }))
  }
  if (!ids.includes(arg)) return ctx.reply(ctx.t('resto.unknown', { item: arg }))
  const result = await buyItem(ctx.storage, ctx.senderDigits, arg, 1)
  if (!result.ok) return ctx.reply(ctx.t('resto.fail', { reason: reasonText(result.reason, ctx.lang), cost: result.cost ?? SHOP_MAP[arg].price }))
  return ctx.reply(ctx.t('resto.done', { item: arg, cost: result.cost, balance: result.balance }))
}
