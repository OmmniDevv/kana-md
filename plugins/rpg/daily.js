import { sendButtons } from '../../src/ui/buttons.js'
import { claim } from '../../src/rpg/engine.js'

export const config = {
  name: 'daily',
  alias: ['claim', 'bonus'],
  category: 'rpg',
  description: { id: 'Klaim hadiah harian RPG: 500 koin dan 20 XP', en: 'Claim the daily RPG reward: 500 coins and 20 XP' },
  usage: '.daily',
  example: '.daily',
  cooldown: 3,
}

export const i18n = {
  id: {
    daily: {
      ok: '🎁 Yeyy, hadiah harian datang! Kamu dapat {coins} koin dan {xp} XP~\nSaldo sekarang: {balance} koin 💰\n{mood}',
      wait: 'Mouu, hadiah hariannya udah kamu ambil hari ini~ Balik lagi besok yaa 🥺',
      btnHourly: 'Klaim Per Jam',
      btnWeekly: 'Klaim Mingguan',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    daily: {
      ok: '🎁 Yayy, the daily reward is here! You got {coins} coins and {xp} XP~\nBalance now: {balance} coins 💰\n{mood}',
      wait: 'Mouu, you already took today daily reward~ Come back tomorrow 🥺',
      btnHourly: 'Hourly Claim',
      btnWeekly: 'Weekly Claim',
      btnMenu: 'RPG Menu',
    },
  },
}

export const test = { input: '.daily', expect: /hadiah/i }

export async function handler(ctx) {
  const res = await claim(ctx.storage, ctx.senderDigits, 'daily')
  const body = res.ok
    ? ctx.t('daily.ok', { coins: res.reward.coins, xp: res.reward.xp, balance: res.balance, mood: ctx.say('senang') })
    : ctx.t('daily.wait')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('daily.btnHourly'), id: '.hourly' },
      { text: ctx.t('daily.btnWeekly'), id: '.weekly' },
      { text: ctx.t('daily.btnMenu'), id: '.menurpg' },
    ],
    textFallback: body,
  })
}
