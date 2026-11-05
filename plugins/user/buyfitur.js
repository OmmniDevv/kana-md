// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { limitState } from '../../src/services/user-service.js'
import { buyItem } from '../../src/rpg/engine.js'
export const config = {
  name: "buyfitur",
  alias: [],
  category: "user",
  description: { id: "Beli fitur berbayar koin: tambah limit, isi energi, makanan pet; semua efeknya nyata", en: "Buy coin-paid features: extra limit, energy refill, pet food; all effects are real" },
  usage: ".buyfitur [nama]",
  example: ".buyfitur [nama]",
  cooldown: 5,
}

export const i18n = {
  id: { "buyfitur": {
    "list": "╭─❏ 🛒 「 *BELI FITUR* 」 SALDO: *{balance} KOIN*\n┊ • limit : +10 limit hari ini (300 koin)\n┊ • energi : isi energi penuh (250 koin)\n┊ • petfood : 2X makanan pet (200 koin)\n┊ BELI: *.buyfitur <nama>*\n╰━━━━━━━",
    "poor": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ Harganya *{cost} KOIN*, saldomu *{balance} KOIN*~\n╰━━━━━━━",
    "unknown": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ Fitur *{item}* tidak dijual~\n╰━━━━━━━",
    "full": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ Energimu sudah penuh~\n╰━━━━━━━",
    "limitDone": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ +10 limit masuk! Limitmu sekarang *{left}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "energiDone": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ Energi terisi penuh (100)!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "petfoodDone": "╭─❏ 🛒 「 *BELI FITUR* 」\n┊ 2X makanan pet masuk inventaris!\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "buyfitur": {
    "list": "╭─❏ 🛒 「 *BUY FEATURE* 」 BALANCE: *{balance} COINS*\n┊ • limit : +10 limit today (300 coins)\n┊ • energi : full energy refill (250 coins)\n┊ • petfood : 2X pet food (200 coins)\n┊ BUY: *.buyfitur <name>*\n╰━━━━━━━",
    "poor": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ It costs *{cost} COINS*, your balance is *{balance} COINS*~\n╰━━━━━━━",
    "unknown": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ Feature *{item}* is not sold~\n╰━━━━━━━",
    "full": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ Your energy is already full~\n╰━━━━━━━",
    "limitDone": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ +10 limit added! Your limit is now *{left}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "energiDone": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ Energy fully refilled (100)!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "petfoodDone": "╭─❏ 🛒 「 *BUY FEATURE* 」\n┊ 2X pet food added to your inventory!\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".buyfitur", expect: /beli fitur|buy feature|limit|petfood/i }
export async function handler(ctx) {

  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!arg) return ctx.reply(ctx.t('buyfitur.list', { balance: profile.balance ?? 0 }))
  if (arg === 'limit') {
    const cost = 300
    if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('buyfitur.poor', { balance: profile.balance ?? 0, cost }))
    const state = limitState(profile)
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) - cost, limitDate: state.date, limitLeft: state.left + 10 })
    return ctx.reply(ctx.t('buyfitur.limitDone', { left: state.left + 10, balance: (profile.balance ?? 0) - cost }))
  }
  if (arg === 'energi') {
    const cost = 250
    if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('buyfitur.poor', { balance: profile.balance ?? 0, cost }))
    if (energyOf(profile) >= 100) return ctx.reply(ctx.t('buyfitur.full'))
    profile.balance = (profile.balance ?? 0) - cost
    profile.energy = 100
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('buyfitur.energiDone', { balance: profile.balance }))
  }
  if (arg === 'petfood') {
    const result = await buyItem(ctx.storage, ctx.senderDigits, 'makananpet', 2)
    if (!result.ok) return ctx.reply(ctx.t('buyfitur.poor', { balance: profile.balance ?? 0, cost: result.cost ?? 200 }))
    return ctx.reply(ctx.t('buyfitur.petfoodDone', { balance: result.balance }))
  }
  return ctx.reply(ctx.t('buyfitur.unknown', { item: arg }))
}
