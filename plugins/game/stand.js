import { sendButtons } from '../../src/ui/buttons.js'
import { applyStand } from '../../src/services/blackjack.js'
import { settleAndShow } from './hit.js'

export const config = {
  name: 'stand',
  alias: [],
  category: 'game',
  description: { id: 'Berhenti ambil kartu dan akhiri giliran blackjack', en: 'Stop taking cards and end your blackjack turn' },
  usage: '.stand',
  example: '.stand',
  cooldown: 2,
}

export const i18n = {
  id: {
    stand: {
      noGame: 'Belum ada permainan blackjack yang jalan nih. Mulai dulu pakai .blackjack <bet> yaa~ 🃏',
      bust: 'BUST! 💥 Kamu ({value}): {hand}\nLewat 21, bet {bet} koin melayang... (╥﹏╥) Saldo sekarang {balance} koin.',
      win: 'Menang! 🎉 Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nTotal kembali {payout} koin. Saldo sekarang {balance} koin~',
      lose: 'Kalah nih... Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nBet {bet} koin melayang. Saldo sekarang {balance} koin (╥﹏╥)',
      push: 'Seri! Kamu ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nBet {bet} koin balik utuh. Saldo sekarang {balance} koin~ 🌸',
      btnStart: 'Mulai Blackjack',
      btnAgain: 'Main Lagi',
    },
  },
  en: {
    stand: {
      noGame: 'No blackjack game is running yet. Start one with .blackjack <bet> first~ 🃏',
      bust: 'BUST! 💥 You ({value}): {hand}\nOver 21, your {bet} coin bet is gone... (╥﹏╥) Balance now {balance} coins.',
      win: 'You win! 🎉 You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nTotal return {payout} coins. Balance now {balance} coins~',
      lose: 'You lose... You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nYour {bet} coin bet is gone. Balance now {balance} coins (╥﹏╥)',
      push: 'A push! You ({pvalue}): {hand}\nDealer ({dvalue}): {dealer}\nYour {bet} coin bet returns in full. Balance now {balance} coins~ 🌸',
      btnStart: 'Start Blackjack',
      btnAgain: 'Play Again',
    },
  },
}

export async function handler(ctx) {
  const state = await ctx.storage.get('kv', `bj:${ctx.senderDigits}`)
  if (!state || state.phase !== 'player') {
    const body = ctx.t('stand.noGame')
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('stand.btnStart'), id: '.blackjack 100' }],
      textFallback: body,
    })
  }
  applyStand(state)
  return settleAndShow(ctx, state, 'stand')
}
