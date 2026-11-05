// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka acak generik. Sekarang pertarungan nyata melawan monster data.js:
// hasil ditentukan power tempur profilmu (level, alat, pet, stat yang
// dibeli) melawan power monster, memakai energi, dan hadiah koin + XP
// beneran masuk profil.
import { getProfile, updateProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { MONSTERS } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'

export const config = {
  name: 'fight',
  alias: [],
  category: 'rpg',
  description: { id: 'Bertarung lawan monster: ditentukan power tempur nyata profilmu, bukan taruhan angka', en: 'Fight a monster: decided by your real profile battle power, not a number bet' },
  usage: '.fight',
  example: '.fight',
  cooldown: 10,
}

export const ENERGY_COST = 10

export const i18n = {
  id: {
    fight: {
      lowEnergy: '╭─❏ 🔋 「 *FIGHT* 」\n┊ Energimu *{energy}*, butuh *{need}* buat bertarung. Pulihkan pakai .heal atau .istirahat~\n╰━━━━━━━',
      win: '╭─❏ ⚔️ 「 *FIGHT* 」\n┊ Kamu melawan {emoji} *{monster}* (power {mpower})\n┊ Power kamu *{power}* vs monster *{mpower}*: MENANG!\n┊ Hadiah: *+{coins} koin* dan *+{xp} XP* | Saldo: *{balance} koin*\n╰━━━━━━━',
      lose: '╭─❏ ⚔️ 「 *FIGHT* 」\n┊ Kamu melawan {emoji} *{monster}* (power {mpower})\n┊ Power kamu *{power}* vs monster *{mpower}*: kalah kali ini. Naikkan power di .dungeon atau beli stat .buyattack~\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    fight: {
      lowEnergy: '╭─❏ 🔋 「 *FIGHT* 」\n┊ Your energy is *{energy}*, fighting needs *{need}*. Restore with .heal or .istirahat~\n╰━━━━━━━',
      win: '╭─❏ ⚔️ 「 *FIGHT* 」\n┊ You fought {emoji} *{monster}* (power {mpower})\n┊ Your power *{power}* vs monster *{mpower}*: YOU WIN!\n┊ Reward: *+{coins} coins* and *+{xp} XP* | Balance: *{balance} coins*\n╰━━━━━━━',
      lose: '╭─❏ ⚔️ 「 *FIGHT* 」\n┊ You fought {emoji} *{monster}* (power {mpower})\n┊ Your power *{power}* vs monster *{mpower}*: you lose this time. Raise power in .dungeon or buy stats with .buyattack~\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.fight', expect: /menang|kalah kali ini|energimu|you win|you lose|your energy/i }

export function pickMonster(profile, rng = Math.random) {
  const level = levelFromXp(profile.xp ?? 0)
  const maxIdx = Math.min(MONSTERS.length - 1, Math.max(1, Math.floor(level / 2) + 1))
  return MONSTERS[Math.floor(rng() * (maxIdx + 1))]
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy < ENERGY_COST) return ctx.reply(ctx.t('fight.lowEnergy', { energy, need: ENERGY_COST }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - ENERGY_COST })
  const monster = pickMonster(profile)
  const power = powerOf(profile) + Math.floor(Math.random() * 21)
  const basePower = powerOf(profile)
  const name = ctx.lang === 'en' ? monster.name.en : monster.name.id
  if (power < monster.power) {
    const fresh = await getProfile(ctx.storage, ctx.senderDigits)
    return ctx.reply(ctx.t('fight.lose', { emoji: monster.emoji, monster: name, mpower: monster.power, power: basePower, balance: fresh.balance ?? 0 }))
  }
  const coins = monster.reward.coins[0] + Math.floor(Math.random() * (monster.reward.coins[1] - monster.reward.coins[0] + 1))
  const xp = 10 + Math.floor(monster.power / 5)
  const fresh0 = await getProfile(ctx.storage, ctx.senderDigits)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (fresh0.balance ?? 0) + coins })
  const after = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('fight.win', {
    emoji: monster.emoji, monster: name, mpower: monster.power, power: basePower,
    coins, xp, balance: after.profile.balance ?? 0,
  }))
}
