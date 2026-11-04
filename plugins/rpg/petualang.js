import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { consumeEnergy, restoreEnergy } from '../../src/rpg/energy.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'petualang',
  alias: ['adventure', 'jelajah', 'berpetualang'],
  category: 'rpg',
  description: { id: 'Bertualang RPG: kejadian acak, harta, monster, dan mata air pemulih', en: 'RPG adventure: random events, treasure, monsters, and a healing spring' },
  usage: '.petualang',
  example: '.petualang',
  cooldown: 45,
}

export const i18n = {
  id: {
    petualang: {
      treasure: '🧭 PETUALANGAN: kamu menemukan peti tua terkubur berisi *{coins} koin*! Energi tersisa {energy}/100 {mood}',
      item: '🧭 PETUALANGAN: di balik semak kamu menemukan *{item}*. Masuk tas yaa~ Energi tersisa {energy}/100 {mood}',
      fightWin: '🧭 PETUALANGAN: monster menghadang, tapi power kamu {power} menang! Dapat *{coins} koin* + {xp} XP. Energi tersisa {energy}/100 {mood}',
      fightLose: '🧭 PETUALANGAN: monster terlalu kuat (power kamu {power}), kamu kabur dan menjatuhkan *{coins} koin*. Energi tersisa {energy}/100 {mood}',
      spring: '🧭 PETUALANGAN: kamu menemukan mata air jernih dan beristirahat. Energi pulih jadi {energy}/100 {mood}',
      quiet: '🧭 PETUALANGAN: perjalanan tenang melewati padang bunga, tidak ada kejadian istimewa. Dapat {xp} XP pengalaman jalan. Energi tersisa {energy}/100 {mood}',
      tired: 'Energimu tinggal {energy}/100, kurang buat bertualang (perlu 20). Pulihkan dengan .heal atau .istirahat dulu yaa~ {mood}',
    },
  },
  en: {
    petualang: {
      treasure: '🧭 ADVENTURE: you found a buried old chest with *{coins} coins*! Energy left {energy}/100 {mood}',
      item: '🧭 ADVENTURE: behind the bushes you found *{item}*. Into the bag it goes~ Energy left {energy}/100 {mood}',
      fightWin: '🧭 ADVENTURE: a monster blocked the path, but your power {power} won! Got *{coins} coins* + {xp} XP. Energy left {energy}/100 {mood}',
      fightLose: '🧭 ADVENTURE: the monster is too strong (your power {power}), you fled and dropped *{coins} coins*. Energy left {energy}/100 {mood}',
      spring: '🧭 ADVENTURE: you found a clear spring and rested. Energy restored to {energy}/100 {mood}',
      quiet: '🧭 ADVENTURE: a calm walk through the flower fields, nothing special happened. Gained {xp} XP of travel experience. Energy left {energy}/100 {mood}',
      tired: 'Your energy is {energy}/100, not enough to adventure (needs 20). Restore with .heal or .istirahat first~ {mood}',
    },
  },
}

export const test = { input: '.petualang', expect: /petualangan|adventure/i }

const LOOT_ITEMS = ['kulit', 'daging', 'kristal', 'besi', 'batubara']

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const spent = await consumeEnergy(ctx.storage, ctx.senderDigits, 20)
  if (!spent.ok) return ctx.reply(ctx.t('petualang.tired', { energy: spent.energy, mood: ctx.say('gagal') }))
  const roll = Math.random()
  const power = powerOf(profile)
  if (roll < 0.22) {
    const coins = 100 + Math.floor(Math.random() * 250)
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + coins })
    return ctx.reply(ctx.t('petualang.treasure', { coins, energy: spent.energy, mood: ctx.say('sukses') }))
  }
  if (roll < 0.42) {
    const itemId = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)]
    const inventory = { ...(profile.inventory ?? {}) }
    inventory[itemId] = (inventory[itemId] ?? 0) + 1
    await updateProfile(ctx.storage, ctx.senderDigits, { inventory })
    const item = ITEM_MAP[itemId]
    return ctx.reply(ctx.t('petualang.item', { item: item ? (ctx.lang === 'en' ? item.name?.en ?? itemId : item.name?.id ?? itemId) : itemId, energy: spent.energy, mood: ctx.say('sukses') }))
  }
  if (roll < 0.67) {
    const monsterPower = 15 + Math.floor(Math.random() * 90)
    if (power >= monsterPower) {
      const coins = 80 + Math.floor(Math.random() * 200)
      await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + coins })
      await addXp(ctx.storage, ctx.senderDigits, 14)
      return ctx.reply(ctx.t('petualang.fightWin', { power, coins, xp: 14, energy: spent.energy, mood: ctx.say('sukses') }))
    }
    const lost = Math.min(profile.balance ?? 0, 30 + Math.floor(Math.random() * 70))
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) - lost })
    await addXp(ctx.storage, ctx.senderDigits, 5)
    return ctx.reply(ctx.t('petualang.fightLose', { power, coins: lost, energy: spent.energy, mood: ctx.say('gagal') }))
  }
  if (roll < 0.82) {
    const next = await restoreEnergy(ctx.storage, ctx.senderDigits, 30)
    return ctx.reply(ctx.t('petualang.spring', { energy: next, mood: ctx.say('senang') }))
  }
  await addXp(ctx.storage, ctx.senderDigits, 6)
  return ctx.reply(ctx.t('petualang.quiet', { xp: 6, energy: spent.energy, mood: ctx.say('senang') }))
}
