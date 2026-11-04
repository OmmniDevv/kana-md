import { listGames } from '../../src/services/game-catalog.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'games',
  alias: ['listgame', 'daftargame'],
  category: 'game',
  description: { id: 'Lihat daftar game HTML yang bisa dimainkan', en: 'See the list of playable HTML games' },
  usage: '.games',
  example: '.games',
  cooldown: 3,
}

export const i18n = {
  id: {
    games: {
      title: 'Game KANA',
      intro: 'Nih game yang bisa kamu mainkan langsung di chat~ Pencet tombolnya atau ketik perintahnya yaa!',
      line: '🎮 {title} : .game {id}',
      empty: 'Mouu, belum ada game yang terpasang nih... nanti KANA tambahin ya~ {mood}',
      footer: 'KANA, bot WhatsApp moe',
      topButton: '🏆 Leaderboard',
    },
  },
  en: {
    games: {
      title: 'KANA Games',
      intro: 'Here are the games you can play right in chat~ Tap a button or type the command!',
      line: '🎮 {title} : .game {id}',
      empty: 'Mouu, no games are installed yet... KANA will add some later~ {mood}',
      footer: 'KANA, moe WhatsApp bot',
      topButton: '🏆 Leaderboard',
    },
  },
}

export async function handler(ctx) {
  const games = await listGames()
  if (!games.length) {
    return ctx.reply(ctx.t('games.empty', { mood: ctx.say('gagal') }))
  }
  const body = [ctx.t('games.intro'), '', ...games.map((g) => ctx.t('games.line', { title: g.title, id: g.id }))].join('\n')
  const replies = [
    ...games.slice(0, 9).map((g) => ({ text: g.title.slice(0, 25), id: `.game ${g.id}` })),
    { text: ctx.t('games.topButton'), id: '.topgame' },
  ]
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('games.title'),
    body,
    footer: ctx.t('games.footer'),
    replies,
    textFallback: body,
  })
}
