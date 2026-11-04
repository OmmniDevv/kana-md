import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'slot',
  alias: [],
  category: 'game',
  description: { id: 'Main mesin slot pakai saldo koin kamu', en: 'Play the slot machine with your coin balance' },
  usage: '.slot <bet>',
  example: '.slot 100',
  cooldown: 3,
}

export const SYMBOLS = ['🍒', '🍋', '🍇', '🍓', '🍉', '🔔', '⭐', '💎']

// Putar 3 reel. rng bisa diinjeksi untuk tes.
export function spin(rng = Math.random) {
  return [0, 1, 2].map(() => SYMBOLS[Math.floor(rng() * SYMBOLS.length)])
}

// Nilai hasil putaran: triple bintang x25, triple lain x10, dua sama x2.
// gross = total hadiah (bet x pengali), net = keuntungan bersih (gross - bet).
// Kalah: net = -bet.
export function evaluateSpin(reels, bet) {
  const [a, b, c] = reels
  if (a === b && b === c) {
    const multiplier = a === '⭐' ? 25 : 10
    return { kind: 'triple', multiplier, gross: bet * multiplier, net: bet * multiplier - bet }
  }
  if (a === b || b === c || a === c) {
    return { kind: 'pair', multiplier: 2, gross: bet * 2, net: bet }
  }
  return { kind: 'lose', multiplier: 0, gross: 0, net: -bet }
}

export const i18n = {
  id: {
    slot: {
      usage: 'Tulis jumlah betnya yaa, contoh: .slot 100. Bet minimal 10 dan maksimal 10000 koin~ 🎰',
      badBet: 'Betnya harus angka bulat antara 10 dan 10000 yaa~',
      noBalance: 'Mouu, saldo kamu kurang buat bet {bet} koin. Saldo kamu sekarang {balance} koin (╥﹏╥)',
      triple: 'JACKPOT TRIPLE! {reels} pengali x{multiplier}, untung bersih {net} koin! 🎉💖',
      pair: 'Dapet sepasang! {reels} pengali x{multiplier}, untung bersih {net} koin~ ✨',
      lose: 'Yahh belum beruntung... {reels} bet {bet} koin melayang. Coba lagi yaa (•̀ᴗ•́)و',
      balance: 'Saldo kamu sekarang: {balance} koin. {mood}',
      btnAgain: 'Putar Lagi',
      btnProfile: 'Profil',
      btnGames: 'Daftar Game',
    },
  },
  en: {
    slot: {
      usage: 'Write your bet amount, example: .slot 100. Minimum bet 10 and maximum 10000 coins~ 🎰',
      badBet: 'The bet must be a whole number between 10 and 10000~',
      noBalance: 'Mouu, your balance is not enough for a {bet} coin bet. Your balance is {balance} coins (╥﹏╥)',
      triple: 'TRIPLE JACKPOT! {reels} multiplier x{multiplier}, net profit {net} coins! 🎉💖',
      pair: 'You got a pair! {reels} multiplier x{multiplier}, net profit {net} coins~ ✨',
      lose: 'Aww not lucky yet... {reels} your {bet} coin bet is gone. Try again (•̀ᴗ•́)و',
      balance: 'Your balance now: {balance} coins. {mood}',
      btnAgain: 'Spin Again',
      btnProfile: 'Profile',
      btnGames: 'Game List',
    },
  },
}

export const test = { input: '.slot', expect: /bet/i }

export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('slot.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('slot.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance || 0
  if (balance < bet) return ctx.reply(ctx.t('slot.noBalance', { bet, balance }))
  const reels = spin()
  const result = evaluateSpin(reels, bet)
  const updated = await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance + result.net })
  const reelsText = reels.join(' | ')
  const head =
    result.kind === 'triple'
      ? ctx.t('slot.triple', { reels: reelsText, multiplier: result.multiplier, net: result.net })
      : result.kind === 'pair'
        ? ctx.t('slot.pair', { reels: reelsText, multiplier: result.multiplier, net: result.net })
        : ctx.t('slot.lose', { reels: reelsText, bet })
  const body = `${head}\n${ctx.t('slot.balance', { balance: updated.balance, mood: ctx.say(result.kind === 'lose' ? 'gagal' : 'senang') })}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('slot.btnAgain'), id: `.slot ${bet}` },
      { text: ctx.t('slot.btnProfile'), id: '.profil' },
      { text: ctx.t('slot.btnGames'), id: '.games' },
    ],
    textFallback: body,
  })
}
