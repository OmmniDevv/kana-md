import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ulartangga',
  alias: ['snakes'],
  category: 'fun',
  description: { id: 'Ular tangga lawan bot: balas papan untuk mengocok dadu, siapa duluan sampai 100', en: 'Snakes and ladders vs the bot: reply to the board to roll the dice, first to 100 wins' },
  usage: '.ulartangga lalu balas papan permainan untuk mengocok dadu',
  example: '.ulartangga',
  cooldown: 3,
}

export const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }
export const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }

export const i18n = {
  id: {
    ulartangga: {
      title: 'Ular Tangga',
      board: '╭─❏ 🎲 「 *ULAR TANGGA LAWAN KANA* 」\n┊ {note}Posisi kamu: *{player}/100* {pbar}\n┊ ᴘᴏꜱɪꜱɪ ᴋᴀɴᴀ: *{bot}/100* {bbar}\n┊ Balas (reply) papan ini buat mengocok dadu yaa~\n╰━━━━━━━',
      startFail: '╭─❏ 🎲 「 *ULAR TANGGA* 」\n┊ Ada permainan lain yang lagi jalan di chat ini. Selesaikan dulu yaa~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🎲 「 *ULAR TANGGA* 」\n┊ Belum ada ular tangga yang jalan. Mulai dengan .ulartangga yaa~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🎲 「 *ULAR TANGGA* 」\n┊ Permainan dihentikan. Posisi terakhir kamu {player}, KANA {bot}.\n╰━━━━━━━',
      rollNote: 'Kamu kocok 🎲 {pd}: maju ke {playerPos}. KANA kocok 🎲 {bd}: maju ke {botPos}.\n',
      snakeNote: 'Aduh, kena ular! Turun ke {pos}.\n',
      ladderNote: 'Naik tangga! Langsung ke {pos}.\n',
      botSnakeNote: 'KANA kena ular, turun ke {pos}.\n',
      botLadderNote: 'KANA naik tangga ke {pos}.\n',
      win: '╭─❏ 🏆 「 *ULAR TANGGA* 」\n┊ 🏆 KAMU MENANG ular tangga! Posisi akhir {player} lawan {bot}. Kamu dapat 20 XP~\n╰━━━━━━━ {mood}',
      lose: '╭─❏ 😿 「 *ULAR TANGGA* 」\n┊ 😿 KANA yang sampai 100 duluan ({bot} lawan {player}). Coba lagi yaa~\n╰━━━━━━━ {mood}',
      stopBtn: '🏳️ Berhenti (.ulartangga stop)',
    },
  },
  en: {
    ulartangga: {
      title: 'Snakes and Ladders',
      board: '╭─❏ 🎲 「 *SNAKES AND LADDERS VS KANA* 」\n┊ {note}Your position: *{player}/100* {pbar}\n┊ ᴋᴀɴᴀ ᴘᴏꜱɪᴛɪᴏɴ: *{bot}/100* {bbar}\n┊ Reply to this board to roll the dice~\n╰━━━━━━━',
      startFail: '╭─❏ 🎲 「 *SNAKES AND LADDERS* 」\n┊ Another game is running in this chat. Finish it first~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🎲 「 *SNAKES AND LADDERS* 」\n┊ No snakes and ladders is running. Start with .ulartangga~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🎲 「 *SNAKES AND LADDERS* 」\n┊ Game stopped. Final positions you {player}, KANA {bot}.\n╰━━━━━━━',
      rollNote: 'You rolled 🎲 {pd}: moved to {playerPos}. KANA rolled 🎲 {bd}: moved to {botPos}.\n',
      snakeNote: 'Ouch, a snake! Down to {pos}.\n',
      ladderNote: 'Climbed a ladder! Straight to {pos}.\n',
      botSnakeNote: 'KANA hit a snake, down to {pos}.\n',
      botLadderNote: 'KANA climbed a ladder to {pos}.\n',
      win: '╭─❏ 🏆 「 *SNAKES AND LADDERS* 」\n┊ 🏆 YOU WIN snakes and ladders! Final position {player} vs {bot}. You earned 20 XP~\n╰━━━━━━━ {mood}',
      lose: '╭─❏ 😿 「 *SNAKES AND LADDERS* 」\n┊ 😿 KANA reached 100 first ({bot} vs {player}). Try again~\n╰━━━━━━━ {mood}',
      stopBtn: '🏳️ Stop (.ulartangga stop)',
    },
  },
}

