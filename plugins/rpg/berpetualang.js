// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { gather, runDungeon } from '../../src/rpg/engine.js'
import { ITEM_MAP, MONSTERS } from '../../src/rpg/data.js'
export const config = {
  name: "berpetualang",
  alias: [],
  category: "rpg",
  description: { id: "Berpetualang di dungeon 3 gelombang lewat mesin dungeon", en: "Adventuring in a 3-wave dungeon via the dungeon engine" },
  usage: ".berpetualang",
  example: ".berpetualang",
  cooldown: 5,
}

export const i18n = {
  id: { "berpetualang": {
    "jailed": "╭─❏ 🚔 「 *BERPETUALANG* 」\n┊ Kamu masih dipenjara, sisa *{minutes} menit*. Aksi ini ditahan dulu~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERPETUALANG* 」\n┊ Energimu *{energy}*, perlu *{need}*. Makan (.eat), meditasi (.meditation), atau beli energi (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *BERPETUALANG* 」\n┊ Langkah petualanganmu mantap sampai akhir gelombang.\n┊ {lines}\n┊ GELOMBANG BERSIH: *{waves}/3* | TOTAL: *+{coins} KOIN*\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *BERPETUALANG* 」\n┊ Kamu tumbang di gelombang pertama. Naikkan level dan power dulu~\n┊ POWER KAMU: *{power}* | SALDO: *{balance} KOIN*\n╰━━━━━━━"
} },
  en: { "berpetualang": {
    "jailed": "╭─❏ 🚔 「 *BERPETUALANG* 」\n┊ You are still jailed, *{minutes} minutes* left. This action is on hold~\n╰━━━━━━━",
    "lowEnergy": "╭─❏ 🔋 「 *BERPETUALANG* 」\n┊ Your energy is *{energy}*, needs *{need}*. Eat (.eat), meditate (.meditation), or buy energy (.buyenergi)~\n╰━━━━━━━",
    "done": "╭─❏ 🗺️ 「 *BERPETUALANG* 」\n┊ Your adventure steps stayed strong to the last wave.\n┊ {lines}\n┊ WAVES CLEARED: *{waves}/3* | TOTAL: *+{coins} COINS*\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wiped": "╭─❏ 💀 「 *BERPETUALANG* 」\n┊ You fell in the first wave. Raise your level and power first~\n┊ YOUR POWER: *{power}* | BALANCE: *{balance} COINS*\n╰━━━━━━━"
} },
}

export const test = { input: ".berpetualang", expect: /gelombang|wave|power|energi/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (isJailed(profile)) return ctx.reply(ctx.t('berpetualang.jailed', { minutes: jailMinutesLeft(profile) }))
  const energy = energyOf(profile)
  if (energy < 20) return ctx.reply(ctx.t('berpetualang.lowEnergy', { energy, need: 20 }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - 20 })
  const run = await runDungeon(ctx.storage, ctx.senderDigits)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  if (run.cleared === 0) return ctx.reply(ctx.t('berpetualang.wiped', { power: run.power, balance: fresh.balance ?? 0 }))
  const lines = run.rewards.map((r, i) => {
    const def = MONSTERS.find((m) => m.id === r.monster)
    const nm = def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : r.monster
    return 'Wave ' + (i + 1) + ': ' + nm + ' (+' + r.coins + (r.item ? ', drop ' + r.item : '') + ')'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('berpetualang.done', { lines, waves: run.cleared, coins: run.totalCoins, balance: fresh.balance ?? 0 }))
}
