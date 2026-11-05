// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "expedition",
  alias: [],
  category: "rpg",
  description: { id: "Ekspedisi dungeon 3 gelombang lewat mesin dungeon", en: "Dungeon expedition, 3 waves via the dungeon engine" },
  usage: ".expedition",
  example: ".expedition",
  cooldown: 5,
}

export const i18n = {
  id: { "expedition": {
    "jailed": "╭─❏ 🚔 「 *EXPEDITION* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *EXPEDITION* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *EXPEDITION* 」\n┊ Ekspedisimu pulang membawa rampasan gelombang.\n┊ {lines}\n┊ GELOMBANG BERSIH: *{waves}/3* | TOTAL: *+{coins} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *EXPEDITION* 」\n┊ Ekspedisi mundur di gelombang pertama. Power belum cukup~\n┊ POWER KAMU: *{power}* | SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "expedition": {
    "jailed": "╭─❏ 🚔 「 *EXPEDITION* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *EXPEDITION* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *EXPEDITION* 」\n┊ Your eXpedition returned with wave loot.\n┊ {lines}\n┊ WAVES CLEARED: *{waves}/3* | TOTAL: *+{coins} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *EXPEDITION* 」\n┊ The eXpedition retreated at the first wave. Power is not enough yet~\n┊ YOUR POWER: *{power}* | BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".expedition", expect: /gelombang|wave|power|energi/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('expedition.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('expedition.lowEnergy', { energy, need: 20 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 20 })
  const run = await runDungeon(ctx.storage, ctx.senderDigits)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (run.cleared === 0) return ctx.reply(ctx.t('expedition.wiped', { power: run.power, balance: fresh.balance ?? 0 }))
  const lines = run.rewards.map((r, i) => {
    const def = MONSTERS.find((m) => m.id === r.monster)
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : r.monster
    return 'Wave ' + (i + 1) + ': ' + nm + ' (+' + r.coins + (r.item ? ', drop ' + r.item : '') + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('expedition.done', { lines, waves: run.cleared, coins: run.totalCoins, balance: fresh.balance ?? 0 }))
}
