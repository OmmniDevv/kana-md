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
      noGame: '╭─❏ ✨ 「 *HIT* 」\n┊ Belum ada permainan blackjack yang jalan nih. Mulai dulu pakai .blackjack <bet> yaa~ 🃏\n╰━━━━━━━',
      drawn: '╭─❏ ✨ 「 *HIT* 」\n┊ Kamu ambil kartu...\n┊ 🃏 Kamu ({value}): {hand}\n┊ Masih di bawah 21, mau .hit lagi atau .stand?~\n╰━━━━━━━',
      bust: '╭─❏ ✨ 「 *HIT* 」\n┊ BUST! 💥 Kamu ({value}): {hand}\n┊ Lewat 21, bet {bet} koin melayang... (╥﹏╥) Saldo sekarang {balance} koin.\n╰━━━━━━━',
      win: '╭─❏ ✨ 「 *HIT* 」\n┊ Menang! 🎉 Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Total kembali {payout} koin. Saldo sekarang {balance} koin~\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *HIT* 」\n┊ Kalah nih... Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Bet {bet} koin melayang. Saldo sekarang {balance} koin (╥﹏╥)\n╰━━━━━━━',
      push: '╭─❏ ✨ 「 *HIT* 」\n┊ Seri! Kamu ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Bet {bet} koin balik utuh. Saldo sekarang {balance} koin~ 🌸\n╰━━━━━━━',
      btnHit: 'Hit Lagi',
      btnStand: 'Stand',
      btnStart: 'Mulai Blackjack',
      btnAgain: 'Main Lagi',
    },
  },
  en: {
    hit: {
      noGame: '╭─❏ ✨ 「 *HIT* 」\n┊ No blackjack game is running yet. Start one with .blackjack <bet> first~ 🃏\n╰━━━━━━━',
      drawn: '╭─❏ ✨ 「 *HIT* 」\n┊ You draw a card...\n┊ 🃏 You ({value}): {hand}\n┊ Still under 21, .hit again or .stand?~\n╰━━━━━━━',
      bust: '╭─❏ ✨ 「 *HIT* 」\n┊ BUST! 💥 You ({value}): {hand}\n┊ Over 21, your {bet} coin bet is gone... (╥﹏╥) Balance now {balance} coins.\n╰━━━━━━━',
      win: '╭─❏ ✨ 「 *HIT* 」\n┊ You win! 🎉 You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Total return {payout} coins. Balance now {balance} coins~\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *HIT* 」\n┊ You lose... You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Your {bet} coin bet is gone. Balance now {balance} coins (╥﹏╥)\n╰━━━━━━━',
      push: '╭─❏ ✨ 「 *HIT* 」\n┊ A push! You ({pvalue}): {hand}\n┊ Dealer ({dvalue}): {dealer}\n┊ Your {bet} coin bet returns in full. Balance now {balance} coins~ 🌸\n╰━━━━━━━',
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
