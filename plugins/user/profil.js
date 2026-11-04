import { MB } from '@rexxhayanasi/elaina-baileys'
import { sendButtons } from '../../src/ui/buttons.js'
import { renderProfileCard } from '../../src/ui/profile-card.js'
import { footerLine, withButtonEmoji } from '../../src/config/templates.js'
import { logger } from '../../src/services/logger.js'
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
      caption: '{name} • Level {level}\nSaldo: {balance} • Limit tersisa: {limit}\n{mood}',
      cardLevel: 'LEVEL',
      cardXp: 'XP',
      cardBalance: 'Saldo',
      cardLimit: 'Limit Hari Ini',
      cardRank: 'Gelar',
      rank1: 'Pemula',
      rank2: 'Penjelajah',
      rank3: 'Petualang',
      rank4: 'Veteran',
      rank5: 'Legenda KANA',
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
      caption: '{name} • Level {level}\nBalance: {balance} • Limit left: {limit}\n{mood}',
      cardLevel: 'LEVEL',
      cardXp: 'XP',
      cardBalance: 'Balance',
      cardLimit: "Today's Limit",
      cardRank: 'Title',
      rank1: 'Beginner',
      rank2: 'Explorer',
      rank3: 'Adventurer',
      rank4: 'Veteran',
      rank5: 'KANA Legend',
    },
  },
}

export const test = { input: '.profil', expect: /profil|profile|level/i }

// Gelar diturunkan dari level: lima tingkat, label lewat i18n plugin.
export function rankKeyForLevel(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1))
  if (lv >= 25) return 'profil.rank5'
  if (lv >= 15) return 'profil.rank4'
  if (lv >= 8) return 'profil.rank3'
  if (lv >= 4) return 'profil.rank2'
  return 'profil.rank1'
}

function senderJid(ctx) {
  return ctx.sender || ctx.raw?.key?.participant || ctx.raw?.key?.remoteJid || ctx.chat
}

// Ambil foto profil pengirim menjadi Buffer. Semua kegagalan, termasuk
// tidak ada foto, fetch gagal, dan timeout singkat, menghasilkan null
// supaya perintah profil tidak pernah gagal gara gara foto.
export async function fetchProfileAvatar(ctx) {
  try {
    if (typeof ctx.sock?.profilePictureUrl !== 'function') return null
    const url = await ctx.sock.profilePictureUrl(senderJid(ctx), 'image')
    if (!url || typeof url !== 'string') return null
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res?.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer.length ? buffer : null
  } catch {
    return null
  }
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const level = levelFromXp(profile.xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const progress = Math.max(0, (profile.xp || 0) - base)
  const needed = Math.max(1, next - base)
  const percent = Math.floor((progress / needed) * 100)
  const limitLeft = limitState(profile).left
  const name = profile.name || ctx.pushName || '-'
  const botName = process.env.BOT_NAME || 'KANA'
  const footer = footerLine(ctx.t)
  const status = profile.registeredAt
    ? ctx.t('profil.registered', { date: String(profile.registeredAt).slice(0, 10) })
    : ctx.t('profil.unregistered')
  const body = ctx.t('profil.card', {
    name,
    number: ctx.senderDigits,
    level,
    xp: profile.xp || 0,
    progress,
    needed,
    percent,
    toNext: Math.max(0, next - (profile.xp || 0)),
    limit: limitLeft,
    balance: profile.balance || 0,
    status,
    mood: ctx.say('senang'),
  })
  const caption = ctx.t('profil.caption', {
    name,
    level,
    balance: profile.balance || 0,
    limit: limitLeft,
    mood: ctx.say('senang'),
  })
  const replies = [
    { text: ctx.t('profil.btnLevel'), id: '.level' },
    { text: ctx.t('profil.btnLimit'), id: '.limit' },
    { text: ctx.t('profil.btnLeaderboard'), id: '.leaderboard' },
    { text: ctx.t('profil.btnMenu'), id: '.menu user' },
  ]
  const sendTextCard = () =>
    sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer,
      replies,
      textFallback: body,
    })

  let cardBuffer = null
  try {
    const avatarBuffer = await fetchProfileAvatar(ctx)
    cardBuffer = await renderProfileCard({
      name,
      number: ctx.senderDigits,
      level,
      xp: profile.xp || 0,
      progress,
      needed,
      percent,
      balance: profile.balance || 0,
      limitLeft,
      rankLabel: ctx.t(rankKeyForLevel(level)),
      registeredLabel: status,
      avatarBuffer,
      botName,
      labels: {
        level: ctx.t('profil.cardLevel'),
        xp: ctx.t('profil.cardXp'),
        balance: ctx.t('profil.cardBalance'),
        limit: ctx.t('profil.cardLimit'),
        rank: ctx.t('profil.cardRank'),
      },
    })
  } catch (err) {
    logger.warn({ err: err.message }, 'render kartu profil gagal, fallback ke kartu teks')
    return sendTextCard()
  }
  if (!Buffer.isBuffer(cardBuffer) || !cardBuffer.length) return sendTextCard()

  try {
    const builder = new MB.Button(ctx.sock)
    builder.setTitle(botName)
    builder.setBody(caption)
    builder.setFooter(footer)
    builder.setImage(cardBuffer)
    for (const reply of replies) builder.addReply(withButtonEmoji(reply.text, reply.id), reply.id)
    return await builder.send(ctx.chat)
  } catch (err) {
    logger.warn({ err: err.message }, 'MB.Button profil gagal, fallback ke gambar plus tombol')
  }

  try {
    await ctx.sock.sendMessage(ctx.chat, { image: cardBuffer, caption })
    return await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer,
      replies,
      textFallback: body,
    })
  } catch (err) {
    logger.warn({ err: err.message }, 'fallback gambar profil gagal, fallback ke kartu teks')
    return sendTextCard()
  }
}
