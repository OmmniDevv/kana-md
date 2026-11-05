// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "attacktitan",
  alias: [],
  category: "rpg",
  description: { id: "Serang titan: dijalankan sebagai dungeon 3 gelombang (bagian tubuh titan) lewat mesin dungeon", en: "Attack the titan: runs as a 3-wave dungeon (titan body parts) via the dungeon engine" },
  usage: ".attacktitan",
  example: ".attacktitan",
  cooldown: 5,
}

export const i18n = {
  id: { "attacktitan": {
    "jailed": "╭─❏ 🚔 「 *ATTACKTITAN* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ATTACKTITAN* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *ATTACKTITAN* 」\n┊ Kamu mengiris bagian titan gelombang demi gelombang.\n┊ {lines}\n┊ GELOMBANG BERSIH: *{waves}/3* | TOTAL: *+{coins} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *ATTACKTITAN* 」\n┊ Titan terlalu kuat, seranganmu mental. Naikkan power dulu~\n┊ POWER KAMU: *{power}* | SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "attacktitan": {
    "jailed": "╭─❏ 🚔 「 *ATTACKTITAN* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *ATTACKTITAN* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *ATTACKTITAN* 」\n┊ You sliced through the titan part after part, wave after wave.\n┊ {lines}\n┊ WAVES CLEARED: *{waves}/3* | TOTAL: *+{coins} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *ATTACKTITAN* 」\n┊ The titan is too strong, your attack bounced off. Raise your power first~\n┊ YOUR POWER: *{power}* | BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".attacktitan", expect: /gelombang|wave|power|energi/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('attacktitan.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 25) return ctx.reply(ctx.t('attacktitan.lowEnergy', { energy, need: 25 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 25 })
  const run = await runDungeon(ctx.storage, ctx.senderDigits)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (run.cleared === 0) return ctx.reply(ctx.t('attacktitan.wiped', { power: run.power, balance: fresh.balance ?? 0 }))
  const lines = run.rewards.map((r, i) => {
    const def = MONSTERS.find((m) => m.id === r.monster)
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : r.monster
    return 'Wave ' + (i + 1) + ': ' + nm + ' (+' + r.coins + (r.item ? ', drop ' + r.item : '') + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('attacktitan.done', { lines, waves: run.cleared, coins: run.totalCoins, balance: fresh.balance ?? 0 }))
}
