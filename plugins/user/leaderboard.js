import { sendButtons } from '../../src/ui/buttons.js'
import { xpLeaderboard } from '../../src/services/user-service.js'
import { smallCaps } from '../../src/config/templates.js'

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
      header: '╭─❏ 🏆 「 *PAPAN PERINGKAT XP* 」\n{rows}\n╰━━━━━━━\n{mood}',
      empty: '╭─❏ 🏆 「 *PAPAN PERINGKAT XP* 」\n┊ Mouu, belum ada data XP sama sekali.\n┊ Jadi yang pertama yuk, pakai perintah KANA biar XP kamu naik~\n╰━━━━━━━ {mood}',
      you: '(kamu)',
      btnProfile: 'Profil Aku',
    },
  },
  en: {
    leaderboard: {
      header: '╭─❏ 🏆 「 *KANA XP LEADERBOARD* 」\n{rows}\n╰━━━━━━━\n{mood}',
      empty: '╭─❏ 🏆 「 *KANA XP LEADERBOARD* 」\n┊ Mouu, there is no XP data yet at all.\n┊ Be the first, use KANA commands to raise your XP~\n╰━━━━━━━ {mood}',
      you: '(you)',
      btnProfile: 'My Profile',
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
    const medals = ['🥇', '🥈', '🥉']
    const lines = rows.map((row, i) => {
      const label = row.name || `****${String(row.digits).slice(-4)}`
      const marker = row.digits === ctx.senderDigits ? ` ${ctx.t('leaderboard.you')}` : ''
      const prefix = medals[i] ?? `${i + 1}.`
      return `┊ ${prefix} *${label}* : ${smallCaps('level')} *${row.level}* : *${row.xp} XP*${marker}`
    })
    body = ctx.t('leaderboard.header', { rows: lines.join('\n'), mood: ctx.say('senang') })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('leaderboard.btnProfile'), id: '.profil' }],
    textFallback: body,
  })
}
