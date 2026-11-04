import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, levelFromXp, limitState, xpForLevel } from '../../src/services/user-service.js'

export const config = {
  name: 'profil',
  alias: ['me'],
  category: 'user',
  description: { id: 'Lihat kartu profil kamu: level, XP, limit, saldo', en: 'See your profile card: level, XP, limit, balance' },
  usage: '.profil',
  example: '.profil',
  cooldown: 3,
}

export const i18n = {
  id: {
    profil: {
      card: '╭───「 PROFIL 」───\n│ ◦ Nama : {name}\n│ ◦ Nomor : {number}\n│ ◦ Level : {level}\n│ ◦ XP : {xp} (progres level ini {progress}/{needed}, {percent}%)\n│ ◦ Sisa ke level berikut : {toNext} XP\n│ ◦ Limit hari ini : {limit} tersisa\n│ ◦ Saldo : {balance}\n│ ◦ Status : {status}\n╰━━━━━━━\n{mood}',
      registered: 'Terdaftar sejak {date}',
      unregistered: 'Belum daftar, ketik .daftar <nama> yaa',
      btnLevel: 'Level Aku',
      btnLimit: 'Limit Aku',
      btnLeaderboard: 'Leaderboard',
      btnMenu: 'Menu User',
    },
  },
  en: {
    profil: {
      card: '╭───「 PROFILE 」───\n│ ◦ Name : {name}\n│ ◦ Number : {number}\n│ ◦ Level : {level}\n│ ◦ XP : {xp} (this level progress {progress}/{needed}, {percent}%)\n│ ◦ Left to next level : {toNext} XP\n│ ◦ Limit today : {limit} left\n│ ◦ Balance : {balance}\n│ ◦ Status : {status}\n╰━━━━━━━\n{mood}',
      registered: 'Registered since {date}',
      unregistered: 'Not registered yet, type .daftar <name>',
      btnLevel: 'My Level',
      btnLimit: 'My Limit',
      btnLeaderboard: 'Leaderboard',
      btnMenu: 'User Menu',
    },
  },
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const level = levelFromXp(profile.xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const progress = Math.max(0, (profile.xp || 0) - base)
  const needed = Math.max(1, next - base)
  const status = profile.registeredAt
    ? ctx.t('profil.registered', { date: String(profile.registeredAt).slice(0, 10) })
    : ctx.t('profil.unregistered')
  const body = ctx.t('profil.card', {
    name: profile.name || ctx.pushName || '-',
    number: ctx.senderDigits,
    level,
    xp: profile.xp || 0,
    progress,
    needed,
    percent: Math.floor((progress / needed) * 100),
    toNext: Math.max(0, next - (profile.xp || 0)),
    limit: limitState(profile).left,
    balance: profile.balance || 0,
    status,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('profil.btnLevel'), id: '.level' },
      { text: ctx.t('profil.btnLimit'), id: '.limit' },
      { text: ctx.t('profil.btnLeaderboard'), id: '.leaderboard' },
      { text: ctx.t('profil.btnMenu'), id: '.menu user' },
    ],
    textFallback: body,
  })
}
