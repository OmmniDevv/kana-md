import { sendButtons } from '../../src/ui/buttons.js'
import { claim } from '../../src/rpg/engine.js'

export const config = {
  name: 'hourly',
  alias: [],
  category: 'rpg',
  description: { id: 'Klaim hadiah per jam RPG: 100 koin dan 5 XP', en: 'Claim the hourly RPG reward: 100 coins and 5 XP' },
  usage: '.hourly',
  example: '.hourly',
  cooldown: 3,
}

export const i18n = {
  id: {
    hourly: {
      ok: '⏰ Hadiah per jam cair! Kamu dapat {coins} koin dan {xp} XP~\nSaldo sekarang: {balance} koin 💰\n{mood}',
      wait: 'Sabar yaa, hadiah per jam belum siap~ Coba lagi dalam {minutes} menit {seconds} detik 🥺',
      btnDaily: 'Klaim Harian',
      btnWeekly: 'Klaim Mingguan',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    hourly: {
      ok: '⏰ Hourly reward claimed! You got {coins} coins and {xp} XP~\nBalance now: {balance} coins 💰\n{mood}',
      wait: 'Hold on, the hourly reward is not ready yet~ Try again in {minutes} minutes {seconds} seconds 🥺',
      btnDaily: 'Daily Claim',
      btnWeekly: 'Weekly Claim',
      btnMenu: 'RPG Menu',
    },
  },
}

export const test = { input: '.hourly', expect: /hadiah per jam/i }

export async function handler(ctx) {
  const res = await claim(ctx.storage, ctx.senderDigits, 'hourly')
  const waitMs = res.waitMs ?? 0
  const body = res.ok
    ? ctx.t('hourly.ok', { coins: res.reward.coins, xp: res.reward.xp, balance: res.balance, mood: ctx.say('senang') })
    : ctx.t('hourly.wait', { minutes: Math.floor(waitMs / 60000), seconds: Math.ceil((waitMs % 60000) / 1000) })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('hourly.btnDaily'), id: '.daily' },
      { text: ctx.t('hourly.btnWeekly'), id: '.weekly' },
      { text: ctx.t('hourly.btnMenu'), id: '.menurpg' },
    ],
    textFallback: body,
  })
}
