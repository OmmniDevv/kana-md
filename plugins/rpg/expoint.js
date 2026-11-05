// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang menampilkan poin pengalaman nyata:
// total XP, level hasil hitung, dan sisa XP menuju level berikutnya.
import { getProfile, levelFromXp, xpForLevel } from '../../src/services/user-service.js'

export const config = {
  name: 'expoint',
  alias: [],
  category: 'rpg',
  description: { id: 'Poin pengalaman (XP) nyata milikmu: total XP, level, dan sisa menuju level berikutnya', en: 'Your real experience points: total XP, level, and what is left to the next level' },
  usage: '.expoint',
  example: '.expoint',
  cooldown: 5,
}

export const i18n = {
  id: {
    expoint: {
      info: '╭─❏ ⭐ 「 *EXPOINT* 」\n┊ Total XP kamu: *{xp} XP*\n┊ Level sekarang: *{level}*\n┊ Menuju level {next}: kurang *{remain} XP* lagi\n┊ Tukar: .moneytopoin (koin ke XP) atau .pointomoney (XP ke koin)\n╰━━━━━━━',
    },
  },
  en: {
    expoint: {
      info: '╭─❏ ⭐ 「 *EXPOINT* 」\n┊ Your total XP: *{xp} XP*\n┊ Current level: *{level}*\n┊ To level {next}: *{remain} XP* to go\n┊ Exchange: .moneytopoin (coins to XP) or .pointomoney (XP to coins)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.expoint', expect: /total xp|total XP kamu/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const xp = profile.xp ?? 0
  const level = levelFromXp(xp)
  const remain = Math.max(0, xpForLevel(level + 1) - xp)
  return ctx.reply(ctx.t('expoint.info', { xp, level, next: level + 1, remain }))
}
