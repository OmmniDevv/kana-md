
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "hint",
  alias: [],
  category: "game",
  description: { id: "Fitur hint versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD hint feature, rewritten in KANA style" },
  usage: ".hint",
  example: ".hint",
  cooldown: 5,
}

export const i18n = {
  id: {
    "hint": {
      usage: "╭─❏ 🎲 「 *HINT* 」\n┊ Tulis jumlah betnya yaa, contoh: *.hint 100*\n┊ Bet 10 sampai 10000 koin~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *HINT* 」\n┊ Betnya harus angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, bet *{bet} koin*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ Menang! Untung *{bet} koin*~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ Kalah nih, *{bet} koin* melayang~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ Seri! Bet kamu balik utuh~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      btnAgain: "Main Lagi",
    },
  },
  en: {
    "hint": {
      usage: "╭─❏ 🎲 「 *HINT* 」\n┊ Write your bet amount, example: *.hint 100*\n┊ Bet 10 to 10000 coins~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *HINT* 」\n┊ The bet must be a whole number from 10 to 10000~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, bet *{bet} coins*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ You win! Profit *{bet} coins*~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ You lose, *{bet} coins* gone~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *HINT* 」\n┊ {detail}\n┊ Draw! Your bet returns in full~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      btnAgain: "Play Again",
    },
  },
}

export function resolveGame(player, bot, bet) {
  if (player > bot) return { outcome: 'win', delta: bet }
  if (player < bot) return { outcome: 'lose', delta: -bet }
  return { outcome: 'draw', delta: 0 }
}
export const test = { input: '.hint', expect: /bet/i }
export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('hint.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('hint.bad'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  if (balance < bet) return ctx.reply(ctx.t('hint.poor', { balance, bet }))
  const player = 1 + Math.floor(Math.random() * 100)
  const bot = 1 + Math.floor(Math.random() * 100)
  const r = resolveGame(player, bot, bet)
  const next = balance + r.delta
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: next })
  const detail = '🎯 Kamu: *' + player + '* vs KANA: *' + bot + '*'
  const body = ctx.t('hint.' + r.outcome, { detail, bet, balance: next })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('hint.btnAgain'), id: '.hint ' + bet }], textFallback: body })
}
