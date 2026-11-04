import { sendButtons } from '../../src/ui/buttons.js'
import { addXp } from '../../src/services/user-service.js'

export const config = {
  name: 'suit',
  alias: ['rps'],
  category: 'fun',
  description: { id: 'Main suit batu gunting kertas lawan KANA', en: 'Play rock paper scissors against KANA' },
  usage: '╭─❏ ✊ 「 *SUIT* 」\n┊ .suit <batu|gunting|kertas>\n╰━━━━━━━',
  example: '.suit batu',
  cooldown: 3,
}

export const i18n = {
  id: {
    suit: {
      usage: '╭─❏ ✊ 「 *SUIT* 」\n┊ Pilih dulu yaa: .suit batu, .suit gunting, atau .suit kertas~ (≧▽≦)\n╰━━━━━━━',
      you: 'Kamu',
      bot: 'KANA',
      choices: { batu: 'Batu 🪨', gunting: 'Gunting ✂️', kertas: 'Kertas 📄' },
      win: '┊ 🏆 Yayyy kamu menang! {player} ngalahin {bot} nih. +15 XP buat kamu~ (≧▽≦) 🎉\n╰━━━━━━━ {mood}',
      lose: '┊ 😿 Ehehe, KANA yang menang kali ini! {bot} ngalahin {player}. Coba lagi yaa~ (•̀ᴗ•́)و\n╰━━━━━━━',
      draw: '┊ 🤝 Serii~ kita sehati ya, sama-sama {player}. +3 XP deh buat kamu~ 🌸\n╰━━━━━━━',
      btnAgain: 'Main Lagi',
      result: '╭─❏ ✊ 「 *HASIL SUIT* 」\n┊ {you}: *{player}*\n┊ {bot}: *{botChoice}*',
    },
  },
  en: {
    suit: {
      usage: '╭─❏ ✊ 「 *ROCK PAPER SCISSORS* 」\n┊ Pick first: .suit batu, .suit gunting, or .suit kertas~ (≧▽≦)\n╰━━━━━━━',
      you: 'You',
      bot: 'KANA',
      choices: { batu: 'Rock 🪨', gunting: 'Scissors ✂️', kertas: 'Paper 📄' },
      win: '┊ 🏆 Yayyy you win! {player} beats {bot}. +15 XP for you~ (≧▽≦) 🎉\n╰━━━━━━━ {mood}',
      lose: '┊ 😿 Ehehe, KANA wins this round! {bot} beats {player}. Try again~ (•̀ᴗ•́)و\n╰━━━━━━━',
      draw: '┊ 🤝 A draw~ we are in sync, both picked {player}. +3 XP for you~ 🌸\n╰━━━━━━━',
      btnAgain: 'Play Again',
      result: '╭─❏ ✊ 「 *SUIT RESULT* 」\n┊ {you}: *{player}*\n┊ {bot}: *{botChoice}*',
    },
  },
}

const CHOICES = ['batu', 'gunting', 'kertas']
const BEATS = { batu: 'gunting', gunting: 'kertas', kertas: 'batu' }

// Hasil suit dari sisi pemain: 'win' | 'lose' | 'draw'. Fungsi murni.
export function decideSuit(player, bot) {
  if (!CHOICES.includes(player) || !CHOICES.includes(bot)) return null
  if (player === bot) return 'draw'
  return BEATS[player] === bot ? 'win' : 'lose'
}

export const test = { input: '.suit batu', expect: /batu|gunting|kertas/i }

export async function handler(ctx) {
  const choice = (ctx.args[0] || '').toLowerCase()
  const buttons = CHOICES.map((c) => ({ text: ctx.t(`suit.choices.${c}`), id: `.suit ${c}` }))
  if (!CHOICES.includes(choice)) {
    const body = ctx.t('suit.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: buttons,
      textFallback: body,
    })
  }
  const bot = CHOICES[Math.floor(Math.random() * CHOICES.length)]
  const outcome = decideSuit(choice, bot)
  if (outcome === 'win') await addXp(ctx.storage, ctx.senderDigits, 15).catch(() => {})
  if (outcome === 'draw') await addXp(ctx.storage, ctx.senderDigits, 3).catch(() => {})
  const label = (c) => ctx.t(`suit.choices.${c}`)
  const head = ctx.t('suit.result', { you: ctx.t('suit.you'), bot: ctx.t('suit.bot'), player: label(choice), botChoice: label(bot) })
  const tail =
    outcome === 'win'
      ? ctx.t('suit.win', { player: label(choice), bot: label(bot), mood: ctx.say('senang') })
      : outcome === 'lose'
        ? ctx.t('suit.lose', { player: label(choice), bot: label(bot) })
        : ctx.t('suit.draw', { player: label(choice) })
  const body = `${head}\n\n${tail}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: buttons,
    textFallback: body,
  })
}
