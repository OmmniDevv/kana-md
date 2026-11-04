import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'

export const config = {
  name: 'yearly',
  alias: ['tahunan'],
  category: 'rpg',
  description: { id: 'Klaim hadiah tahunan RPG: koin sangat besar dan XP', en: 'Claim the yearly RPG reward: very big coins and XP' },
  usage: '.yearly',
  example: '.yearly',
  cooldown: 10,
}

export const i18n = {
  id: {
    yearly: {
      done: '🎆 Hadiah tahunan terklaim: *{coins} koin* + {xp} XP. Terima kasih sudah setia sama KANA~ {mood}',
      wait: 'Hadiah tahunan tahun ini sudah kamu klaim. Sampai jumpa tahun depan yaa~ {mood}',
    },
  },
  en: {
    yearly: {
      done: '🎆 Yearly reward claimed: *{coins} coins* + {xp} XP. Thank you for staying with KANA~ {mood}',
      wait: 'You already claimed this year reward. See you next year~ {mood}',
    },
  },
}

export const test = { input: '.yearly', expect: /tahunan|yearly/i }

export function yearKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric' }).format(date)
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const key = yearKey()
  if (profile.lastYearly === key) return ctx.reply(ctx.t('yearly.wait', { mood: ctx.say('ngantuk') }))
  const coins = 10000
  await updateProfile(ctx.storage, ctx.senderDigits, {
    balance: (profile.balance ?? 0) + coins,
    lastYearly: key,
  })
  await addXp(ctx.storage, ctx.senderDigits, 300)
  return ctx.reply(ctx.t('yearly.done', { coins, xp: 300, mood: ctx.say('sukses') }))
}
