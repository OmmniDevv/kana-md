import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakangka',
  alias: ['guessnumber'],
  category: 'fun',
  description: { id: 'Tebak angka 1-100 dalam 10 kesempatan dengan membalas papan permainan', en: 'Guess the number 1-100 within 10 tries by replying to the game board' },
  usage: '.tebakangka lalu balas papan permainan dengan angka tebakanmu',
  example: '.tebakangka',
  cooldown: 3,
}

export const i18n = {
  id: {
    tebakangka: {
      title: 'Tebak Angka',
      board: '🔢 TEBAK ANGKA\n\nKANA sudah pilih angka 1-100.\nKesempatan: {left} kali lagi\nRiwayat: {history}\n\nBalas (reply) papan ini dengan angka tebakanmu yaa~',
      startFail: 'Ada permainan lain yang lagi jalan di chat ini. Selesaikan dulu yaa~ {mood}',
      noGame: 'Belum ada tebak angka yang jalan. Mulai dengan .tebakangka yaa~ {mood}',
      stopped: 'Permainan dihentikan. Angkanya tadi *{target}*. Main lagi kapan aja yaa~',
      higher: 'Terlalu kecil, angkanya lebih besar dari {guess}.',
      lower: 'Terlalu besar, angkanya lebih kecil dari {guess}.',
      notNumber: 'Balas dengan angka 1-100 yaa, bukan teks lain~',
      win: '🎉 TEPAT! Angkanya memang *{target}*. Kamu menebak dalam {attempts} kali dan dapat {xp} XP~ {mood}',
      lose: '💀 KESEMPATAN HABIS! Angkanya adalah *{target}*. Coba lagi yaa~ {mood}',
      stopBtn: '🏳️ Berhenti (.tebakangka stop)',
    },
  },
  en: {
    tebakangka: {
      title: 'Guess the Number',
      board: '🔢 GUESS THE NUMBER\n\nKANA picked a number 1-100.\nTries left: {left}\nHistory: {history}\n\nReply to this board with your guess~',
      startFail: 'Another game is running in this chat. Finish it first~ {mood}',
      noGame: 'No number guessing is running. Start with .tebakangka~ {mood}',
      stopped: 'Game stopped. The number was *{target}*. Play again anytime~',
      higher: 'Too low, the number is higher than {guess}.',
      lower: 'Too high, the number is lower than {guess}.',
      notNumber: 'Reply with a number 1-100 please, not other text~',
      win: '🎉 EXACT! The number is indeed *{target}*. You guessed in {attempts} tries and earned {xp} XP~ {mood}',
      lose: '💀 OUT OF TRIES! The number was *{target}*. Try again~ {mood}',
      stopBtn: '🏳️ Stop (.tebakangka stop)',
    },
  },
}

export const test = { input: '.tebakangka', expect: /tebak angka|guess/i }

const MAX_TRIES = 10

async function sendBoard(ctx, data, note = '') {
  const body = `${note ? `${note}\n\n` : ''}${ctx.t('tebakangka.board', {
    left: MAX_TRIES - data.attempts,
    history: data.history.length ? data.history.join(', ') : '-',
  })}`
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakangka.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('tebakangka.stopBtn'), id: '.tebakangka stop' }],
    textFallback: body,
  })
  return sent?.key?.id
}

registerReplyKind('tebakangka', async (ctx, binding) => {
  const data = binding.data
  const guess = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isFinite(guess) || guess < 1 || guess > 100) {
    await ctx.reply(ctx.t('tebakangka.notNumber'))
    return true
  }
  data.attempts += 1
  data.history.push(guess)
  if (guess === data.target) {
    const xp = Math.max(5, 16 - data.attempts)
    await clearReply(ctx.storage, ctx.chat)
    await addXp(ctx.storage, ctx.senderDigits, xp)
    await ctx.reply(ctx.t('tebakangka.win', { target: data.target, attempts: data.attempts, xp, mood: ctx.say('senang') }))
    return true
  }
  if (data.attempts >= MAX_TRIES) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('tebakangka.lose', { target: data.target, mood: ctx.say('gagal') }))
    return true
  }
  const note = ctx.t(guess < data.target ? 'tebakangka.higher' : 'tebakangka.lower', { guess })
  const id = await sendBoard(ctx, data, note)
  await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
  return true
})

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const existing = await getReplyBinding(ctx.storage, ctx.chat)
  if (arg === 'stop') {
    if (existing?.kind === 'tebakangka') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('tebakangka.stopped', { target: existing.data.target }))
    }
    return ctx.reply(ctx.t('tebakangka.noGame', { mood: ctx.say('malu') }))
  }
  if (existing?.kind === 'tebakangka' && existing.ownerDigits === ctx.senderDigits) {
    const id = await sendBoard(ctx, existing.data)
    if (id) await saveReplyData(ctx.storage, ctx.chat, { ...existing, messageId: id, expiresAt: Date.now() + 600000 })
    return
  }
  if (existing) return ctx.reply(ctx.t('tebakangka.startFail', { mood: ctx.say('malu') }))
  const data = { target: 1 + Math.floor(Math.random() * 100), attempts: 0, history: [] }
  const id = await sendBoard(ctx, data)
  await bindReply(ctx.storage, ctx.chat, { kind: 'tebakangka', messageId: id, ownerDigits: ctx.senderDigits, ttlMs: 600000, data })
}
