import { sendButtons } from '../../src/ui/buttons.js'
import { claim } from '../../src/rpg/engine.js'

export const config = {
  name: 'weekly',
  alias: ['gajian'],
  category: 'rpg',
  description: { id: 'Klaim hadiah mingguan RPG: 3000 koin dan 100 XP', en: 'Claim the weekly RPG reward: 3000 coins and 100 XP' },
  usage: '.weekly',
  example: '.weekly',
  cooldown: 3,
}

export const i18n = {
  id: {
    weekly: {
      ok: '🎉 Hadiah mingguan gede banget! Kamu dapat {coins} koin dan {xp} XP~\nSaldo sekarang: {balance} koin 💰\n{mood}',
      wait: 'Mouu, hadiah mingguan masih dikunci~ Balik lagi dalam {days} hari {hours} jam yaa 🥺',
      btnDaily: 'Klaim Harian',
      btnHourly: 'Klaim Per Jam',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    weekly: {
      ok: '🎉 The weekly reward is huge! You got {coins} coins and {xp} XP~\nBalance now: {balance} coins 💰\n{mood}',
      wait: 'Mouu, the weekly reward is still locked~ Come back in {days} days {hours} hours 🥺',
      btnDaily: 'Daily Claim',
      btnHourly: 'Hourly Claim',
      btnMenu: 'RPG Menu',
    },
  },
}

export const test = { input: '.weekly', expect: /mingguan/i }

export async function handler(ctx) {
  const res = await claim(ctx.storage, ctx.senderDigits, 'weekly')
  const waitMs = res.waitMs ?? 0
  const body = res.ok
    ? ctx.t('weekly.ok', { coins: res.reward.coins, xp: res.reward.xp, balance: res.balance, mood: ctx.say('senang') })
    : ctx.t('weekly.wait', { days: Math.floor(waitMs / 86400000), hours: Math.floor((waitMs % 86400000) / 3600000) })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('weekly.btnDaily'), id: '.daily' },
      { text: ctx.t('weekly.btnHourly'), id: '.hourly' },
      { text: ctx.t('weekly.btnMenu'), id: '.menurpg' },
    ],
    textFallback: body,
  })
}
