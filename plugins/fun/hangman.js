import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'hangman',
  alias: ['tebakgantung'],
  category: 'fun',
  description: { id: 'Game hangman: tebak kata huruf demi huruf dengan membalas papan permainan', en: 'Hangman game: guess the word letter by letter by replying to the game board' },
  usage: '.hangman lalu balas papan permainan dengan huruf tebakanmu',
  example: '.hangman',
  cooldown: 3,
}

const WORDS = [
  { word: 'kucing', hint: { id: 'hewan peliharaan', en: 'a pet' } },
  { word: 'sekolah', hint: { id: 'tempat belajar', en: 'a place to study' } },
  { word: 'komputer', hint: { id: 'alat elektronik', en: 'an electronic device' } },
  { word: 'jendela', hint: { id: 'bagian rumah', en: 'part of a house' } },
  { word: 'sepeda', hint: { id: 'kendaraan roda dua', en: 'a two-wheeled vehicle' } },
  { word: 'matahari', hint: { id: 'di langit', en: 'in the sky' } },
  { word: 'pelangi', hint: { id: 'muncul setelah hujan', en: 'appears after rain' } },
  { word: 'semangka', hint: { id: 'buah', en: 'a fruit' } },
  { word: 'perpustakaan', hint: { id: 'tempat membaca', en: 'a place to read' } },
  { word: 'kebudayaan', hint: { id: 'warisan bangsa', en: 'national heritage' } },
  { word: 'gitar', hint: { id: 'alat musik', en: 'a musical instrument' } },
  { word: 'cokelat', hint: { id: 'makanan manis', en: 'a sweet food' } },
  { word: 'bandara', hint: { id: 'tempat pesawat', en: 'where planes are' } },
  { word: 'kereta', hint: { id: 'transportasi rel', en: 'rail transport' } },
  { word: 'pantai', hint: { id: 'tepi laut', en: 'seaside' } },
  { word: 'gunung', hint: { id: 'dataran tinggi', en: 'high land' } },
  { word: 'wartawan', hint: { id: 'profesi', en: 'a profession' } },
  { word: 'kalender', hint: { id: 'penanda tanggal', en: 'date marker' } },
  { word: 'restoran', hint: { id: 'tempat makan', en: 'a place to eat' } },
  { word: 'petualang', hint: { id: 'suka menjelajah', en: 'loves exploring' } },
]

export const i18n = {
  id: {
    hangman: {
      title: 'Hangman',
      board: '🪢 HANGMAN\n\nKata: *{display}*\nPetunjuk: {hint}\nNyawa: {lives} ❤️\nHuruf salah: {wrong}\n\nBalas (reply) papan ini dengan satu huruf, atau tebak seluruh kata sekaligus yaa~',
      startFail: 'Ada permainan lain yang lagi jalan di chat ini. Selesaikan dulu yaa~ {mood}',
      noGame: 'Belum ada hangman yang jalan. Mulai dengan .hangman yaa~ {mood}',
      stopped: 'Permainan hangman dihentikan. Kata tadi: *{word}*. Main lagi kapan aja yaa~',
      already: 'Huruf {letter} sudah pernah ditebak. Papan masih sama, balas papan terakhir yaa~',
      wrongGuess: 'Huruf {letter} tidak ada di kata ini. Nyawa sisa {lives}.',
      goodGuess: 'Betul, huruf {letter} ada!',
      win: '🎉 MENANG! Katanya memang *{word}*. Kamu dapat {xp} XP~ {mood}',
      lose: '💀 NYAWA HABIS! Katanya adalah *{word}*. Coba lagi yaa~ {mood}',
      stopBtn: '🏳️ Berhenti (.hangman stop)',
    },
  },
  en: {
    hangman: {
      title: 'Hangman',
      board: '🪢 HANGMAN\n\nWord: *{display}*\nHint: {hint}\nLives: {lives} ❤️\nWrong letters: {wrong}\n\nReply to this board with one letter, or guess the whole word at once~',
      startFail: 'Another game is running in this chat. Finish it first~ {mood}',
      noGame: 'No hangman is running. Start with .hangman~ {mood}',
      stopped: 'Hangman stopped. The word was *{word}*. Play again anytime~',
      already: 'Letter {letter} was already guessed. The board is unchanged, reply to the latest board~',
      wrongGuess: 'Letter {letter} is not in the word. Lives left {lives}.',
      goodGuess: 'Correct, letter {letter} is in!',
      win: '🎉 YOU WIN! The word is indeed *{word}*. You earned {xp} XP~ {mood}',
      lose: '💀 OUT OF LIVES! The word was *{word}*. Try again~ {mood}',
      stopBtn: '🏳️ Stop (.hangman stop)',
    },
  },
}

