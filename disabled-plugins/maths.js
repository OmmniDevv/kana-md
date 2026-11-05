// DINONAKTIFKAN 2026-11-05 (perbaikan klaster game gelombang 2): Duplikat: kanonisnya .math (alias maths dan matematika terdaftar di sana). Dinonaktifkan pada perbaikan klaster game gelombang 2, 2026-11-05.


import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "maths",
  alias: [],
  category: "game",
  description: { id: "Fitur maths versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD maths feature, rewritten in KANA style" },
  usage: ".maths",
  example: ".maths",
  cooldown: 5,
}

export const i18n = {
  id: {
    "maths": {
      usage: "╭─❏ 🎲 「 *MATHS* 」\n┊ Tulis jumlah betnya yaa, contoh: *.maths 100*\n┊ Bet 10 sampai 10000 koin~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *MATHS* 」\n┊ Betnya harus angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, bet *{bet} koin*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ Menang! Untung *{bet} koin*~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ Kalah nih, *{bet} koin* melayang~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ Seri! Bet kamu balik utuh~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      btnAgain: "Main Lagi",
    },
  },
  en: {
    "maths": {
      usage: "╭─❏ 🎲 「 *MATHS* 」\n┊ Write your bet amount, example: *.maths 100*\n┊ Bet 10 to 10000 coins~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *MATHS* 」\n┊ The bet must be a whole number from 10 to 10000~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, bet *{bet} coins*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ You win! Profit *{bet} coins*~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ You lose, *{bet} coins* gone~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *MATHS* 」\n┊ {detail}\n┊ Draw! Your bet returns in full~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      btnAgain: "Play Again",
    },
  },
}

export function resolveGame(player, bot, bet) {
  if (player > bot) return { outcome: 'win', delta: bet }
  if (player < bot) return { outcome: 'lose', delta: -bet }
  return { outcome: 'draw', delta: 0 }
}
export const test = { input: '.maths', expect: /bet/i }
export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('maths.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('maths.bad'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  if (balance < bet) return ctx.reply(ctx.t('maths.poor', { balance, bet }))
  const player = 1 + Math.floor(Math.random() * 100)
  const bot = 1 + Math.floor(Math.random() * 100)
  const r = resolveGame(player, bot, bet)
  const next = balance + r.delta
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: next })
  const detail = '🎯 Kamu: *' + player + '* vs KANA: *' + bot + '*'
  const body = ctx.t('maths.' + r.outcome, { detail, bet, balance: next })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('maths.btnAgain'), id: '.maths ' + bet }], textFallback: body })
}
