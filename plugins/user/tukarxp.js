import { getProfile, saveProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'tukarxp',
  alias: ['tukar', 'pointomoney', 'moneytopoin', 'tomoney'],
  category: 'user',
  description: { id: 'Tukar XP menjadi koin saldo: 10 XP untuk 1 koin (level ikut turun)', en: 'Exchange XP into balance coins: 10 XP for 1 coin (level goes down too)' },
  usage: '.tukarxp <jumlah XP kelipatan 10>',
  example: '.tukarxp 100',
  cooldown: 3,
}

export const XP_PER_COIN = 10

export const i18n = {
  id: {
    tukarxp: {
      ask: 'Tulis jumlah XP kelipatan 10 yang mau ditukar yaa. Contoh: .tukarxp 100. XP-mu sekarang {xp}. {mood}',
      invalid: 'Jumlahnya harus kelipatan {rate} dan minimal {rate} yaa~ {mood}',
      notEnough: 'XP-mu belum cukup. XP-mu sekarang {xp}, yang mau ditukar {amount}. {mood}',
      done: '✅ Penukaran beres! {amount} XP menjadi {coins} koin.\nXP tersisa: {xp} | Saldo sekarang: {balance} koin {mood}',
    },
  },
  en: {
    tukarxp: {
      ask: 'Write the XP amount in multiples of 10 to exchange. Example: .tukarxp 100. Your XP is now {xp}. {mood}',
      invalid: 'The amount must be a multiple of {rate} and at least {rate}~ {mood}',
      notEnough: 'Your XP is not enough. Your XP is now {xp}, you tried to exchange {amount}. {mood}',
      done: '✅ Exchange done! {amount} XP became {coins} coins.\nXP left: {xp} | Balance now: {balance} coins {mood}',
    },
  },
}

export const test = { input: '.tukarxp', expect: /tukar|exchange/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const amount = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isFinite(amount)) return ctx.reply(ctx.t('tukarxp.ask', { xp: profile.xp, mood: ctx.say('mikir') }))
  if (amount < XP_PER_COIN || amount % XP_PER_COIN !== 0) return ctx.reply(ctx.t('tukarxp.invalid', { rate: XP_PER_COIN, mood: ctx.say('gagal') }))
  if (profile.xp < amount) return ctx.reply(ctx.t('tukarxp.notEnough', { xp: profile.xp, amount, mood: ctx.say('gagal') }))
  const coins = amount / XP_PER_COIN
  profile.xp -= amount
  profile.balance = (profile.balance ?? 0) + coins
  await saveProfile(ctx.storage, ctx.senderDigits, profile)
  return ctx.reply(ctx.t('tukarxp.done', { amount, coins, xp: profile.xp, balance: profile.balance, mood: ctx.say('sukses') }))
}
