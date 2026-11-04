import { getProfile, updateProfile, addXp, wibDateString } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { consumeEnergy } from '../../src/rpg/energy.js'

export const config = {
  name: 'boss',
  alias: ['worldboss'],
  category: 'rpg',
  description: { id: 'Lawan boss harian RPG sendirian: hadiah besar, satu kali per hari', en: 'Fight the daily RPG boss solo: big reward, once per day' },
  usage: '.boss',
  example: '.boss',
  cooldown: 30,
}

const BOSSES = [
  { id: 'Hydra Rawa Hitam', en: 'Black Swamp Hydra', emoji: '🐉', power: 60 },
  { id: 'Raja Golem Kuno', en: 'Ancient Golem King', emoji: '🗿', power: 80 },
  { id: 'Lich Penyihir Malam', en: 'Night Lich Sorcerer', emoji: '🧙', power: 100 },
  { id: 'Kraken Danau Merah', en: 'Red Lake Kraken', emoji: '🦑', power: 120 },
  { id: 'Naga Abu Vulkanik', en: 'Volcanic Ash Dragon', emoji: '🐲', power: 150 },
]

export const i18n = {
  id: {
    boss: {
      win: '{emoji} BOSS TUMBANG! Kamu mengalahkan *{boss}* (power {bossPower}) dengan power kamu {power}.\nHadiah: *{coins} koin* + {xp} XP. Energi tersisa {energy}/100. {mood}',
      lose: '{emoji} *{boss}* (power {bossPower}) masih terlalu kuat buat power kamu {power}. Kamu mundur dengan selamat dan dapat {xp} XP.\nCoba lagi besok sesudah naik level yaa~ {mood}',
      doneToday: 'Kamu sudah menantang boss hari ini. Boss baru muncul besok, istirahat dulu yaa~ {mood}',
      tired: 'Energimu tinggal {energy}/100, kurang buat lawan boss (perlu 25). Pulihkan dengan .heal dulu yaa~ {mood}',
    },
  },
  en: {
    boss: {
      win: '{emoji} BOSS DOWN! You defeated *{boss}* (power {bossPower}) with your power {power}.\nReward: *{coins} coins* + {xp} XP. Energy left {energy}/100. {mood}',
      lose: '{emoji} *{boss}* (power {bossPower}) is still too strong for your power {power}. You retreated safely and gained {xp} XP.\nTry again tomorrow after leveling up~ {mood}',
      doneToday: 'You already challenged the boss today. A new boss appears tomorrow, rest first~ {mood}',
      tired: 'Your energy is {energy}/100, not enough for a boss fight (needs 25). Restore with .heal first~ {mood}',
    },
  },
}

export const test = { input: '.boss', expect: /boss/i }

export function dailyBoss(dateStr) {
  let hash = 0
  for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return BOSSES[hash % BOSSES.length]
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const today = wibDateString(new Date())
  if (profile.lastBoss === today) return ctx.reply(ctx.t('boss.doneToday', { mood: ctx.say('ngantuk') }))
  const spent = await consumeEnergy(ctx.storage, ctx.senderDigits, 25)
  if (!spent.ok) return ctx.reply(ctx.t('boss.tired', { energy: spent.energy, mood: ctx.say('gagal') }))
  const boss = dailyBoss(today)
  const power = powerOf(profile)
  const chance = Math.min(0.9, Math.max(0.1, 0.5 + (power - boss.power) / 120))
  const win = Math.random() < chance
  await updateProfile(ctx.storage, ctx.senderDigits, { lastBoss: today })
  if (win) {
    const coins = 400 + Math.floor(Math.random() * 400)
    const fresh = await getProfile(ctx.storage, ctx.senderDigits)
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: (fresh.balance ?? 0) + coins })
    await addXp(ctx.storage, ctx.senderDigits, 30)
    return ctx.reply(ctx.t('boss.win', {
      emoji: boss.emoji, boss: ctx.lang === 'en' ? boss.en : boss.id, bossPower: boss.power,
      power, coins, xp: 30, energy: spent.energy, mood: ctx.say('sukses'),
    }))
  }
  await addXp(ctx.storage, ctx.senderDigits, 10)
  return ctx.reply(ctx.t('boss.lose', {
    emoji: boss.emoji, boss: ctx.lang === 'en' ? boss.en : boss.id, bossPower: boss.power,
    power, xp: 10, mood: ctx.say('gagal'),
  }))
}
