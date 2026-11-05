import { renderProfileCard } from '../../src/ui/profile-card.js'
import { getProfile, levelFromXp, limitState, xpForLevel } from '../../src/services/user-service.js'
import { getPremiumStatus } from '../../src/services/premium.js'
import { fetchAvatarBuffer } from '../canvas/ship.js'

// Usercard: kartu profil user sebagai GAMBAR canvas (renderer kartu
// profil KANA) berisi nama, nomor, level, XP, saldo, limit, dan status
// premium target. Target ala Elaina: mention, pengirim pesan yang
// dikutip, argumen nomor, atau diri sendiri. Bila render gagal, jatuh
// ke kartu teks dengan data yang sama (tetap menyebut target).
export const config = {
  name: 'usercard',
  alias: ['kartu', 'mycard'],
  category: 'main',
  description: { id: 'Kartu profil user sebagai gambar canvas berisi data user', en: 'User profile card as a canvas image with user data' },
  usage: '.usercard [@tag]',
  example: '.usercard',
  cooldown: 5,
}

export const i18n = {
  id: {
    usercard: {
      caption: '╭─❏ 🪪 「 *USERCARD* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɴᴏᴍᴏʀ: *@{number}*\n┊ ʟᴇᴠᴇʟ: *{level}* (XP {xp})\n┊ ꜱᴀʟᴅᴏ: *{balance}*\n┊ ʟɪᴍɪᴛ ʜᴀʀɪ ɪɴɪ: *{limit}*\n┊ ᴘʀᴇᴍɪᴜᴍ: *{premium}*\n╰━━━━━━━',
      premiumYes: 'Ya',
      premiumNo: 'Tidak',
      registered: 'Terdaftar sejak {date}',
      unregistered: 'Belum daftar',
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
    usercard: {
      caption: '╭─❏ 🪪 「 *USERCARD* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɴᴜᴍʙᴇʀ: *@{number}*\n┊ ʟᴇᴠᴇʟ: *{level}* (XP {xp})\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance}*\n┊ ʟɪᴍɪᴛ ᴛᴏᴅᴀʏ: *{limit}*\n┊ ᴘʀᴇᴍɪᴜᴍ: *{premium}*\n╰━━━━━━━',
      premiumYes: 'Yes',
      premiumNo: 'No',
      registered: 'Registered since {date}',
      unregistered: 'Not registered',
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

export const test = { input: '.usercard', expect: /usercard/i }

function digitsOf(jid) {
  return String(jid ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

export function rankKeyForLevel(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1))
  if (lv >= 25) return 'usercard.rank5'
  if (lv >= 15) return 'usercard.rank4'
  if (lv >= 8) return 'usercard.rank3'
  if (lv >= 4) return 'usercard.rank2'
  return 'usercard.rank1'
}

// Target kartu: mention pertama, pengirim pesan yang dikutip, argumen
// nomor, terakhir pengirim perintah sendiri.
export function resolveUsercardTarget(ctx) {
  const mentioned = ctx.mentionedJids?.[0]
  if (mentioned) return mentioned
  if (ctx.quoted?.sender) return ctx.quoted.sender
  const raw = String(ctx.args?.[0] ?? '').replace(/\D/g, '')
  if (raw.length > 5 && raw.length < 20) return `${raw}@s.whatsapp.net`
  return ctx.sender
}

export async function handler(ctx) {
  const targetJid = resolveUsercardTarget(ctx)
  const targetDigits = digitsOf(targetJid)
  const isSelf = targetDigits === digitsOf(ctx.sender)
  const profile = await getProfile(ctx.storage, targetDigits)
  const premium = await getPremiumStatus(ctx.storage, targetDigits).catch(() => ({ active: false }))
  const level = levelFromXp(profile.xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const progress = Math.max(0, (profile.xp || 0) - base)
  const needed = Math.max(1, next - base)
  const percent = Math.floor((progress / needed) * 100)
  const limitLeft = limitState(profile).left
  const name = profile.name || profile.regName || (isSelf ? ctx.pushName : '') || targetDigits
  const status = profile.registeredAt
    ? ctx.t('usercard.registered', { date: String(profile.registeredAt).slice(0, 10) })
    : ctx.t('usercard.unregistered')
  const caption = ctx.t('usercard.caption', {
    name,
    number: targetDigits,
    level,
    xp: profile.xp || 0,
    balance: profile.balance || 0,
    limit: limitLeft,
    premium: premium.active ? ctx.t('usercard.premiumYes') : ctx.t('usercard.premiumNo'),
  })
  const mentions = [`${targetDigits}@s.whatsapp.net`]

  try {
    const avatarBuffer = await fetchAvatarBuffer(ctx, targetJid)
    const image = await renderProfileCard({
      name,
      number: targetDigits,
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
      botName: process.env.BOT_NAME || 'KANA',
      labels: {
        level: ctx.t('usercard.cardLevel'),
        xp: ctx.t('usercard.cardXp'),
        balance: ctx.t('usercard.cardBalance'),
        limit: ctx.t('usercard.cardLimit'),
        rank: ctx.t('usercard.cardRank'),
      },
    })
    if (!Buffer.isBuffer(image) || !image.length) throw new Error('hasil render kosong')
    return await ctx.sock.sendMessage(ctx.chat, { image, caption, mentions }, { quoted: ctx.raw })
  } catch {
    // Jatuh ke kartu teks dengan data yang sama.
  }
  return ctx.sock.sendMessage(ctx.chat, { text: caption, mentions }, { quoted: ctx.raw })
}
