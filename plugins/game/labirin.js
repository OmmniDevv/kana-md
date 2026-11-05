import { randomUUID } from 'node:crypto'
import { getGame } from '../../src/services/game-catalog.js'
import { createGameToken, getGameSecret } from '../../src/services/game-token.js'
import { ensureScoreServer } from '../../src/services/score-server.js'
import { sendGameWithVars } from '../../src/ui/htmlgame.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "labirin",
  alias: ["maze"],
  category: "game",
  description: { id: "Game labirin acak inline HTML, temukan jalan ke garis finish", en: "Random maze game as inline HTML, find your way to the finish" },
  usage: ".labirin",
  example: ".labirin",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "labirin": {
      title: "Game Labirin",
      label: "{title} dari KANA. Mainkan langsung di bubble chat ya~ Catatan: game cuma tampil penuh di WhatsApp Android.",
      howto: "╭─❏ 🎮 「 *LABIRIN* 」\n┊ Cara main {title}: buka bubble gamenya di chat dan mainkan langsung di sana yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAME GAGAL DIBUKA* 」\n┊ Mouu, gamenya lagi nggak bisa dibuka: *{message}*\n╰━━━━━━━",
      btnAgain: "Main Lagi",
      btnBoard: "Leaderboard",
    },
  },
  en: {
    "labirin": {
      title: "Labirin Game",
      label: "{title} from KANA. Play it right inside the chat bubble~ Note: games only render fully on WhatsApp Android.",
      howto: "╭─❏ 🎮 「 *LABIRIN* 」\n┊ How to play {title}: open the game bubble in chat and play right there~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAME FAILED TO OPEN* 」\n┊ Mouu, the game could not be opened: *{message}*\n╰━━━━━━━",
      btnAgain: "Play Again",
      btnBoard: "Leaderboard",
    },
  },
}

const GAME_ID = "labirin"
export const test = { input: '.labirin', expect: /game|main/i }
export async function handler(ctx) {
  const meta = await getGame(GAME_ID)
  if (!meta) return ctx.reply(ctx.t('labirin.fail', { message: 'not found' }))
  const uid = String(ctx.senderDigits || ctx.sender || '').replace(/\D/g, '')
  let ws = null
  if (process.env.SCORE_WS_PORT) {
    try { const state = await ensureScoreServer(ctx.storage); ws = state?.wsUrl ?? null } catch { ws = null }
  }
  const token = createGameToken({ secret: getGameSecret(), uid, game: meta.id, chat: ctx.chat })
  const vars = { sid: randomUUID(), lang: ctx.lang, name: ctx.pushName || '', token, ws }
  try {
    await sendGameWithVars(ctx.sock, ctx.chat, meta.htmlPath, { title: meta.title, label: ctx.t('labirin.label', { title: meta.title }), height: meta.height, vars })
  } catch (err) {
    return ctx.reply(ctx.t('labirin.fail', { message: err.message }))
  }
  const body = ctx.t('labirin.howto', { title: meta.title })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('labirin.title'), body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('labirin.btnAgain'), id: '.labirin' }, { text: ctx.t('labirin.btnBoard'), id: '.topgame ' + meta.id }], textFallback: body })
}
