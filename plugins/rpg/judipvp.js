// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin bet
// angka acak melawan bot. Sekarang taruhan PvP nyata antara dua pemain:
// lawan harus punya saldo cukup buat menandingi bet, pemenang ditentukan
// power tempur kedua profil (bukan angka acak polos), dan bet lawan
// berpindah beneran ke pemenang.
import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'

export const config = {
  name: 'judipvp',
  alias: [],
  category: 'rpg',
  description: { id: 'Taruhan PvP nyata lawan pemain lain: power tempur menentukan, bet lawan berpindah ke pemenang', en: 'Real PvP bet against another player: battle power decides, the loser bet moves to the winner' },
  usage: '.judipvp <nomor lawan> <bet>',
  example: '.judipvp 6281234567890 200',
  cooldown: 10,
}

export const i18n = {
  id: {
    judipvp: {
      usage: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Tulis nomor lawan dan betnya: .judipvp 6281234567890 200. Bet 10 sampai 10000 koin~\n╰━━━━━━━',
      bad: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Betnya harus angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━',
      self: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Tidak bisa taruhan lawan diri sendiri~\n╰━━━━━━━',
      poorMe: '╭─❏ 💸 「 *JUDIPVP* 」\n┊ Saldo kamu *{balance} koin*, bet *{bet} koin* kurang~\n╰━━━━━━━',
      poorOpp: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Saldo lawan cuma *{balance} koin*, tidak cukup menandingi bet *{bet} koin*~\n╰━━━━━━━',
      win: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Power kamu *{mine}* vs lawan *{theirs}*: MENANG!\n┊ Kamu merebut bet lawan *+{bet} koin* | Saldo: *{balance} koin*\n╰━━━━━━━',
      lose: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Power kamu *{mine}* vs lawan *{theirs}*: kalah, bet *{bet} koin* pindah ke lawan\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
    },
  },
  en: {
    judipvp: {
      usage: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Write the opponent number and bet: .judipvp 6281234567890 200. Bet 10 to 10000 coins~\n╰━━━━━━━',
      bad: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ The bet must be a whole number from 10 to 10000~\n╰━━━━━━━',
      self: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ You cannot bet against yourself~\n╰━━━━━━━',
      poorMe: '╭─❏ 💸 「 *JUDIPVP* 」\n┊ Your balance is *{balance} coins*, short of the *{bet} coins* bet~\n╰━━━━━━━',
      poorOpp: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ The opponent only has *{balance} coins*, not enough to match the *{bet} coins* bet~\n╰━━━━━━━',
      win: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Your power *{mine}* vs opponent *{theirs}*: YOU WIN!\n┊ You take the opponent bet *+{bet} coins* | Balance: *{balance} coins*\n╰━━━━━━━',
      lose: '╭─❏ 🎲 「 *JUDIPVP* 」\n┊ Your power *{mine}* vs opponent *{theirs}*: you lose, the *{bet} coins* bet moves to the opponent\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.judipvp 6285187605007 100', expect: /power kamu|your power|saldo|balance|tulis nomor|write the opponent/i }

export async function handler(ctx) {
  const args = ctx.args ?? []
  let target = ''
  let betRaw = null
  if (ctx.mentionedJids?.length) {
    target = String(ctx.mentionedJids[0]).split('@')[0].replace(/\D/g, '')
    betRaw = args.find((a) => /^\d+$/.test(String(a)))
  }
  if (!target) {
    target = String(args[0] ?? '').replace(/\D/g, '')
    betRaw = args[1]
  }
  const bet = Number(betRaw)
  if (!target || betRaw === undefined || betRaw === null) return ctx.reply(ctx.t('judipvp.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('judipvp.bad'))
  if (target === ctx.senderDigits) return ctx.reply(ctx.t('judipvp.self'))
  const me = await getProfile(ctx.storage, ctx.senderDigits)
  if ((me.balance ?? 0) < bet) return ctx.reply(ctx.t('judipvp.poorMe', { balance: me.balance ?? 0, bet }))
  const opp = await getProfile(ctx.storage, target)
  if ((opp.balance ?? 0) < bet) return ctx.reply(ctx.t('judipvp.poorOpp', { balance: opp.balance ?? 0, bet }))
  const mine = powerOf(me) + Math.floor(Math.random() * 21)
  const theirs = powerOf(opp) + Math.floor(Math.random() * 21)
  const win = mine >= theirs
  const winner = win ? ctx.senderDigits : target
  const loser = win ? target : ctx.senderDigits
  const loserProfile = win ? opp : me
  const winnerProfile = win ? me : opp
  await updateProfile(ctx.storage, loser, { balance: (loserProfile.balance ?? 0) - bet })
  await updateProfile(ctx.storage, winner, { balance: (winnerProfile.balance ?? 0) + bet })
  await addXp(ctx.storage, winner, 10)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t(win ? 'judipvp.win' : 'judipvp.lose', { mine, theirs, bet, balance: fresh.balance ?? 0 }))
}
