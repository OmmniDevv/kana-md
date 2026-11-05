import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'mathgame',
  alias: ['hitungcepat'],
  category: 'fun',
  description: { id: 'Game hitung cepat: jawab soal matematika beruntun lewat reply, jaga streak-mu', en: 'Quick math game: answer math questions in a row via reply, keep your streak' },
  usage: '.mathgame lalu balas papan permainan dengan jawaban angkanya',
  example: '.mathgame',
  cooldown: 3,
}

export const i18n = {
  id: {
    mathgame: {
      title: 'Hitung Cepat',
      board: '╭─❏ 🧮 「 *HITUNG CEPAT* 」\n┊ ꜱᴏᴀʟ: *{a} {op} {b} = ?*\n┊ ꜱᴛʀᴇᴀᴋ: *{streak}* | ᴘᴏɪɴ ᴛᴇʀᴋᴜᴍᴘᴜʟ: *{total}*\n┊\n┊ Balas (reply) papan ini dengan jawabannya yaa~\n╰━━━━━━━',
      startFail: '╭─❏ 🧮 「 *HITUNG CEPAT* 」\n┊ Ada permainan lain yang lagi jalan di chat ini.\n┊ Selesaikan dulu yaa~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🧮 「 *HITUNG CEPAT* 」\n┊ Belum ada hitung cepat yang jalan.\n┊ Mulai dengan *.mathgame* yaa~\n╰━━━━━━━ {mood}',
      correct: 'Betul! +{points} poin.',
      wrong: '╭─❏ 🧮 「 *JAWABAN SALAH* 」\n┊ Mouu, jawaban *{given}* salah.\n┊ ᴊᴀᴡᴀʙᴀɴ ʏᴀɴɢ ʙᴇɴᴀʀ: *{answer}*\n┊ Streak berhenti di *{streak}*, total poin *{total}* berubah jadi XP sekarang~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🧮 「 *PERMAINAN BERHENTI* 」\n┊ Streak *{streak}*, total poin *{total}* sudah diubah jadi XP yaa~\n╰━━━━━━━',
      notNumber: '╭─❏ 🧮 「 *HITUNG CEPAT* 」\n┊ Balas dengan angka yaa, bukan teks lain~\n╰━━━━━━━',
      stopBtn: '🏳️ Berhenti (.mathgame stop)',
    },
  },
  en: {
    mathgame: {
      title: 'Quick Math',
      board: '╭─❏ 🧮 「 *QUICK MATH* 」\n┊ ǫᴜᴇꜱᴛɪᴏɴ: *{a} {op} {b} = ?*\n┊ ꜱᴛʀᴇᴀᴋ: *{streak}* | ᴘᴏɪɴᴛꜱ ᴄᴏʟʟᴇᴄᴛᴇᴅ: *{total}*\n┊\n┊ Reply to this board with the answer~\n╰━━━━━━━',
      startFail: '╭─❏ 🧮 「 *QUICK MATH* 」\n┊ Another game is running in this chat.\n┊ Finish it first~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🧮 「 *QUICK MATH* 」\n┊ No quick math is running.\n┊ Start with *.mathgame*~\n╰━━━━━━━ {mood}',
      correct: 'Correct! +{points} points.',
      wrong: '╭─❏ 🧮 「 *WRONG ANSWER* 」\n┊ Mouu, answer *{given}* is wrong.\n┊ ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ᴀɴꜱᴡᴇʀ: *{answer}*\n┊ Streak stopped at *{streak}*, total points *{total}* turned into XP now~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🧮 「 *GAME STOPPED* 」\n┊ Streak *{streak}*, total points *{total}* already turned into XP~\n╰━━━━━━━',
      notNumber: '╭─❏ 🧮 「 *QUICK MATH* 」\n┊ Reply with a number please, not other text~\n╰━━━━━━━',
      stopBtn: '🏳️ Stop (.mathgame stop)',
    },
  },
}

export const test = { input: '.mathgame', expect: /hitung cepat|quick math/i }

function makeQuestion(streak) {
  const level = Math.min(3, Math.floor(streak / 4))
  const ops = level === 0 ? ['+', '-'] : level === 1 ? ['+', '-', 'x'] : ['+', '-', 'x', ':']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a
  let b
  let answer
  if (op === '+') { a = 3 + Math.floor(Math.random() * (20 + level * 30)); b = 3 + Math.floor(Math.random() * (20 + level * 30)); answer = a + b }
  else if (op === '-') { a = 10 + Math.floor(Math.random() * (30 + level * 30)); b = Math.floor(Math.random() * a); answer = a - b }
  else if (op === 'x') { a = 2 + Math.floor(Math.random() * 9); b = 2 + Math.floor(Math.random() * (6 + level * 4)); answer = a * b }
  else { b = 2 + Math.floor(Math.random() * 9); answer = 2 + Math.floor(Math.random() * 12); a = b * answer }
  return { a, b, op, answer, points: op === '+' || op === '-' ? 5 : 8 }
}

async function sendBoard(ctx, data, note = '') {
  const body = `${note ? `${note}\n\n` : ''}${ctx.t('mathgame.board', { a: data.q.a, op: data.q.op, b: data.q.b, streak: data.streak, total: data.total })}`
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('mathgame.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('mathgame.stopBtn'), id: '.mathgame stop' }],
    textFallback: body,
  })
  return sent?.key?.id
}

registerReplyKind('mathgame', async (ctx, binding) => {
  const data = binding.data
  const given = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isFinite(given)) {
    await ctx.reply(ctx.t('mathgame.notNumber'))
    return true
  }
  if (given !== data.q.answer) {
    await clearReply(ctx.storage, ctx.chat)
    if (data.total > 0) await addXp(ctx.storage, ctx.senderDigits, data.total)
    await ctx.reply(ctx.t('mathgame.wrong', { given, answer: data.q.answer, streak: data.streak, total: data.total, mood: ctx.say('gagal') }))
    return true
  }
  data.total += data.q.points
  data.streak += 1
  const note = ctx.t('mathgame.correct', { points: data.q.points })
  data.q = makeQuestion(data.streak)
  const id = await sendBoard(ctx, data, note)
  await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
  return true
})

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const existing = await getReplyBinding(ctx.storage, ctx.chat)
  if (arg === 'stop') {
    if (existing?.kind === 'mathgame') {
      await clearReply(ctx.storage, ctx.chat)
      if (existing.data.total > 0) await addXp(ctx.storage, ctx.senderDigits, existing.data.total)
      return ctx.reply(ctx.t('mathgame.stopped', { streak: existing.data.streak, total: existing.data.total }))
    }
    return ctx.reply(ctx.t('mathgame.noGame', { mood: ctx.say('malu') }))
  }
  if (existing?.kind === 'mathgame' && existing.ownerDigits === ctx.senderDigits) {
    const id = await sendBoard(ctx, existing.data)
    if (id) await saveReplyData(ctx.storage, ctx.chat, { ...existing, messageId: id, expiresAt: Date.now() + 600000 })
    return
  }
  if (existing) return ctx.reply(ctx.t('mathgame.startFail', { mood: ctx.say('malu') }))
  const data = { q: makeQuestion(0), streak: 0, total: 0 }
  const id = await sendBoard(ctx, data)
  await bindReply(ctx.storage, ctx.chat, { kind: 'mathgame', messageId: id, ownerDigits: ctx.senderDigits, ttlMs: 600000, data })
}
