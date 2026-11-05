import { sendButtons } from '../../src/ui/buttons.js'
import { claim } from '../../src/rpg/engine.js'

export const config = {
  name: 'daily',
  alias: ['claim'],
  category: 'rpg',
  description: { id: 'Klaim hadiah harian RPG: 500 koin dan 20 XP', en: 'Claim the daily RPG reward: 500 coins and 20 XP' },
  usage: '.daily',
  example: '.daily',
  cooldown: 3,
}

export const i18n = {
  id: {
    daily: {
      ok: '╭─❏ 🎁 「 *DAILY* 」\n┊ 🎁 Yeyy, hadiah harian datang! Kamu dapat {coins} koin dan {xp} XP~\n┊ Saldo sekarang: {balance} koin 💰\n┊ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *DAILY* 」\n┊ Mouu, hadiah hariannya udah kamu ambil hari ini~ Balik lagi besok yaa 🥺\n╰━━━━━━━',
      btnHourly: 'Klaim Per Jam',
      btnWeekly: 'Klaim Mingguan',
    },
  },
  en: {
    daily: {
      ok: '╭─❏ 🎁 「 *DAILY* 」\n┊ 🎁 Yayy, the daily reward is here! You got {coins} coins and {xp} XP~\n┊ Balance now: {balance} coins 💰\n┊ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *DAILY* 」\n┊ Mouu, you already took today daily reward~ Come back tomorrow 🥺\n╰━━━━━━━',
      btnHourly: 'Hourly Claim',
      btnWeekly: 'Weekly Claim',
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
    ],
    textFallback: body,
  })
}
