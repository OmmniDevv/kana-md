// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang undian angka beneran melawan saldo RPG: pasang
// angka 2D/3D/4D plus taruhan, angka diundi dari RNG, tabel pembayaran
// dinyatakan terbuka, saldo berubah sesuai hasil.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'togel',
  alias: [],
  category: 'game',
  description: { id: 'Undian angka togel koin: pasang angka 2D/3D/4D dan taruhan, angka diundi acak, tabel pembayaran terbuka', en: 'Coin lottery: bet a 2D/3D/4D number, the draw is random with a published payout table' },
  usage: '.togel <angka 2-4 digit> <taruhan>',
  example: '.togel 42 100',
  cooldown: 5,
}

// Tabel pembayaran (pengali total yang dikembalikan, termasuk modal):
// pas persis 2D x70, 3D x400, 4D x3000. Ekoran: 4D kena 3 digit
// terakhir x50, kena 2 digit terakhir x5; 3D kena 2 digit terakhir x5.
export const PAYOUTS = { 2: 70, 3: 400, 4: 3000 }
export const TAIL_PAYOUTS = { last3: 50, last2: 5 }

export function resolveTogel(guess, drawn, bet) {
  const g = String(guess)
  const d = String(drawn)
  if (g === d) return { tier: 'exact', multiplier: PAYOUTS[g.length] ?? 0 }
  if (g.length === 4 && g.slice(1) === d.slice(1)) return { tier: 'last3', multiplier: TAIL_PAYOUTS.last3 }
  if (g.length >= 3 && g.slice(-2) === d.slice(-2)) return { tier: 'last2', multiplier: TAIL_PAYOUTS.last2 }
  return { tier: 'lose', multiplier: 0 }
}

export function drawNumber(len, rng = Math.random) {
  return String(Math.floor(rng() * 10 ** len)).padStart(len, '0')
}

export const i18n = {
  id: {
    togel: {
      usage: '╭─❏ 🎟️ 「 *TOGEL KOIN* 」\n┊ Pasang angkamu: *.togel <angka> <taruhan>*\n┊ Contoh: *.togel 42 100*\n┊ Tabel pembayaran (total kembali termasuk modal):\n┊ 2D pas persis x70 | 3D x400 | 4D x3000\n┊ 4D kena 3 digit ekor x50, kena 2 digit ekor x5\n┊ 3D kena 2 digit ekor x5\n╰━━━━━━━',
      bad: '╭─❏ 🎟️ 「 *TOGEL KOIN* 」\n┊ Angkanya harus 2 sampai 4 digit dan taruhannya angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, taruhan *{bet} koin* tidak cukup~\n╰━━━━━━━',
      exact: '╭─❏ 🎟️ 「 *TOGEL KOIN* 」\n┊ ANGKA KELUAR: *{drawn}*\n┊ Angkamu *{guess}* PAS PERSIS! Pengali x{multiplier}\n┊ Dibayar *{payout} koin*, saldo sekarang *{balance} koin*\n╰━━━━━━━',
      tail: '╭─❏ 🎟️ 「 *TOGEL KOIN* 」\n┊ ANGKA KELUAR: *{drawn}*\n┊ Angkamu *{guess}* kena ekor {tail}! Pengali x{multiplier}\n┊ Dibayar *{payout} koin*, saldo sekarang *{balance} koin*\n╰━━━━━━━',
      lose: '╭─❏ 🎟️ 「 *TOGEL KOIN* 」\n┊ ANGKA KELUAR: *{drawn}*\n┊ Angkamu *{guess}* belum beruntung, taruhan *{bet} koin* melayang~\n┊ Saldo sekarang *{balance} koin*\n╰━━━━━━━',
      btnAgain: '🎟️ Pasang Lagi',
    },
  },
  en: {
    togel: {
      usage: '╭─❏ 🎟️ 「 *COIN LOTTERY* 」\n┊ Place your number: *.togel <number> <bet>*\n┊ Example: *.togel 42 100*\n┊ Payout table (total return including stake):\n┊ 2D exact x70 | 3D x400 | 4D x3000\n┊ 4D last 3 digits x50, last 2 digits x5\n┊ 3D last 2 digits x5\n╰━━━━━━━',
      bad: '╭─❏ 🎟️ 「 *COIN LOTTERY* 」\n┊ The number must be 2 to 4 digits and the bet a whole number from 10 to 10000~\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, a *{bet} coin* bet is not covered~\n╰━━━━━━━',
      exact: '╭─❏ 🎟️ 「 *COIN LOTTERY* 」\n┊ ᴅʀᴀᴡɴ ɴᴜᴍʙᴇʀ: *{drawn}*\n┊ Your number *{guess}* is an EXACT match! Multiplier x{multiplier}\n┊ Paid *{payout} coins*, balance now *{balance} coins*\n╰━━━━━━━',
      tail: '╭─❏ 🎟️ 「 *COIN LOTTERY* 」\n┊ ᴅʀᴀᴡɴ ɴᴜᴍʙᴇʀ: *{drawn}*\n┊ Your number *{guess}* hit the last {tail} digits! Multiplier x{multiplier}\n┊ Paid *{payout} coins*, balance now *{balance} coins*\n╰━━━━━━━',
      lose: '╭─❏ 🎟️ 「 *COIN LOTTERY* 」\n┊ ᴅʀᴀᴡɴ ɴᴜᴍʙᴇʀ: *{drawn}*\n┊ Your number *{guess}* was not lucky, the *{bet} coin* bet is gone~\n┊ Balance now *{balance} coins*\n╰━━━━━━━',
      btnAgain: '🎟️ Bet Again',
    },
  },
}

export const test = { input: '.togel 42 100', expect: /angka keluar|saldo kurang|drawn|not enough/i }

export async function handler(ctx) {
  const guess = (ctx.args?.[0] ?? '').trim()
  const bet = Number(ctx.args?.[1])
  if (!guess && !ctx.args?.[1]) return ctx.reply(ctx.t('togel.usage'))
  if (!/^\d{2,4}$/.test(guess) || !Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('togel.bad'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  if (balance < bet) return ctx.reply(ctx.t('togel.poor', { balance, bet }))
  const drawn = drawNumber(guess.length)
  const r = resolveTogel(guess, drawn, bet)
  const payout = r.multiplier * bet
  const next = balance - bet + payout
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: next })
  let body
  if (r.tier === 'exact') body = ctx.t('togel.exact', { drawn, guess, multiplier: r.multiplier, payout, balance: next })
  else if (r.tier === 'last3' || r.tier === 'last2') body = ctx.t('togel.tail', { drawn, guess, tail: r.tier === 'last3' ? 3 : 2, multiplier: r.multiplier, payout, balance: next })
  else body = ctx.t('togel.lose', { drawn, guess, bet, balance: next })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('togel.btnAgain'), id: `.togel ${guess} ${bet}` }], textFallback: body })
}
