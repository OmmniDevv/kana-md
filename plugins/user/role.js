import { getProfile, levelFromXp } from '../../src/services/user-service.js'

export const config = {
  name: 'role',
  alias: ['checkrole', 'levelrole'],
  category: 'user',
  description: { id: 'Gelar role kamu berdasarkan level akun', en: 'Your role title based on your account level' },
  usage: '.role',
  example: '.role',
  cooldown: 5,
}

export const ROLES = [
  { min: 50, id: 'Legenda KANA', en: 'KANA Legend' },
  { min: 35, id: 'Master Petualang', en: 'Master Adventurer' },
  { min: 25, id: 'Veteran', en: 'Veteran' },
  { min: 18, id: 'Penjelajah Senior', en: 'Senior Explorer' },
  { min: 12, id: 'Penjelajah', en: 'Explorer' },
  { min: 8, id: 'Petualang', en: 'Adventurer' },
  { min: 5, id: 'Pengelana', en: 'Wanderer' },
  { min: 3, id: 'Pemula Rajin', en: 'Diligent Beginner' },
  { min: 1, id: 'Pendatang Baru', en: 'Newcomer' },
]

export const i18n = {
  id: { role: { body: '╭─❏ 🎖️ 「 *ROLE KAMU* 」\n┊ ʀᴏʟᴇ: *{role}*\n┊ ʟᴇᴠᴇʟ: *{level}* (XP {xp})\n┊ ʀᴏʟᴇ ʙᴇʀɪᴋᴜᴛɴʏᴀ: *{next}*\n╰━━━━━━━ {mood}' } },
  en: { role: { body: '╭─❏ 🎖️ 「 *YOUR ROLE* 」\n┊ ʀᴏʟᴇ: *{role}*\n┊ ʟᴇᴠᴇʟ: *{level}* (XP {xp})\n┊ ɴᴇxᴛ ʀᴏʟᴇ: *{next}*\n╰━━━━━━━ {mood}' } },
}

export const test = { input: '.role', expect: /role/i }

export function roleForLevel(level) {
  return ROLES.find((r) => level >= r.min) ?? ROLES[ROLES.length - 1]
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const level = levelFromXp(profile.xp ?? 0)
  const role = roleForLevel(level)
  const idx = ROLES.indexOf(role)
  const nextRole = idx > 0 ? ROLES[idx - 1] : null
  const next = nextRole
    ? `${ctx.lang === 'en' ? nextRole.en : nextRole.id} (level ${nextRole.min})`
    : '-'
  return ctx.reply(ctx.t('role.body', {
    role: ctx.lang === 'en' ? role.en : role.id,
    level, xp: profile.xp ?? 0, next, mood: ctx.say('senang'),
  }))
}
