// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka generik. Sekarang battle bertema Minecraft yang nyata: mob
// Minecraft (Creeper, Enderman, Warden, Ender Dragon) dilawan dengan
// power tempur profilmu (stat pedang/perisai dari inventaris ikut
// dihitung powerOf), berbiaya energi, dan menang memberi koin, XP, dan
// peluang drop besi/berlian dari data.js.
import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'

export const config = {
  name: 'minecraftbattle',
  alias: [],
  category: 'rpg',
  description: { id: 'Battle lawan mob Minecraft dengan power tempur nyatamu: drop besi dan berlian', en: 'Battle Minecraft mobs with your real battle power: iron and diamond drops' },
  usage: '.minecraftbattle',
  example: '.minecraftbattle',
  cooldown: 15,
}

export const ENERGY_COST = 12

export const MOBS = [
  { id: 'Zombie', emoji: '🧟', power: 12, coins: [30, 70] },
  { id: 'Skeleton', emoji: '💀', power: 22, coins: [50, 100] },
  { id: 'Creeper', emoji: '💥', power: 34, coins: [70, 140], drop: 'besi' },
  { id: 'Enderman', emoji: '👾', power: 55, coins: [120, 220], drop: 'besi' },
  { id: 'Warden', emoji: '🦏', power: 85, coins: [200, 380], drop: 'berlian' },
  { id: 'Ender Dragon', emoji: '🐉', power: 120, coins: [350, 650], drop: 'berlian' },
]

export const i18n = {
  id: {
    minecraftbattle: {
      lowEnergy: '╭─❏ 🔋 「 *MINECRAFTBATTLE* 」\n┊ Energimu *{energy}*, butuh *{need}* buat masuk dunia Minecraft. Pulihkan pakai .heal~\n╰━━━━━━━',
      win: '╭─❏ ⛏️ 「 *MINECRAFTBATTLE* 」\n┊ {emoji} *{mob}* (power {mpower}) berhasil kamu kalahkan! Power kamu *{power}*\n┊ Hadiah: *+{coins} koin*, *+{xp} XP*{drop}\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      lose: '╭─❏ ⛏️ 「 *MINECRAFTBATTLE* 」\n┊ {emoji} *{mob}* (power {mpower}) mengalahkan kamu (power *{power}*). Craft pedang besi pakai .craft dulu yaa~\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    minecraftbattle: {
      lowEnergy: '╭─❏ 🔋 「 *MINECRAFTBATTLE* 」\n┊ Your energy is *{energy}*, entering the Minecraft world needs *{need}*. Restore with .heal~\n╰━━━━━━━',
      win: '╭─❏ ⛏️ 「 *MINECRAFTBATTLE* 」\n┊ {emoji} *{mob}* (power {mpower}) defeated! Your power *{power}*\n┊ Reward: *+{coins} coins*, *+{xp} XP*{drop}\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      drop: ' | Drop: *{item}*',
      lose: '╭─❏ ⛏️ 「 *MINECRAFTBATTLE* 」\n┊ {emoji} *{mob}* (power {mpower}) beat you (power *{power}*). Craft an iron sword with .craft first~\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.minecraftbattle', expect: /minecraftbattle|mob|power kamu|your power|energimu/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy < ENERGY_COST) return ctx.reply(ctx.t('minecraftbattle.lowEnergy', { energy, need: ENERGY_COST }))
  await updateProfile(ctx.storage, ctx.senderDigits, { energy: energy - ENERGY_COST })
  const myPower = powerOf(profile)
  const reachable = MOBS.filter((m) => m.power <= myPower + 40)
  const mob = reachable[Math.floor(Math.random() * reachable.length)] ?? MOBS[0]
  const roll = myPower + Math.floor(Math.random() * 21)
  if (roll < mob.power) {
    const fresh = await getProfile(ctx.storage, ctx.senderDigits)
    return ctx.reply(ctx.t('minecraftbattle.lose', { emoji: mob.emoji, mob: mob.id, mpower: mob.power, power: myPower, balance: fresh.balance ?? 0 }))
  }
  const coins = mob.coins[0] + Math.floor(Math.random() * (mob.coins[1] - mob.coins[0] + 1))
  const xp = 10 + Math.floor(mob.power / 4)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  const patch = { balance: (fresh.balance ?? 0) + coins }
  let dropText = ''
  if (mob.drop && Math.random() < 0.45) {
    const inv = { ...(fresh.inventory ?? {}) }
    inv[mob.drop] = (inv[mob.drop] ?? 0) + 1
    patch.inventory = inv
    const def = ITEM_MAP[mob.drop]
    dropText = ctx.t('minecraftbattle.drop', { item: def ? (ctx.lang === 'en' ? def.name.en : def.name.id) : mob.drop })
  }
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  const after = await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t('minecraftbattle.win', {
    emoji: mob.emoji, mob: mob.id, mpower: mob.power, power: myPower,
    coins, xp, drop: dropText, balance: after.profile.balance ?? 0,
  }))
}
