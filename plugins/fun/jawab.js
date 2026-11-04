import { answerQuiz, getSession } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

// Sama dengan PREFIXES di pipeline; disalin agar plugin tidak mengimpor core.
const PREFIXES = ['.', '!', '/', '#']

export const config = {
  name: 'jawab',
  alias: ['jwb'],
  category: 'fun',
  description: { id: 'Jawab kuis yang sedang berjalan di chat ini', en: 'Answer the quiz currently running in this chat' },
  usage: '.jawab <jawaban>',
  example: '.jawab B',
  cooldown: 0,
  priority: 40,
}

export const i18n = {
  id: {
    jawab: {
      usage: 'Pakai: .jawab <jawaban> yaa~ Contoh: .jawab B atau .jawab kucing.',
      noSession: 'Ehh, belum ada kuis yang jalan di chat ini. Mulai dulu yuk, pencet tombol di bawah~ {mood}',
      correct: '🎉 BENAR! Jawabannya: {answer}. Kamu dapat {points} poin XP~ {mood}',
      correctPartial: '🎉 BENAR! "{answer}" ketemu, +{points} poin. Total sementara {earned} poin, masih ada {remaining} jawaban lagi. Lanjut tebak yaa~',
      allFound: '🏆 SEMUA JAWABAN KETEMU! Total {earned} poin XP masuk ke profilmu~ {mood}',
      wrong: 'Mouu, belum tepat... coba lagi yaa, waktunya masih ada~ {mood}',
      startBtn: '❓ Mulai Teka-Teki',
      againBtn: '🔁 Main Lagi',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    jawab: {
      usage: 'Use: .jawab <answer>~ Example: .jawab B or .jawab cat.',
      noSession: 'Eh, no quiz is running in this chat yet. Let us start one, tap the button below~ {mood}',
      correct: '🎉 CORRECT! The answer is: {answer}. You earned {points} XP points~ {mood}',
      correctPartial: '🎉 CORRECT! "{answer}" found, +{points} points. Running total {earned} points, {remaining} answers left. Keep guessing~',
      allFound: '🏆 ALL ANSWERS FOUND! A total of {earned} XP points went to your profile~ {mood}',
      wrong: 'Mouu, not quite... try again, there is still time~ {mood}',
      startBtn: '❓ Start Trivia',
      againBtn: '🔁 Play Again',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

async function reportResult(ctx, result) {
  if (result.noSession) {
    const body = ctx.t('jawab.noSession', { mood: ctx.say('malu') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('jawab.footer'),
      replies: [
        { text: ctx.t('jawab.startBtn'), id: '.tekateki' },
        { text: ctx.t('jawab.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  if (!result.correct) {
    const body = ctx.t('jawab.wrong', { mood: ctx.say('gagal') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('jawab.footer'),
      replies: [{ text: ctx.t('jawab.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  if (!result.finished) {
    return ctx.reply(
      ctx.t('jawab.correctPartial', {
        answer: result.answer,
        points: result.points,
        earned: result.earned,
        remaining: result.remaining,
      })
    )
  }
  const body =
    result.type === 'family100'
      ? ctx.t('jawab.allFound', { earned: result.earned, mood: ctx.say('senang') })
      : ctx.t('jawab.correct', { answer: result.answer, points: result.points, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('jawab.footer'),
    replies: [
      { text: ctx.t('jawab.againBtn'), id: `.${result.type}` },
      { text: ctx.t('jawab.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}

export const test = { input: '.jawab B', expect: /belum ada kuis|no quiz/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('jawab.usage'))
  const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, text)
  return reportResult(ctx, result)
}

// Jawaban lewat pesan biasa: bila ada sesi aktif di chat dan pesan bukan
// perintah berprefix, perlakukan teksnya sebagai jawaban kuis. Diam total
// bila tidak ada sesi supaya tidak mengganggu obrolan normal.
export async function before(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return
  if (PREFIXES.some((p) => text.startsWith(p))) return
  const session = await getSession(ctx.storage, ctx.chat)
  if (!session) return
  const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, text)
  if (result.noSession) return
  await reportResult(ctx, result)
}
