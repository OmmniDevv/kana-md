import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

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
      body: '🎁 KODE REFERALMU\n\nKode: *{code}*\nSudah mengundang: {count} orang\n\nBagikan kodemu, teman yang klaim dapat {claimant} XP dan kamu dapat {referrer} XP tiap orangnya. Klaim punya teman dengan: .referal klaim <kode> {mood}',
      btnClaim: '🎁 Klaim Kode',
      self: 'Itu kodemu sendiri, tidak bisa klaim punya sendiri yaa~ {mood}',
      unknown: 'Kode referalnya tidak ketemu. Periksa lagi tulisannya yaa~ {mood}',
      already: 'Kamu sudah pernah klaim kode referal, satu kali saja yaa~ {mood}',
      claimed: '🎉 Klaim berhasil! Kamu dapat {claimant} XP dan pemilik kode dapat {referrer} XP. Selamat datang di KANA~ {mood}',
    },
  },
  en: {
    referal: {
      title: 'KANA Referral',
      body: '🎁 YOUR REFERRAL CODE\n\nCode: *{code}*\nPeople invited: {count}\n\nShare your code, friends who claim get {claimant} XP and you get {referrer} XP per person. Claim a friend code with: .referal klaim <code> {mood}',
      btnClaim: '🎁 Claim a Code',
      self: 'That is your own code, you cannot claim your own~ {mood}',
      unknown: 'That referral code was not found. Please check the spelling~ {mood}',
      already: 'You already claimed a referral code, only once~ {mood}',
      claimed: '🎉 Claim successful! You got {claimant} XP and the code owner got {referrer} XP. Welcome to KANA~ {mood}',
    },
  },
}

export const test = { input: '.referal', expect: /referal/i }

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
  const body = ctx.t('referal.body', { code: myCode, count, claimant: CLAIMANT_BONUS, referrer: REFERRER_BONUS, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('referal.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('referal.btnClaim'), id: '.referal' }],
    textFallback: body,
  })
}
