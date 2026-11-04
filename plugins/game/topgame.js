import { listGames } from '../../src/services/game-catalog.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'topgame',
  alias: ['topskor'],
  category: 'game',
  description: { id: 'Lihat leaderboard skor game', en: 'See the game score leaderboard' },
  usage: '.topgame [id]',
  example: '.topgame hello',
  cooldown: 3,
}

export const i18n = {
  id: {
    topgame: {
      title: 'Leaderboard KANA',
      summaryTitle: '🏆 Juara tiap game sejauh ini:',
      summaryLine: '🏆 {game} : {name} ({score})',
      boardTitle: '🏆 Top skor {game}:',
      boardLine: '{rank}. {name} : {score}',
      empty: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ Belum ada skor tercatat nih~ Main dulu lewat .games, jadilah yang pertama cetak skor yaa! {mood}\n╰━━━━━━━',
      emptyGame: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ Belum ada skor buat game ini nih~ Main lewat .game {id} dan jadilah yang pertama yaa! {mood}\n╰━━━━━━━',
      unknown: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ Ehh, game "{id}" nggak ada nih. Game yang ada: {list}~\n╰━━━━━━━',
      footer: 'KANA, bot WhatsApp moe',
      gamesButton: '🎮 Daftar Game',
    },
  },
  en: {
    topgame: {
      title: 'KANA Leaderboard',
      summaryTitle: '🏆 Champions of each game so far:',
      summaryLine: '🏆 {game} : {name} ({score})',
      boardTitle: '🏆 Top scores for {game}:',
      boardLine: '{rank}. {name} : {score}',
      empty: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ No scores recorded yet~ Play via .games and be the first to set one! {mood}\n╰━━━━━━━',
      emptyGame: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ No scores for this game yet~ Play via .game {id} and be the first one! {mood}\n╰━━━━━━━',
      unknown: '╭─❏ ✨ 「 *TOPGAME* 」\n┊ Eh, game "{id}" does not exist. Available games: {list}~\n╰━━━━━━━',
      footer: 'KANA, moe WhatsApp bot',
      gamesButton: '🎮 Game List',
    },
  },
}

function sortedEntries(board) {
  return Object.entries(board ?? {})
    .map(([digit, entry]) => ({ digit, name: entry?.name || digit, score: Number(entry?.score) || 0 }))
    .sort((a, b) => b.score - a.score)
}

export const test = { input: '.topgame', expect: /skor|score/i }

export async function handler(ctx) {
  const games = await listGames()
  const replies = [
    ...games.slice(0, 5).map((g) => ({ text: `🏆 ${g.title}`.slice(0, 25), id: `.topgame ${g.id}` })),
    { text: ctx.t('topgame.gamesButton'), id: '.games' },
  ]
  const sendBoard = (rawBody) => {
    const body = rawBody.startsWith('╭')
      ? rawBody
      : `╭─❏ 🏆 「 *${ctx.t('topgame.title').toUpperCase()}* 」\n${rawBody.split('\n').map((ln) => (ln.trim() ? `┊ ${ln}` : ln)).join('\n')}\n╰━━━━━━━`
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('topgame.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }

  const id = (ctx.args?.[0] || '').toLowerCase()
  if (id) {
    const meta = games.find((g) => g.id === id)
    if (!meta) {
      return ctx.reply(ctx.t('topgame.unknown', { id, list: games.map((g) => g.id).join(', ') || '-' }))
    }
    const board = await ctx.storage.get('scores', meta.id)
    const top = sortedEntries(board).slice(0, 10)
    if (!top.length) return sendBoard(ctx.t('topgame.emptyGame', { id: meta.id, mood: ctx.say('gagal') }))
    const body = [
      ctx.t('topgame.boardTitle', { game: meta.title }),
      ...top.map((e, i) => ctx.t('topgame.boardLine', { rank: i + 1, name: e.name, score: e.score })),
    ].join('\n')
    return sendBoard(body)
  }

  const lines = []
  for (const g of games) {
    const board = await ctx.storage.get('scores', g.id)
    const top = sortedEntries(board)
    if (top.length) lines.push(ctx.t('topgame.summaryLine', { game: g.title, name: top[0].name, score: top[0].score }))
  }
  if (!lines.length) return sendBoard(ctx.t('topgame.empty', { mood: ctx.say('senang') }))
  return sendBoard([ctx.t('topgame.summaryTitle'), ...lines].join('\n'))
}
