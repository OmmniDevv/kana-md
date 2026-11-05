
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "calo",
  alias: [],
  category: "game",
  description: { id: "Fitur calo versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD calo feature, rewritten in KANA style" },
  usage: ".calo",
  example: ".calo",
  cooldown: 5,
}

export const i18n = {
  id: {
    "calo": {
      usage: "╭─❏ 🎲 「 *CALO* 」\n┊ Tulis jumlah betnya yaa, contoh: *.calo 100*\n┊ Bet 10 sampai 10000 koin~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *CALO* 」\n┊ Betnya harus angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, bet *{bet} koin*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ Menang! Untung *{bet} koin*~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ Kalah nih, *{bet} koin* melayang~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ Seri! Bet kamu balik utuh~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      btnAgain: "Main Lagi",
    },
  },
  en: {
    "calo": {
      usage: "╭─❏ 🎲 「 *CALO* 」\n┊ Write your bet amount, example: *.calo 100*\n┊ Bet 10 to 10000 coins~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *CALO* 」\n┊ The bet must be a whole number from 10 to 10000~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, bet *{bet} coins*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ You win! Profit *{bet} coins*~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ You lose, *{bet} coins* gone~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *CALO* 」\n┊ {detail}\n┊ Draw! Your bet returns in full~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      btnAgain: "Play Again",
    },
  },
}

export function resolveGame(player, bot, bet) {
  if (player > bot) return { outcome: 'win', delta: bet }
  if (player < bot) return { outcome: 'lose', delta: -bet }
  return { outcome: 'draw', delta: 0 }
}
export const test = { input: '.calo', expect: /bet/i }
export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('calo.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('calo.bad'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  if (balance < bet) return ctx.reply(ctx.t('calo.poor', { balance, bet }))
  const player = 1 + Math.floor(Math.random() * 100)
  const bot = 1 + Math.floor(Math.random() * 100)
  const r = resolveGame(player, bot, bet)
  const next = balance + r.delta
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: next })
  const detail = '🎯 Kamu: *' + player + '* vs KANA: *' + bot + '*'
  const body = ctx.t('calo.' + r.outcome, { detail, bet, balance: next })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('calo.btnAgain'), id: '.calo ' + bet }], textFallback: body })
}
