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
      noGame: '╭─❏ ✨ 「 *STAND* 」\n┊ Belum ada permainan blackjack yang jalan nih. Mulai dulu pakai .blackjack <bet> yaa~ 🃏\n╰━━━━━━━',
      bust: '╭─❏ ✨ 「 *STAND* 」\n┊ BUST! 💥 Kamu ({value}): {hand}\n┊ Lewat 21, bet {bet} koin melayang... (╥﹏╥) Saldo sekarang {balance} koin.\n╰━━━━━━━',
      win: '╭─❏ ✨ 「 *STAND* 」\n┊ Menang! 🎉 Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Total kembali {payout} koin. Saldo sekarang {balance} koin~\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *STAND* 」\n┊ Kalah nih... Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Bet {bet} koin melayang. Saldo sekarang {balance} koin (╥﹏╥)\n╰━━━━━━━',
      push: '╭─❏ ✨ 「 *STAND* 」\n┊ Seri! Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Bet {bet} koin balik utuh. Saldo sekarang {balance} koin~ 🌸\n╰━━━━━━━',
      btnStart: 'Mulai Blackjack',
      btnAgain: 'Main Lagi',
    },
  },
  en: {
    stand: {
      noGame: '╭─❏ ✨ 「 *STAND* 」\n┊ No blackjack game is running yet. Start one with .blackjack <bet> first~ 🃏\n╰━━━━━━━',
      bust: '╭─❏ ✨ 「 *STAND* 」\n┊ BUST! 💥 You ({value}): {hand}\n┊ Over 21, your {bet} coin bet is gone... (╥﹏╥) Balance now {balance} coins.\n╰━━━━━━━',
      win: '╭─❏ ✨ 「 *STAND* 」\n┊ You win! 🎉 You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Total return {payout} coins. Balance now {balance} coins~\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *STAND* 」\n┊ You lose... You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Your {bet} coin bet is gone. Balance now {balance} coins (╥﹏╥)\n╰━━━━━━━',
      push: '╭─❏ ✨ 「 *STAND* 」\n┊ A push! You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Your {bet} coin bet returns in full. Balance now {balance} coins~ 🌸\n╰━━━━━━━',
      btnStart: 'Start Blackjack',
      btnAgain: 'Play Again',
    },
  },
}

export const test = { input: '.stand', expect: /blackjack/i }

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
