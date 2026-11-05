// DINONAKTIFKAN 2026-11-06 (perbaikan klaster RPG gelombang 2): clanWar engine tidak punya konsep jeda/pausa perang (perang harian sekali jalan, jeda diatur cooldown harian lastWar), jadi cabang pause tidak punya fondasi nyata. Dinonaktifkan jujur daripada memakai mesin duel angka generik lama.


import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "guildwarpause",
  alias: [],
  category: "rpg",
  description: { id: "Fitur guildwarpause versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD guildwarpause feature, rewritten in KANA style" },
  usage: ".guildwarpause",
  example: ".guildwarpause",
  cooldown: 5,
}

export const i18n = {
  id: {
    "guildwarpause": {
      usage: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ Tulis jumlah betnya yaa, contoh: *.guildwarpause 100*\n┊ Bet 10 sampai 10000 koin~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ Betnya harus angka bulat 10 sampai 10000 yaa~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, bet *{bet} koin*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ Menang! Untung *{bet} koin*~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ Kalah nih, *{bet} koin* melayang~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ Seri! Bet kamu balik utuh~\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      btnAgain: "Main Lagi",
    },
  },
  en: {
    "guildwarpause": {
      usage: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ Write your bet amount, example: *.guildwarpause 100*\n┊ Bet 10 to 10000 coins~\n╰━━━━━━━",
      bad: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ The bet must be a whole number from 10 to 10000~\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, bet *{bet} coins*~\n╰━━━━━━━",
      win: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ You win! Profit *{bet} coins*~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      lose: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ You lose, *{bet} coins* gone~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      draw: "╭─❏ 🎲 「 *GUILDWARPAUSE* 」\n┊ {detail}\n┊ Draw! Your bet returns in full~\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      btnAgain: "Play Again",
    },
  },
}

export function resolveGame(player, bot, bet) {
  if (player > bot) return { outcome: 'win', delta: bet }
  if (player < bot) return { outcome: 'lose', delta: -bet }
  return { outcome: 'draw', delta: 0 }
}
export const test = { input: '.guildwarpause', expect: /bet/i }
export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('guildwarpause.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('guildwarpause.bad'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  if (balance < bet) return ctx.reply(ctx.t('guildwarpause.poor', { balance, bet }))
  const player = 1 + Math.floor(Math.random() * 100)
  const bot = 1 + Math.floor(Math.random() * 100)
  const r = resolveGame(player, bot, bet)
  const next = balance + r.delta
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: next })
  const detail = '🎯 Kamu: *' + player + '* vs KANA: *' + bot + '*'
  const body = ctx.t('guildwarpause.' + r.outcome, { detail, bet, balance: next })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('guildwarpause.btnAgain'), id: '.guildwarpause ' + bet }], textFallback: body })
}
