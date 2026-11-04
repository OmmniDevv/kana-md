import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MB } from '@rexxhayanasi/elaina-baileys'
import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { logger } from '../../src/services/logger.js'
import { buildFakeContactQuoted, loadMenuBanner } from '../../src/ui/fake-thumb.js'
import { smallCaps, withButtonEmoji } from '../../src/config/templates.js'

const here = dirname(fileURLToPath(import.meta.url))
const BANNER_PATH = join(here, '../../assets/referal.jpg')

export const config = {
  name: 'referal',
  alias: ['ref', 'referral'],
  category: 'user',
  description: { id: 'Kode referalmu dan klaim bonus XP dari kode teman', en: 'Your referral code and claiming XP bonus from a friend code' },
  usage: '.referal atau .referal klaim <kode>',
  example: '.referal klaim KANA-XXXXXX',
  cooldown: 3,
}

export const REFERRER_BONUS = 50
export const CLAIMANT_BONUS = 25

export function referralCodeFor(digits) {
  let h = 2166136261
  const s = `ref:${digits}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `KANA-${(h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`
}

export const i18n = {
  id: {
    referal: {
      title: 'Referal KANA',
      heading: 'REFERAL KANA',
      codeLabel: 'Kode kamu',
      countLabel: 'Sudah mengundang',
      countUnit: 'orang',
      rewardClaimant: 'Teman yang klaim dapat',
      rewardReferrer: 'Kamu dapat',
      xpUnit: 'XP tiap orangnya',
      claimHint: 'Klaim kode teman pakai',
      claimCommand: '.referal klaim <kode>',
      btnCopy: 'Salin Kode',
      btnShare: 'Bagikan ke Teman',
      self: '╭─❏ 🙈 「 *ITU KODEMU SENDIRI* 」\n┊ Kode sendiri tidak bisa diklaim yaa~\n╰━━━━━━━ {mood}',
      unknown: '╭─❏ 🔍 「 *KODE TIDAK KETEMU* 」\n┊ Periksa lagi tulisan kodenya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🌸 「 *SUDAH PERNAH KLAIM* 」\n┊ Klaim kode referal cuma bisa satu kali saja yaa~\n╰━━━━━━━ {mood}',
      claimed: '╭─❏ 🎉 「 *KLAIM BERHASIL* 」\n┊ Kamu dapat *{claimant} XP*\n┊ Pemilik kode dapat *{referrer} XP*\n╰━━━━━━━\nSelamat datang di KANA~ {mood}',
    },
  },
  en: {
    referal: {
      title: 'KANA Referral',
      heading: 'KANA REFERRAL',
      codeLabel: 'Your code',
      countLabel: 'People invited',
      countUnit: 'people',
      rewardClaimant: 'Friends who claim get',
      rewardReferrer: 'You get',
      xpUnit: 'XP per person',
      claimHint: 'Claim a friend code with',
      claimCommand: '.referal klaim <code>',
      btnCopy: 'Copy Code',
      btnShare: 'Share to Friends',
      self: '╭─❏ 🙈 「 *THAT IS YOUR OWN CODE* 」\n┊ You cannot claim your own code~\n╰━━━━━━━ {mood}',
      unknown: '╭─❏ 🔍 「 *CODE NOT FOUND* 」\n┊ Please check the spelling once more~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🌸 「 *ALREADY CLAIMED* 」\n┊ A referral code can only be claimed once~\n╰━━━━━━━ {mood}',
      claimed: '╭─❏ 🎉 「 *CLAIM SUCCESSFUL* 」\n┊ You got *{claimant} XP*\n┊ The code owner got *{referrer} XP*\n╰━━━━━━━\nWelcome to KANA~ {mood}',
    },
  },
}

export const test = { input: '.referal', expect: /referal/i }

function botNumber(ctx) {
  return String(process.env.BOT_NUMBER || ctx.botJid || ctx.sock?.user?.id || '').replace(/\D/g, '')
}

function buildCardBody(ctx, { code, count }) {
  const lines = [
    `╭─❏ 🎁 「 *${ctx.t('referal.heading')}* 」`,
    `┊ ${smallCaps(ctx.t('referal.codeLabel'))}: *${code}*`,
    `┊ ${smallCaps(ctx.t('referal.countLabel'))}: *${count} ${ctx.t('referal.countUnit')}*`,
    '╰━━━━━━━',
    `💎 ${ctx.t('referal.rewardClaimant')} *${CLAIMANT_BONUS} ${ctx.t('referal.xpUnit')}*`,
    `👑 ${ctx.t('referal.rewardReferrer')} *${REFERRER_BONUS} ${ctx.t('referal.xpUnit')}*`,
    '',
    `${ctx.t('referal.claimHint')}: *${ctx.t('referal.claimCommand')}* ${ctx.say('senang')}`,
  ]
  return lines.join('\n')
}

async function sendReferralCard(ctx, { code, count }) {
  const body = buildCardBody(ctx, { code, count })
  const banner = await loadMenuBanner(BANNER_PATH)
  const contextInfo = {
    mentionedJid: [`${ctx.senderDigits}@s.whatsapp.net`],
    forwardingScore: 999,
    isForwarded: true,
  }
  const quoted = buildFakeContactQuoted({ botName: process.env.BOT_NAME || 'KANA' })
  const number = botNumber(ctx)
  const shareUrl = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(`.referal klaim ${code}`)}`
    : null
  try {
    const builder = new MB.Button(ctx.sock)
    builder.setTitle(ctx.t('referal.title'))
    builder.setBody(body)
    builder.setFooter(ctx.t('menu.footer'))
    if (banner) builder.setImage(banner)
    builder.setContextInfo({ ...contextInfo, mentionedJid: [...contextInfo.mentionedJid] })
    builder.addCopy(withButtonEmoji(ctx.t('referal.btnCopy'), 'copy'), code)
    if (shareUrl) builder.addUrl(withButtonEmoji(ctx.t('referal.btnShare'), 'link'), shareUrl)
    return await builder.send(ctx.chat, { quoted })
  } catch (err) {
    logger.warn({ err: err.message }, 'MB.Button referal gagal, fallback ke gambar plus caption')
    const content = banner
      ? { image: banner, caption: body, contextInfo }
      : { text: body, contextInfo }
    return ctx.sock.sendMessage(ctx.chat, content, { quoted })
  }
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const myCode = referralCodeFor(ctx.senderDigits)
  const claimMatch = arg.match(/^klaim\s+(\S+)$/i) || arg.match(/^claim\s+(\S+)$/i)
  if (claimMatch) {
    const code = claimMatch[1].toUpperCase()
    if (code === myCode) return ctx.reply(ctx.t('referal.self', { mood: ctx.say('malu') }))
    const profile = await getProfile(ctx.storage, ctx.senderDigits)
    if (profile.referredBy) return ctx.reply(ctx.t('referal.already', { mood: ctx.say('malu') }))
    const ownerDigits = await ctx.storage.get('referral', `code:${code}`)
    if (!ownerDigits) return ctx.reply(ctx.t('referal.unknown', { mood: ctx.say('gagal') }))
    await updateProfile(ctx.storage, ctx.senderDigits, { referredBy: ownerDigits })
    await addXp(ctx.storage, ctx.senderDigits, CLAIMANT_BONUS)
    await addXp(ctx.storage, ownerDigits, REFERRER_BONUS)
    const count = Number((await ctx.storage.get('referral', `count:${ownerDigits}`)) ?? 0) + 1
    await ctx.storage.set('referral', `count:${ownerDigits}`, count)
    return ctx.reply(ctx.t('referal.claimed', { claimant: CLAIMANT_BONUS, referrer: REFERRER_BONUS, mood: ctx.say('senang') }))
  }
  await ctx.storage.set('referral', `code:${myCode}`, ctx.senderDigits)
  const count = Number((await ctx.storage.get('referral', `count:${ctx.senderDigits}`)) ?? 0)
  return sendReferralCard(ctx, { code: myCode, count })
}
