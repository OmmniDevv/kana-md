import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'daduvs',
  alias: [],
  category: 'game',
  description: { id: 'Adu dadu lawan KANA pakai saldo koin kamu', en: 'Dice duel against KANA with your coin balance' },
  usage: '.daduvs <bet>',
  example: '.daduvs 100',
  cooldown: 3,
}

// Hasil adu dadu murni: menang delta +bet, seri 0 (bet kembali), kalah -bet.
export function resolveDice(player, bot, bet) {
  if (player > bot) return { outcome: 'win', delta: bet }
  if (player < bot) return { outcome: 'lose', delta: -bet }
  return { outcome: 'draw', delta: 0 }
}

export const i18n = {
  id: {
    daduvs: {
      usage: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Tulis jumlah betnya yaa, contoh: .daduvs 100. Bet minimal 10 dan maksimal 10000 koin~ 🎲\n╰━━━━━━━',
      badBet: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Betnya harus angka bulat antara 10 dan 10000 yaa~\n╰━━━━━━━',
      noBalance: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Mouu, saldo kamu kurang buat bet {bet} koin. Saldo kamu sekarang {balance} koin (╥﹏╥)\n╰━━━━━━━',
      roll: '🎲 Kamu: {player} vs KANA: {bot}',
      win: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Menang! Dadumu lebih besar, untung {bet} koin~ (≧▽≦) 🎉\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Kalah nih, dadu KANA lebih besar. {bet} koin melayang... (╥﹏╥)\n╰━━━━━━━',
      draw: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Seri! Dadu kita sama, bet kamu balik utuh~ 🌸\n╰━━━━━━━',
      balance: '╭─❏ ✨ 「 *DADUVS* 」\n┊ ꜱᴀʟᴅᴏ ᴋᴀᴍᴜ ꜱᴇᴋᴀʀᴀɴɢ: {balance} koin. {mood}\n╰━━━━━━━',
      btnAgain: 'Lempar Lagi',
      btnProfile: 'Profil',
      btnGames: 'Daftar Game',
    },
  },
  en: {
    daduvs: {
      usage: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Write your bet amount, example: .daduvs 100. Minimum bet 10 and maximum 10000 coins~ 🎲\n╰━━━━━━━',
      badBet: '╭─❏ ✨ 「 *DADUVS* 」\n┊ The bet must be a whole number between 10 and 10000~\n╰━━━━━━━',
      noBalance: '╭─❏ ✨ 「 *DADUVS* 」\n┊ Mouu, your balance is not enough for a {bet} coin bet. Your balance is {balance} coins (╥﹏╥)\n╰━━━━━━━',
      roll: '🎲 You: {player} vs KANA: {bot}',
      win: '╭─❏ ✨ 「 *DADUVS* 」\n┊ You win! Your dice is bigger, profit {bet} coins~ (≧▽≦) 🎉\n╰━━━━━━━',
      lose: '╭─❏ ✨ 「 *DADUVS* 」\n┊ You lose, KANA dice is bigger. {bet} coins gone... (╥﹏╥)\n╰━━━━━━━',
      draw: '╭─❏ ✨ 「 *DADUVS* 」\n┊ A draw! Our dice match, your bet returns in full~ 🌸\n╰━━━━━━━',
      balance: '╭─❏ ʏᴏᴜʀ 「 *DADUVS* 」\n┊ ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ ɴᴏᴡ: {balance} coins. {mood}\n╰━━━━━━━',
      btnAgain: 'Roll Again',
      btnProfile: 'Profile',
      btnGames: 'Game List',
    },
  },
}

export const test = { input: '.daduvs', expect: /bet/i }

export async function handler(ctx) {
  const bet = Number(ctx.args[0])
  if (!ctx.args[0]) return ctx.reply(ctx.t('daduvs.usage'))
  if (!Number.isInteger(bet) || bet < 10 || bet > 10000) return ctx.reply(ctx.t('daduvs.badBet'))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance || 0
  if (balance < bet) return ctx.reply(ctx.t('daduvs.noBalance', { bet, balance }))
  const player = 1 + Math.floor(Math.random() * 6)
  const bot = 1 + Math.floor(Math.random() * 6)
  const { outcome, delta } = resolveDice(player, bot, bet)
  const updated = await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance + delta })
  const head = ctx.t('daduvs.roll', { player, bot })
  const tail = ctx.t(`daduvs.${outcome}`, { bet })
  const body = `${head}\n${tail}\n${ctx.t('daduvs.balance', { balance: updated.balance, mood: ctx.say(outcome === 'lose' ? 'gagal' : 'senang') })}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('daduvs.btnAgain'), id: `.daduvs ${bet}` },
      { text: ctx.t('daduvs.btnProfile'), id: '.profil' },
      { text: ctx.t('daduvs.btnGames'), id: '.games' },
    ],
    textFallback: body,
  })
}
