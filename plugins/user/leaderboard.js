import { sendButtons } from '../../src/ui/buttons.js'
import { xpLeaderboard } from '../../src/services/user-service.js'

export const config = {
  name: 'leaderboard',
  alias: ['lb', 'top'],
  category: 'user',
  description: { id: 'Papan peringkat XP tertinggi', en: 'Highest XP leaderboard' },
  usage: '.leaderboard',
  example: '.leaderboard',
  cooldown: 5,
}

export const i18n = {
  id: {
    leaderboard: {
      header: 'Papan Peringkat XP KANA\n{rows}\n{mood}',
      empty: 'Mouu, belum ada data XP sama sekali. Jadi yang pertama yuk, pakai perintah KANA biar XP kamu naik~ {mood}',
      you: '(kamu)',
      btnProfile: 'Profil Aku',
      btnMenu: 'Menu User',
    },
  },
  en: {
    leaderboard: {
      header: 'KANA XP Leaderboard\n{rows}\n{mood}',
      empty: 'Mouu, there is no XP data yet at all. Be the first, use KANA commands to raise your XP~ {mood}',
      you: '(you)',
      btnProfile: 'My Profile',
      btnMenu: 'User Menu',
    },
  },
}

export const test = { input: '.leaderboard', expect: /peringkat|XP/i }

export async function handler(ctx) {
  const rows = await xpLeaderboard(ctx.storage, 10)
  let body
  if (!rows.length) {
    body = ctx.t('leaderboard.empty', { mood: ctx.say('malu') })
  } else {
    const lines = rows.map((row, i) => {
      const label = row.name || `****${String(row.digits).slice(-4)}`
      const marker = row.digits === ctx.senderDigits ? ` ${ctx.t('leaderboard.you')}` : ''
      return `${i + 1}. ${label} : Lv ${row.level} : ${row.xp} XP${marker}`
    })
    body = ctx.t('leaderboard.header', { rows: lines.join('\n'), mood: ctx.say('senang') })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('leaderboard.btnProfile'), id: '.profil' },
      { text: ctx.t('leaderboard.btnMenu'), id: '.menu user' },
    ],
    textFallback: body,
  })
}
