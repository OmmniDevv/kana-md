// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka generik. Sekarang pertarungan boss sungguhan: boss diambil dari
// monster tier atas data.js dengan power diskalakan levelmu, ditentukan
// power tempur profil nyata, berbiaya energi 20, hadiah koin besar dan
// peluang drop item boss. Beda dari .boss yang harian: ini bisa diulang
// selama energi cukup.
import { getProfile, updateProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { MONSTERS, ITEM_MAP } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'

export const config = {
  name: 'bossbattle',
  alias: [],
  category: 'rpg',
  description: { id: 'Lawan boss tier atas dengan power tempur nyatamu: hadiah besar, berbiaya energi', en: 'Fight a top tier boss with your real battle power: big rewards, costs energy' },
  usage: '.bossbattle',
  example: '.bossbattle',
  cooldown: 30,
}

export const ENERGY_COST = 20
const BOSS_POOL = ['golem', 'nagakecil', 'troll']

export const i18n = {
  id: {
    bossbattle: {
      lowEnergy: '╭─❏ 🔋 「 *BOSSBATTLE* 」\n┊ Energimu *{energy}*, boss battle butuh *{need}*. Pulihkan pakai .heal~\n╰━━━━━━━',
      win: '╭─❏ 👑 「 *BOSSBATTLE* 」\n┊ Boss {emoji} *{monster}* (power {mpower}) TUMBANG!\n┊ Power kamu *{power}* | Hadiah: *+{coins} koin*, *+{xp} XP*{drop}\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      lose: '╭─❏ 👑 「 *BOSSBATTLE* 」\n┊ Boss {emoji} *{monster}* (power {mpower}) terlalu kuat buat power kamu *{power}*. Latih stat pakai .buyattack dkk~\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    bossbattle: {
      lowEnergy: '╭─❏ 🔋 「 *BOSSBATTLE* 」\n┊ Your energy is *{energy}*, a boss battle needs *{need}*. Restore with .heal~\n╰━━━━━━━',
      win: '╭─❏ 👑 「 *BOSSBATTLE* 」\n┊ Boss {emoji} *{monster}* (power {mpower}) IS DOWN!\n┊ Your power *{power}* | Reward: *+{coins} coins*, *+{xp} XP*{drop}\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      lose: '╭─❏ 👑 「 *BOSSBATTLE* 」\n┊ Boss {emoji} *{monster}* (power {mpower}) is too strong for your power *{power}*. Train stats with .buyattack and friends~\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.bossbattle', expect: /tumbang|terlalu kuat|energimu|is down|too strong|your energy/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy < ENERGY_COST) return ctx.reply(ctx.t('bossbattle.lowEnergy', { energy, need: ENERGY_COST }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - ENERGY_COST })
  const level = levelFromXp(profile.xp ?? 0)
  const boss = MONSTERS.find((m) => m.id === BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)])
  const bossPower = boss.power + level * 2
  const myPower = powerOf(profile)
  const roll = myPower + Math.floor(Math.random() * 21)
  const name = ctx.lang === 'en' ? boss.name.en : boss.name.id
  if (roll < bossPower) {
    const fresh = await getProfile(ctx.storage, ctx.senderDigits)
    return ctx.reply(ctx.t('bossbattle.lose', { emoji: boss.emoji, monster: name, mpower: bossPower, power: myPower, balance: fresh.balance ?? 0 }))
  }
  const coins = (boss.reward.coins[0] + Math.floor(Math.random() * (boss.reward.coins[1] - boss.reward.coins[0] + 1))) * 2
  const xp = 25 + Math.floor(bossPower / 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  const patch = { balance: (fresh.balance ?? 0) + coins }
  let dropText = ''
  if (boss.reward.item && Math.random() < 0.5) {
    const inv = { ...(fresh.inventory ?? {}) }
    inv[boss.reward.item] = (inv[boss.reward.item] ?? 0) + 1
    patch.inventory = inv
    const def = ITEM_MAP[boss.reward.item]
    dropText = ctx.t('bossbattle.drop', { item: def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : boss.reward.item })
  }
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  const after = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('bossbattle.win', {
    emoji: boss.emoji, monster: name, mpower: bossPower, power: myPower,
    coins, xp, drop: dropText, balance: after.profile.balance ?? 0,
  }))
}
