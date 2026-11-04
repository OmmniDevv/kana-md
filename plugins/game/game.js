import { randomUUID } from 'node:crypto'
import { listGames } from '../../src/services/game-catalog.js'
import { createGameToken, getGameSecret } from '../../src/services/game-token.js'
import { ensureScoreServer } from '../../src/services/score-server.js'
import { sendGameWithVars } from '../../src/ui/htmlgame.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'game',
  alias: [],
  category: 'game',
  description: { id: 'Mainkan satu game HTML, contoh .game hello', en: 'Play one HTML game, for example .game hello' },
  usage: '.game <id>',
  example: '.game hello',
  cooldown: 10,
}

export const i18n = {
  id: {
    game: {
      title: 'Game KANA',
      label: '{title} dari KANA. Mainkan langsung di bubble chat ya~ Skor terbaikmu bisa tercatat di leaderboard lewat .topgame. Catatan: game cuma tampil penuh di WhatsApp Android, di luar itu tampil sebagai label teks saja.',
      howto: 'Cara main {title}: buka bubble gamenya di chat, mainkan langsung di sana, dan skor terbaikmu tercatat otomatis bila server skor aktif. Pencet tombol di bawah buat main lagi atau lihat leaderboard yaa~',
      againButton: '🔁 Main Lagi',
      boardButton: '🏆 Leaderboard',
      listButton: '🎮 Daftar Game',
      missing: 'Mau main yang mana nih? Ketik .game <id> yaa. Game yang ada: {list}. Atau pencet .games buat daftar lengkapnya~',
      unknown: 'Ehh, game "{id}" nggak ada nih. Game yang ada: {list}. Pencet .games buat lihat semuanya yaa~',
      failed: 'Mouu, file game "{id}" lagi nggak bisa dibuka nih... coba lagi sebentar lagi ya~ {mood}',
      footer: 'KANA, bot WhatsApp moe',
    },
  },
  en: {
    game: {
      title: 'KANA Game',
      label: '{title} from KANA. Play it right inside the chat bubble~ Your best score can land on the leaderboard via .topgame. Note: games only render fully on WhatsApp Android, elsewhere they show as a text label.',
      howto: 'How to play {title}: open the game bubble in chat, play right there, and your best score is recorded automatically when the score server is active. Use the buttons below to play again or see the leaderboard~',
      againButton: '🔁 Play Again',
      boardButton: '🏆 Leaderboard',
      listButton: '🎮 Game List',
      missing: 'Which one do you want to play? Type .game <id>. Available games: {list}. Or tap .games for the full list~',
      unknown: 'Eh, game "{id}" does not exist. Available games: {list}. Tap .games to see them all~',
      failed: 'Mouu, the game file "{id}" could not be opened right now... please try again in a bit~ {mood}',
      footer: 'KANA, moe WhatsApp bot',
    },
  },
}

export async function handler(ctx) {
  const id = (ctx.args?.[0] || '').toLowerCase()
  const games = await listGames()
  const list = games.map((g) => g.id).join(', ') || '-'
  if (!id) return ctx.reply(ctx.t('game.missing', { list }))
  const meta = games.find((g) => g.id === id) ?? null
  if (!meta) return ctx.reply(ctx.t('game.unknown', { id, list }))

  const uid = String(ctx.senderDigits || ctx.sender || '').replace(/\D/g, '')
  let ws = null
  if (process.env.SCORE_WS_PORT) {
    try {
      const state = await ensureScoreServer(ctx.storage)
      ws = state?.wsUrl ?? null
    } catch {
      ws = null
    }
  }
  const token = createGameToken({
    secret: getGameSecret(),
    uid,
    game: meta.id,
    chat: ctx.chat,
  })
  const vars = {
    sid: randomUUID(),
    lang: ctx.lang,
    name: ctx.pushName || '',
    token,
    ws,
  }
  try {
    await sendGameWithVars(ctx.sock, ctx.chat, meta.htmlPath, {
      title: meta.title,
      label: ctx.t('game.label', { title: meta.title }),
      height: meta.height,
      vars,
    })
  } catch {
    return ctx.reply(ctx.t('game.failed', { id: meta.id, mood: ctx.say('gagal') }))
  }
  const howto = ctx.t('game.howto', { title: meta.title })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('game.title'),
    body: howto,
    footer: ctx.t('game.footer'),
    replies: [
      { text: ctx.t('game.againButton'), id: `.game ${meta.id}` },
      { text: ctx.t('game.boardButton'), id: `.topgame ${meta.id}` },
      { text: ctx.t('game.listButton'), id: '.games' },
    ],
    textFallback: howto,
  })
}
