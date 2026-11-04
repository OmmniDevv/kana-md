import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { startGame, handValue, formatHand, formatCard, payoutFor } from '../../src/services/blackjack.js'

export const config = {
  name: 'blackjack',
  alias: ['bj'],
  category: 'game',
  description: { id: 'Main blackjack lawan KANA pakai saldo koin kamu', en: 'Play blackjack against KANA with your coin balance' },
  usage: '.blackjack <bet>',
  example: '.blackjack 100',
  cooldown: 3,
}

export const i18n = {
  id: {
    blackjack: {
      usage: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Tulis jumlah betnya yaa, contoh: .blackjack 100. Bet minimal 10 dan maksimal 10000 koin~ 🃏\n╰━━━━━━━',
      badBet: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Betnya harus angka bulat antara 10 dan 10000 yaa~\n╰━━━━━━━',
      noBalance: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Mouu, saldo kamu kurang buat bet {bet} koin. Saldo kamu sekarang {balance} koin (╥﹏╥)\n╰━━━━━━━',
      inProgress: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Permainanmu masih jalan nih!\n┊ 🃏 Kamu ({value}): {hand}\n┊ Kartu terbuka dealer: {dealer}\n┊ Lanjut pakai .hit atau .stand yaa~\n╰━━━━━━━',
      started: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Blackjack dimulai, bet {bet} koin!\n┊ 🃏 Kamu ({value}): {hand}\n┊ 🏠 Dealer: {dealer} + kartu tertutup\n┊ .hit buat ambil kartu, .stand buat berhenti~\n╰━━━━━━━',
      natural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ BLACKJACK NATURAL! 🃏 {hand} langsung 21!\n┊ Kamu dibayar 3:2, total kembali {payout} koin. Saldo sekarang {balance} koin~ 🎉💖\n╰━━━━━━━',
      dealerNatural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Ehh, dealer dapet blackjack natural... {hand} lawan dealer {dealer}. Bet {bet} koin melayang (╥﹏╥) Saldo sekarang {balance} koin.\n╰━━━━━━━',
      pushNatural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Kita sama-sama blackjack natural! Bet {bet} koin balik utuh. Saldo sekarang {balance} koin~ 🌸\n╰━━━━━━━',
      btnHit: 'Hit',
      btnStand: 'Stand',
      btnAgain: 'Main Lagi',
      btnProfile: 'Profil',
    },
  },
  en: {
    blackjack: {
      usage: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Write your bet amount, example: .blackjack 100. Minimum bet 10 and maximum 10000 coins~ 🃏\n╰━━━━━━━',
      badBet: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ The bet must be a whole number between 10 and 10000~\n╰━━━━━━━',
      noBalance: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Mouu, your balance is not enough for a {bet} coin bet. Your balance is {balance} coins (╥﹏╥)\n╰━━━━━━━',
      inProgress: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Your game is still running!\n┊ 🃏 You ({value}): {hand}\n┊ Dealer open card: {dealer}\n┊ Continue with .hit or .stand~\n╰━━━━━━━',
      started: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Blackjack started, bet {bet} coins!\n┊ 🃏 You ({value}): {hand}\n┊ 🏠 Dealer: {dealer} + a hidden card\n┊ .hit to take a card, .stand to stop~\n╰━━━━━━━',
      natural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ NATURAL BLACKJACK! 🃏 {hand} is an instant 21!\n┊ You are paid 3:2, total return {payout} coins. Balance now {balance} coins~ 🎉💖\n╰━━━━━━━',
      dealerNatural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ Eh, the dealer got a natural blackjack... {hand} against dealer {dealer}. Your {bet} coin bet is gone (╥﹏╥) Balance now {balance} coins.\n╰━━━━━━━',
      pushNatural: '╭─❏ ✨ 「 *BLACKJACK* 」\n┊ We both got natural blackjacks! Your {bet} coin bet returns in full. Balance now {balance} coins~ 🌸\n╰━━━━━━━',
      btnHit: 'Hit',
      btnStand: 'Stand',
      btnAgain: 'Play Again',
      btnProfile: 'Profile',
    },
  },
}

export const stateKey = (digits) => `bj:${digits}`

export const test = { input: '.blackjack', expect: /bet/i }

export async function handler(ctx) {
  const existing = await ctx.storage.get('kv', stateKey(ctx.senderDigits))
  if (existing && existing.phase === 'player') {
    const body = ctx.t('blackjack.inProgress', {
      value: handValue(existing.player),
      hand: formatHand(existing.player),
      dealer: formatCard(existing.dealer[0]),
    })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [
        { text: ctx.t('blackjack.btnHit'), id: '.hit' },
        { text: ctx.t('blackjack.btnStand'), id: '.stand' },
      ],
      textFallback: body,
    })
  }
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('blackjack.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('blackjack.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance || 0
  if (balance < bet) return ctx.reply(ctx.t('blackjack.noBalance', { bet, balance }))
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance - bet })
  const state = startGame(bet)
  if (state.phase === 'done') {
    const payout = payoutFor(state)
    const updated = await getProfile(ctx.storage, ctx.senderDigits)
    const newBalance = (updated.balance || 0) + payout
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: newBalance })
    await ctx.storage.delete('kv', stateKey(ctx.senderDigits))
    const body =
      state.result === 'blackjack'
        ? ctx.t('blackjack.natural', { hand: formatHand(state.player), payout, balance: newBalance })
        : state.result === 'push'
          ? ctx.t('blackjack.pushNatural', { bet, balance: newBalance })
          : ctx.t('blackjack.dealerNatural', {
              hand: formatHand(state.player),
              dealer: formatHand(state.dealer),
              bet,
              balance: newBalance,
            })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [
        { text: ctx.t('blackjack.btnAgain'), id: `.blackjack ${bet}` },
        { text: ctx.t('blackjack.btnProfile'), id: '.profil' },
      ],
      textFallback: body,
    })
  }
  await ctx.storage.set('kv', stateKey(ctx.senderDigits), state)
  const body = ctx.t('blackjack.started', {
    bet,
    value: handValue(state.player),
    hand: formatHand(state.player),
    dealer: formatCard(state.dealer[0]),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('blackjack.btnHit'), id: '.hit' },
      { text: ctx.t('blackjack.btnStand'), id: '.stand' },
    ],
    textFallback: body,
  })
}
