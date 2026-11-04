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
      ok: '╭─❏ ⏰ 「 *HOURLY* 」\n┊ ⏰ Hadiah per jam cair! Kamu dapat {coins} koin dan {xp} XP~\n┊ Saldo sekarang: {balance} koin 💰\n┊ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *HOURLY* 」\n┊ Sabar yaa, hadiah per jam belum siap~ Coba lagi dalam {minutes} menit {seconds} detik 🥺\n╰━━━━━━━',
      btnDaily: 'Klaim Harian',
      btnWeekly: 'Klaim Mingguan',
    },
  },
  en: {
    hourly: {
      ok: '╭─❏ ⏰ 「 *HOURLY* 」\n┊ ⏰ Hourly reward claimed! You got {coins} coins and {xp} XP~\n┊ Balance now: {balance} coins 💰\n┊ {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *HOURLY* 」\n┊ Hold on, the hourly reward is not ready yet~ Try again in {minutes} minutes {seconds} seconds 🥺\n╰━━━━━━━',
      btnDaily: 'Daily Claim',
      btnWeekly: 'Weekly Claim',
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
    ],
    textFallback: body,
  })
}
