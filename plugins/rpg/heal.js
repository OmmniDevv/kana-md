import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { energyOf, restoreEnergy, MAX_ENERGY } from '../../src/rpg/energy.js'

export const config = {
  name: 'heal',
  alias: ['pulih'],
  category: 'rpg',
  description: { id: 'Pulihkan energi RPG sampai penuh dengan bayar koin di penginapan', en: 'Restore RPG energy to full by paying coins at the inn' },
  usage: '.heal',
  example: '.heal',
  cooldown: 10,
}

export const i18n = {
  id: {
    heal: {
      done: '🏨 Kamu beristirahat di penginapan seharga *{cost} koin*. Energi pulih penuh: {energy}/100. {mood}',
      full: 'Energimu sudah penuh {energy}/100, tidak perlu ke penginapan kok~ {mood}',
      poor: 'Koinmu {coins}, kurang buat bayar penginapan ({cost} koin). Kerja dulu yuk dengan .kerja~ {mood}',
    },
  },
  en: {
    heal: {
      done: '🏨 You rested at the inn for *{cost} coins*. Energy fully restored: {energy}/100. {mood}',
      full: 'Your energy is already full at {energy}/100, no need for the inn~ {mood}',
      poor: 'You have {coins} coins, not enough for the inn ({cost} coins). Work first with .kerja~ {mood}',
    },
  },
}

export const test = { input: '.heal', expect: /energi|energy/i }

export function healCost(profile) {
  const missing = MAX_ENERGY - energyOf(profile)
  return Math.ceil(missing * 1.5)
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  if (energy >= MAX_ENERGY) return ctx.reply(ctx.t('heal.full', { energy, mood: ctx.say('senang') }))
  const cost = healCost(profile)
  if ((profile.balance ?? 0) < cost) {
    return ctx.reply(ctx.t('heal.poor', { coins: profile.balance ?? 0, cost, mood: ctx.say('gagal') }))
  }
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) - cost })
  const next = await restoreEnergy(ctx.storage, ctx.senderDigits, MAX_ENERGY)
  return ctx.reply(ctx.t('heal.done', { cost, energy: next, mood: ctx.say('sukses') }))
}
