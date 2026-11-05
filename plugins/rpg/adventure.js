// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "adventure",
  alias: [],
  category: "rpg",
  description: { id: "Petualangan dungeon 3 gelombang lewat mesin dungeon: monster, koin, drop item", en: "3-wave dungeon adventure via the dungeon engine: monsters, coins, item drops" },
  usage: ".adventure",
  example: ".adventure",
  cooldown: 5,
}

export const i18n = {
  id: { "adventure": {
    "jailed": "╭─❏ 🚔 「 *ADVENTURE* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ADVENTURE* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *ADVENTURE* 」\n┊ Petualanganmu menembus gelombang demi gelombang.\n┊ {lines}\n┊ GELOMBANG BERSIH: *{waves}/3* | TOTAL: *+{coins} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *ADVENTURE* 」\n┊ Gelombang pertama saja sudah menghabiskanmu. Perkuat power lewat .skill dan senjata~\n┊ POWER KAMU: *{power}* | SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "adventure": {
    "jailed": "╭─❏ 🚔 「 *ADVENTURE* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ADVENTURE* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *ADVENTURE* 」\n┊ Your adventure pushed through wave after wave.\n┊ {lines}\n┊ WAVES CLEARED: *{waves}/3* | TOTAL: *+{coins} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *ADVENTURE* 」\n┊ The first wave already wiped you. Raise your power via .skill and weapons~\n┊ YOUR POWER: *{power}* | BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".adventure", expect: /gelombang|wave|power|energi/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('adventure.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('adventure.lowEnergy', { energy, need: 20 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 20 })
  const run = await runDungeon(ctx.storage, ctx.senderDigits)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (run.cleared === 0) return ctx.reply(ctx.t('adventure.wiped', { power: run.power, balance: fresh.balance ?? 0 }))
  const lines = run.rewards.map((r, i) => {
    const def = MONSTERS.find((m) => m.id === r.monster)
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : r.monster
    return 'Wave ' + (i + 1) + ': ' + nm + ' (+' + r.coins + (r.item ? ', drop ' + r.item : '') + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('adventure.done', { lines, waves: run.cleared, coins: run.totalCoins, balance: fresh.balance ?? 0 }))
}
