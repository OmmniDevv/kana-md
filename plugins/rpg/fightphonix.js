// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka generik. Sekarang pertarungan boss Phoenix bertema dengan mekanik
// bangkit: Phoenix punya dua fase (sesudah kalah pertama ia bangkit
// dengan power lebih tinggi), ditentukan power tempur profil nyata,
// berbiaya energi 18, hadiah koin besar dan peluang drop kristal atau
// telur misterius dari data.js.
import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'

export const config = {
  name: 'fightphonix',
  alias: [],
  category: 'rpg',
  description: { id: 'Lawan boss Phoenix dua fase dengan power tempur nyatamu: ia bangkit sekali dari abu', en: 'Fight the two phase Phoenix boss with your real battle power: it rises once from the ashes' },
  usage: '.fightphonix',
  example: '.fightphonix',
  cooldown: 30,
}

export const ENERGY_COST = 18
export const PHOENIX_POWER = [70, 95]

export const i18n = {
  id: {
    fightphonix: {
      lowEnergy: '╭─❏ 🔋 「 *FIGHTPHONIX* 」\n┊ Energimu *{energy}*, melawan Phoenix butuh *{need}*. Pulihkan pakai .heal~\n╰━━━━━━━',
      win: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ Phoenix fase 1 (power {p1}) tumbang, bangkit dari abu di fase 2 (power {p2}), dan kamu menumbangkannya lagi!\n┊ Power kamu *{power}* | Hadiah: *+{coins} koin*, *+{xp} XP*{drop}\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      phase1Lose: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ Phoenix fase 1 (power {p1}) saja sudah mengalahkan kamu (power *{power}*). Naikkan stat pakai .buyattack dkk~\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      phase2Lose: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ Kamu menumbangkan fase 1, tapi Phoenix bangkit (power {p2}) dan membalas mengalahkan kamu (power *{power}*). Sedikit lagi!\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    fightphonix: {
      lowEnergy: '╭─❏ 🔋 「 *FIGHTPHONIX* 」\n┊ Your energy is *{energy}*, fighting the Phoenix needs *{need}*. Restore with .heal~\n╰━━━━━━━',
      win: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ Phoenix phase 1 (power {p1}) fell, rose from the ashes in phase 2 (power {p2}), and you brought it down again!\n┊ Your power *{power}* | Reward: *+{coins} coins*, *+{xp} XP*{drop}\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      phase1Lose: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ Even Phoenix phase 1 (power {p1}) beat you (power *{power}*). Raise stats with .buyattack and friends~\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      phase2Lose: '╭─❏ 🔥 「 *FIGHTPHONIX* 」\n┊ You downed phase 1, but the Phoenix rose (power {p2}) and beat you back (power *{power}*). So close!\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.fightphonix', expect: /phoenix|energimu|your energy/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy < ENERGY_COST) return ctx.reply(ctx.t('fightphonix.lowEnergy', { energy, need: ENERGY_COST }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - ENERGY_COST })
  const myPower = powerOf(profile)
  const [p1, p2] = PHOENIX_POWER
  const fresh0 = await getProfile(ctx.storage, ctx.senderDigits)
  const balance0 = fresh0.balance ?? 0
  if (myPower + Math.floor(Math.random() * 21) < p1) {
    return ctx.reply(ctx.t('fightphonix.phase1Lose', { p1, power: myPower, balance: balance0 }))
  }
  if (myPower + Math.floor(Math.random() * 21) < p2) {
    return ctx.reply(ctx.t('fightphonix.phase2Lose', { p2, power: myPower, balance: balance0 }))
  }
  const coins = 400 + Math.floor(Math.random() * 301)
  const xp = 40
  const patch = { balance: balance0 + coins }
  let dropText = ''
  if (Math.random() < 0.5) {
    const dropId = Math.random() < 0.5 ? 'kristal' : 'telurmisterius'
    const inv = { ...(fresh0.inventory ?? {}) }
    inv[dropId] = (inv[dropId] ?? 0) + 1
    patch.inventory = inv
    const def = ITEM_MAP[dropId]
    dropText = ctx.t('fightphonix.drop', { item: def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : dropId })
  }
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  const after = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('fightphonix.win', {
    p1, p2, power: myPower, coins, xp, drop: dropText, balance: after.profile.balance ?? 0,
  }))
}
