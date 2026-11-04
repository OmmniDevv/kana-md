import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { applyHit, handValue, formatHand, payoutFor } from '../../src/services/blackjack.js'

export const config = {
  name: 'hit',
  alias: [],
  category: 'game',
  description: { id: 'Ambil satu kartu lagi di permainan blackjack aktif', en: 'Take one more card in your active blackjack game' },
  usage: '.hit',
  example: '.hit',
  cooldown: 2,
}

export const i18n = {
  id: {
    hit: {
      noGame: 'Belum ada permainan blackjack yang jalan nih. Mulai dulu pakai .blackjack <bet> yaa~ 🃏',
      drawn: 'Kamu ambil kartu...\n🃏 Kamu ({value}): {hand}\nMasih di bawah 21, mau .hit lagi atau .stand?~',
      bust: 'BUST! 💥 Kamu ({value}): {hand}\nLewat 21, bet {bet} koin melayang... (╥﹏╥) Saldo sekarang {balance} koin.',
      win: 'Menang! 🎉 Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nTotal kembali {payout} koin. Saldo sekarang {balance} koin~',
      lose: 'Kalah nih... Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nBet {bet} koin melayang. Saldo sekarang {balance} koin (╥﹏╥)',
      push: 'Seri! Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nBet {bet} koin balik utuh. Saldo sekarang {balance} koin~ 🌸',
      btnHit: 'Hit Lagi',
      btnStand: 'Stand',
      btnStart: 'Mulai Blackjack',
      btnAgain: 'Main Lagi',
    },
  },
  en: {
    hit: {
      noGame: 'No blackjack game is running yet. Start one with .blackjack <bet> first~ 🃏',
      drawn: 'You draw a card...\n🃏 You ({value}): {hand}\nStill under 21, .hit again or .stand?~',
      bust: 'BUST! 💥 You ({value}): {hand}\nOver 21, your {bet} coin bet is gone... (╥﹏╥) Balance now {balance} coins.',
      win: 'You win! 🎉 You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nTotal return {payout} coins. Balance now {balance} coins~',
      lose: 'You lose... You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nYour {bet} coin bet is gone. Balance now {balance} coins (╥﹏╥)',
      push: 'A push! You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nYour {bet} coin bet returns in full. Balance now {balance} coins~ 🌸',
      btnHit: 'Hit Again',
      btnStand: 'Stand',
      btnStart: 'Start Blackjack',
      btnAgain: 'Play Again',
    },
  },
}

export async function settleAndShow(ctx, state, prefix) {
  const payout = payoutFor(state)
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const newBalance = (profile.balance || 0) + payout
  if (payout) await updateProfile(ctx.storage, ctx.senderDigits, { balance: newBalance })
  await ctx.storage.delete('kv', `bj:${ctx.senderDigits}`)
  const vars = {
    pvalue: handValue(state.player),
    hand: formatHand(state.player),
    dvalue: handValue(state.dealer),
    dealer: formatHand(state.dealer),
    bet: state.bet,
    payout,
    balance: newBalance,
    value: handValue(state.player),
  }
  const body =
    state.result === 'bust'
      ? ctx.t(`${prefix}.bust`, vars)
      : ctx.t(`${prefix}.${state.result === 'win' || state.result === 'blackjack' ? 'win' : state.result}`, vars)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t(`${prefix}.btnAgain`), id: `.blackjack ${state.bet}` }],
    textFallback: body,
  })
}

export const test = { input: '.hit', expect: /blackjack/i }

export async function handler(ctx) {
  const state = await ctx.storage.get('kv', `bj:${ctx.senderDigits}`)
  if (!state || state.phase !== 'player') {
    const body = ctx.t('hit.noGame')
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('hit.btnStart'), id: '.blackjack 100' }],
      textFallback: body,
    })
  }
  applyHit(state)
  if (state.phase === 'done') return settleAndShow(ctx, state, 'hit')
  await ctx.storage.set('kv', `bj:${ctx.senderDigits}`, state)
  const body = ctx.t('hit.drawn', { value: handValue(state.player), hand: formatHand(state.player) })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('hit.btnHit'), id: '.hit' },
      { text: ctx.t('hit.btnStand'), id: '.stand' },
    ],
    textFallback: body,
  })
}