export const test = { input: '.hangman', expect: /hangman/i }

function display(data) {
  return data.word.split('').map((ch) => (data.guessed.includes(ch) ? ch.toUpperCase() : '_')).join(' ')
}

async function sendBoard(ctx, data, note = '') {
  const body = `${note ? `${note}\n\n` : ''}${ctx.t('hangman.board', {
    display: display(data),
    hint: data.hint[ctx.lang] ?? data.hint.id,
    lives: data.lives,
    wrong: data.wrong.length ? data.wrong.join(', ').toUpperCase() : '-',
  })}`
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('hangman.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('hangman.stopBtn'), id: '.hangman stop' }],
    textFallback: body,
  })
  return sent?.key?.id
}

registerReplyKind('hangman', async (ctx, binding) => {
  const data = binding.data
  const guess = (ctx.text || '').trim().toLowerCase()
  if (!/^[a-z]+$/.test(guess)) return true
  if (guess.length === 1) {
    if (data.guessed.includes(guess) || data.wrong.includes(guess)) {
      await ctx.reply(ctx.t('hangman.already', { letter: guess.toUpperCase() }))
      return true
    }
    if (data.word.includes(guess)) {
      data.guessed.push(guess)
      if (data.word.split('').every((ch) => data.guessed.includes(ch))) {
        await clearReply(ctx.storage, ctx.chat)
        await addXp(ctx.storage, ctx.senderDigits, 15)
        await ctx.reply(ctx.t('hangman.win', { word: data.word, xp: 15, mood: ctx.say('senang') }))
        return true
      }
      const note = ctx.t('hangman.goodGuess', { letter: guess.toUpperCase() })
      const id = await sendBoard(ctx, data, note)
      await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
      return true
    }
    data.wrong.push(guess)
    data.lives -= 1
    if (data.lives <= 0) {
      await clearReply(ctx.storage, ctx.chat)
      await ctx.reply(ctx.t('hangman.lose', { word: data.word, mood: ctx.say('gagal') }))
      return true
    }
    const note = ctx.t('hangman.wrongGuess', { letter: guess.toUpperCase(), lives: data.lives })
    const id = await sendBoard(ctx, data, note)
    await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
    return true
  }
  if (guess === data.word) {
    await clearReply(ctx.storage, ctx.chat)
    await addXp(ctx.storage, ctx.senderDigits, 15)
    await ctx.reply(ctx.t('hangman.win', { word: data.word, xp: 15, mood: ctx.say('senang') }))
    return true
  }
  data.lives -= 1
  if (data.lives <= 0) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('hangman.lose', { word: data.word, mood: ctx.say('gagal') }))
    return true
  }
  const note = ctx.t('hangman.wrongGuess', { letter: guess.toUpperCase(), lives: data.lives })
  const id = await sendBoard(ctx, data, note)
  await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
  return true
})

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const existing = await getReplyBinding(ctx.storage, ctx.chat)
  if (arg === 'stop') {
    if (existing?.kind === 'hangman') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('hangman.stopped', { word: existing.data.word }))
    }
    return ctx.reply(ctx.t('hangman.noGame', { mood: ctx.say('malu') }))
  }
  if (existing?.kind === 'hangman' && existing.ownerDigits === ctx.senderDigits) {
    const id = await sendBoard(ctx, existing.data)
    if (id) await saveReplyData(ctx.storage, ctx.chat, { ...existing, messageId: id, expiresAt: Date.now() + 600000 })
    return
  }
  if (existing) return ctx.reply(ctx.t('hangman.startFail', { mood: ctx.say('malu') }))
  const picked = WORDS[Math.floor(Math.random() * WORDS.length)]
  const data = { word: picked.word, hint: picked.hint, guessed: [], wrong: [], lives: 6 }
  const id = await sendBoard(ctx, data)
  await bindReply(ctx.storage, ctx.chat, { kind: 'hangman', messageId: id, ownerDigits: ctx.senderDigits, ttlMs: 600000, data })
}
