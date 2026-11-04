import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'

export const config = {
  name: 'monthly',
  alias: ['bulanan'],
  category: 'rpg',
  description: { id: 'Klaim hadiah bulanan RPG: koin besar dan XP', en: 'Claim the monthly RPG reward: big coins and XP' },
  usage: '.monthly',
  example: '.monthly',
  cooldown: 10,
}

export const i18n = {
  id: {
    monthly: {
      done: '╭─❏ 📅 「 *MONTHLY* 」\n┊ 📅 Hadiah bulanan terklaim: *{coins} koin* + {xp} XP. Sampai jumpa bulan depan yaa~ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *MONTHLY* 」\n┊ Hadiah bulanan bulan ini sudah kamu klaim. Tunggu bulan depan yaa~ {mood}\n╰━━━━━━━',
    },
  },
  en: {
    monthly: {
      done: '╭─❏ 📅 「 *MONTHLY* 」\n┊ 📅 Monthly reward claimed: *{coins} coins* + {xp} XP. See you next month~ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *MONTHLY* 」\n┊ You already claimed this month reward. Wait for next month~ {mood}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.monthly', expect: /bulanan|monthly/i }

export function monthKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(date)
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const key = monthKey()
  if (profile.lastMonthly === key) return ctx.reply(ctx.t('monthly.wait', { mood: ctx.say('ngantuk') }))
  const coins = 1500
  await updateProfile(ctx.storage, ctx.senderDigits, {
    balance: (profile.balance ?? 0) + coins,
    lastMonthly: key,
  })
  await addXp(ctx.storage, ctx.senderDigits, 60)
  return ctx.reply(ctx.t('monthly.done', { coins, xp: 60, mood: ctx.say('sukses') }))
}
