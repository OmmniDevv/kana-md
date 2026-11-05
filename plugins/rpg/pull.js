// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "pull",
  alias: [],
  category: "rpg",
  description: { id: "Gacha pull 150 koin: satu item acak berbobot rarity masuk inventaris", en: "150 coin gacha pull: one rarity-weighted random item for your inventory" },
  usage: ".pull",
  example: ".pull",
  cooldown: 5,
}

export const i18n = {
  id: { "pull": {
    "jailed": "╭─❏ 🚔 「 *PULL* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *PULL* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━",
    "done": "╭─❏ 🎁 「 *GACHA PULL* 」\n┊ Kamu menarik satu kapsul seharga 150 koin dan dapat: *{emoji} {item}*\n┊ Barang masuk inventaris. SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "pull": {
    "jailed": "╭─❏ 🚔 「 *PULL* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "poor": "╭─❏ 💸 「 *PULL* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━",
    "done": "╭─❏ 🎁 「 *GACHA PULL* 」\n┊ You pulled one 150 coin capsule and got: *{emoji} {item}*\n┊ The item is in your inventory. BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".pull", expect: /kapsul|capsule|saldo/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('pull.jailed', { minutes: jailMinutesLeft(profile) }))
  const cost = 150
  if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('pull.poor', { balance: profile.balance ?? 0, bet: cost }))
  profile.balance = (profile.balance ?? 0) - cost
  const pool = ['kristal', 'emas', 'besi', 'berlian', 'telurmisterius', 'ramuan', 'kain', 'tanduk']
  const weights = [3, 6, 10, 1, 1, 8, 10, 5]
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  let got = pool[pool.length - 1]
  for (let i = 0; i < pool.length; i++) { roll -= weights[i]; if (roll <= 0) { got = pool[i]; break } }
  profile.inventory = profile.inventory ?? {}
  profile.inventory[got] = (profile.inventory[got] ?? 0) + 1
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  await addXp(ctx.storage, ctx.senderDigits, 5)
  const def = ITEM_MAP[got]
  const itemName = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : got
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('pull.done', { item: itemName, emoji: def?.emoji ?? '🎁', balance: fresh.balance ?? 0 }))
}