export const test = { input: '.ulartangga', expect: /ular tangga|snakes/i }

const bar = (pos) => '▓'.repeat(Math.round(pos / 10)) + '░'.repeat(10 - Math.round(pos / 10))
const roll = () => 1 + Math.floor(Math.random() * 6)

function move(pos, dice) {
  let next = pos + dice
  if (next > 100) next = 100 - (next - 100)
  let event = null
  if (SNAKES[next]) { event = 'snake'; next = SNAKES[next] }
  else if (LADDERS[next]) { event = 'ladder'; next = LADDERS[next] }
  return { pos: next, event }
}

async function sendBoard(ctx, data, note = '') {
  const body = ctx.t('ulartangga.board', {
    note,
    player: data.player,
    bot: data.bot,
    pbar: bar(data.player),
    bbar: bar(data.bot),
  })
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('ulartangga.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('ulartangga.stopBtn'), id: '.ulartangga stop' }],
    textFallback: body,
  })
  return sent?.key?.id
}

registerReplyKind('ulartangga', async (ctx, binding) => {
  const data = binding.data
  const pd = roll()
  const pm = move(data.player, pd)
  data.player = pm.pos
  let note = ''
  if (pm.event === 'snake') note += ctx.t('ulartangga.snakeNote', { pos: pm.pos })
  if (pm.event === 'ladder') note += ctx.t('ulartangga.ladderNote', { pos: pm.pos })
  if (data.player >= 100) {
    await clearReply(ctx.storage, ctx.chat)
    await addXp(ctx.storage, ctx.senderDigits, 20)
    await ctx.reply(ctx.t('ulartangga.win', { player: data.player, bot: data.bot, mood: ctx.say('senang') }))
    return true
  }
  const bd = roll()
  const bm = move(data.bot, bd)
  data.bot = bm.pos
  if (bm.event === 'snake') note += ctx.t('ulartangga.botSnakeNote', { pos: bm.pos })
  if (bm.event === 'ladder') note += ctx.t('ulartangga.botLadderNote', { pos: bm.pos })
  note = ctx.t('ulartangga.rollNote', { pd, playerPos: data.player, bd, botPos: data.bot }) + note
  if (data.bot >= 100) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('ulartangga.lose', { player: data.player, bot: data.bot, mood: ctx.say('gagal') }))
    return true
  }
  const id = await sendBoard(ctx, data, note)
  await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 900000 })
  return true
})

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const existing = await getReplyBinding(ctx.storage, ctx.chat)
  if (arg === 'stop') {
    if (existing?.kind === 'ulartangga') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('ulartangga.stopped', { player: existing.data.player, bot: existing.data.bot }))
    }
    return ctx.reply(ctx.t('ulartangga.noGame', { mood: ctx.say('malu') }))
  }
  if (existing?.kind === 'ulartangga' && existing.ownerDigits === ctx.senderDigits) {
    const id = await sendBoard(ctx, existing.data)
    if (id) await saveReplyData(ctx.storage, ctx.chat, { ...existing, messageId: id, expiresAt: Date.now() + 900000 })
    return
  }
  if (existing) return ctx.reply(ctx.t('ulartangga.startFail', { mood: ctx.say('malu') }))
  const data = { player: 0, bot: 0 }
  const id = await sendBoard(ctx, data)
  await bindReply(ctx.storage, ctx.chat, { kind: 'ulartangga', messageId: id, ownerDigits: ctx.senderDigits, ttlMs: 900000, data })
}
