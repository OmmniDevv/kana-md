import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'coinflip',
  alias: ['lemparkoin'],
  category: 'fun',
  description: { id: 'Lempar koin taruhan: pilih angka atau gambar, taruhan koin virtual profil', en: 'Coin flip bet: pick heads or tails, bet with virtual profile coins' },
  usage: '.coinflip <angka|gambar> <jumlah koin>',
  example: '.coinflip angka 100',
  cooldown: 5,
}

export const i18n = {
  id: {
    coinflip: {
      hint: 'Caranya: .coinflip angka 100 atau .coinflip gambar 50. Taruhan memakai koin profilmu yaa~',
      poor: 'Koinmu {coins}, kurang buat taruhan {bet}. Kumpulkan dulu lewat .kerja atau .daily yaa~ {mood}',
      win: '🪙 Koin menunjukkan *{side}*!\nKamu benar, menang *{bet} koin*. Saldo sekarang {balance} koin {mood}',
      lose: '🪙 Koin menunjukkan *{side}*!\nPilihanmu {pick}, jadi kalah *{bet} koin*. Saldo sekarang {balance} koin {mood}',
      heads: 'ANGKA', tails: 'GAMBAR',
    },
  },
  en: {
    coinflip: {
      hint: 'How: .coinflip angka 100 or .coinflip gambar 50. Bets use your profile coins~',
      poor: 'You have {coins} coins, not enough for a {bet} bet. Earn some with .kerja or .daily first~ {mood}',
      win: '🪙 The coin shows *{side}*!\nYou are right, won *{bet} coins*. Balance now {balance} coins {mood}',
      lose: '🪙 The coin shows *{side}*!\nYou picked {pick}, so you lost *{bet} coins*. Balance now {balance} coins {mood}',
      heads: 'HEADS', tails: 'TAILS',
    },
  },
}

export const test = { input: '.coinflip', expect: /coinflip|koin/i }

export async function handler(ctx) {
  const [pickRaw, betRaw] = (ctx.text || '').trim().toLowerCase().split(/\s+/)
  const pick = pickRaw === 'angka' || pickRaw === 'heads' ? 'heads' : pickRaw === 'gambar' || pickRaw === 'tails' ? 'tails' : null
  const bet = parseInt(betRaw, 10)
  if (!pick || !Number.isFinite(bet) || bet < 10 || bet > 100000) return ctx.reply(ctx.t('coinflip.hint'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if ((profile.balance ?? 0) < bet) {
    return ctx.reply(ctx.t('coinflip.poor', { coins: profile.balance ?? 0, bet, mood: ctx.say('gagal') }))
  }
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const win = result === pick
  const balance = (profile.balance ?? 0) + (win ? bet : -bet)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance })
  const side = ctx.t(result === 'heads' ? 'coinflip.heads' : 'coinflip.tails')
  if (win) return ctx.reply(ctx.t('coinflip.win', { side, bet, balance, mood: ctx.say('sukses') }))
  return ctx.reply(ctx.t('coinflip.lose', {
    side,
    pick: ctx.t(pick === 'heads' ? 'coinflip.heads' : 'coinflip.tails'),
    bet, balance, mood: ctx.say('gagal'),
  }))
}
