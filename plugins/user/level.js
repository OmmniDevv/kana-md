import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, levelFromXp, xpForLevel } from '../../src/services/user-service.js'

export const config = {
  name: 'level',
  alias: ['lvl'],
  category: 'user',
  description: { id: 'Lihat level dan XP kamu secara detail', en: 'See your level and XP in detail' },
  usage: '.level',
  example: '.level',
  cooldown: 3,
}

export const i18n = {
  id: {
    level: {
      detail:
        '╭─❏ 📈 「 *LEVEL KAMU* 」\n┊ ʟᴇᴠᴇʟ: *{level}*\n┊ xᴘ ᴛᴏᴛᴀʟ: *{xp}*\n┊ ᴘʀᴏɢʀᴇꜱ ʟᴇᴠᴇʟ ɪɴɪ: *{progress}/{needed} XP ({percent}%)*\n┊ ꜱɪꜱᴀ ᴋᴇ ʟᴇᴠᴇʟ {nextLevel}: *{toNext} XP lagi*\n╰━━━━━━━\nSemangat yaa~ {mood}',
      btnLeaderboard: 'Leaderboard',
      btnProfile: 'Profil Aku',
    },
  },
  en: {
    level: {
      detail:
        '╭─❏ 📈 「 *YOUR LEVEL* 」\n┊ ʟᴇᴠᴇʟ: *{level}*\n┊ ᴛᴏᴛᴀʟ xᴘ: *{xp}*\n┊ ᴛʜɪꜱ ʟᴇᴠᴇʟ ᴘʀᴏɢʀᴇꜱꜱ: *{progress}/{needed} XP ({percent}%)*\n┊ ʟᴇꜰᴛ ᴛᴏ ʟᴇᴠᴇʟ {nextLevel}: *{toNext} more XP*\n╰━━━━━━━\nKeep going~ {mood}',
      btnLeaderboard: 'Leaderboard',
      btnProfile: 'My Profile',
    },
  },
}

export const test = { input: '.level', expect: /level/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const xp = profile.xp || 0
  const level = levelFromXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const progress = Math.max(0, xp - base)
  const needed = Math.max(1, next - base)
  const body = ctx.t('level.detail', {
    level,
    xp,
    progress,
    needed,
    percent: Math.floor((progress / needed) * 100),
    nextLevel: level + 1,
    toNext: Math.max(0, next - xp),
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('level.btnLeaderboard'), id: '.leaderboard' },
      { text: ctx.t('level.btnProfile'), id: '.profil' },
    ],
    textFallback: body,
  })
}
