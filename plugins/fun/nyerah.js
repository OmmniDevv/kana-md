import { giveUp } from '../../src/quiz/engine.js'
import { handleQuizReply } from '../../src/quiz/respond.js'
import { dispatchReply } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'nyerah',
  alias: ['menyerah', 'giveup'],
  category: 'fun',
  description: { id: 'Menyerah pada kuis yang sedang berjalan dan lihat jawabannya', en: 'Give up on the running quiz and reveal the answer' },
  usage: '.nyerah',
  example: '.nyerah',
  cooldown: 0,
}

export const i18n = {
  id: {
    jawab: {
      noSession: 'Ehh, belum ada kuis yang jalan di chat ini. Mulai dulu yuk, pencet tombol di bawah~ {mood}',
      correct: '🎉 BENAR! Jawabannya: {answer}. Kamu dapat {points} poin XP~ {mood}',
      correctPartial: '🎉 BENAR! "{answer}" ketemu, +{points} poin. Total sementara {earned} poin, masih ada {remaining} jawaban lagi. Balas pesan pertanyaannya lagi buat lanjut nebak yaa~',
      allFound: '🏆 SEMUA JAWABAN KETEMU! Total {earned} poin XP masuk ke profilmu~ {mood}',
      wrong: 'Mouu, belum tepat... balas pesan pertanyaannya lagi buat coba lagi yaa, waktunya masih ada~ {mood}',
      startBtn: '❓ Mulai Teka-Teki',
      againBtn: '🔁 Main Lagi',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
    nyerah: {
      noSession: 'Belum ada kuis yang jalan di chat ini, jadi tidak ada yang perlu diserahin~ Mulai kuis yuk lewat tombol di bawah. {mood}',
      result: '🏳️ Okee, KANA buka jawabannya yaa~\n\nJawaban yang benar: {answer}\n\nTidak apa-apa menyerah, yang penting sudah berani coba! Main lagi yuk biar poinnya kekumpul. {mood}',
      againBtn: '🔁 Coba Lagi',
      otherBtn: '❓ Teka-Teki',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    jawab: {
      noSession: 'Eh, no quiz is running in this chat yet. Let us start one, tap the button below~ {mood}',
      correct: '🎉 CORRECT! The answer is: {answer}. You earned {points} XP points~ {mood}',
      correctPartial: '🎉 CORRECT! "{answer}" found, +{points} points. Running total {earned} points, {remaining} answers left. Reply to the question message again to keep guessing~',
      allFound: '🏆 ALL ANSWERS FOUND! A total of {earned} XP points went to your profile~ {mood}',
      wrong: 'Mouu, not quite... reply to the question message to try again, there is still time~ {mood}',
      startBtn: '❓ Start Trivia',
      againBtn: '🔁 Play Again',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
    nyerah: {
      noSession: 'No quiz is running in this chat, so there is nothing to give up on~ Start one with the button below. {mood}',
      result: '🏳️ Okay, KANA will reveal it~\n\nThe correct answer: {answer}\n\nGiving up is fine, what matters is you tried! Play again to collect those points. {mood}',
      againBtn: '🔁 Try Again',
      otherBtn: '❓ Trivia',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.nyerah', expect: /belum ada kuis|no quiz/i }

// Routing reply bersama (standar reply-first): SATU hook untuk semua
// alur balasan. Urutan: jawaban kuis (src/quiz/respond.js), lalu binding
// reply generik (src/ui/reply-router.js) untuk game dan alur lain.
// Mengembalikan false berarti pesan sudah dikonsumsi dan pipeline
// berhenti memprosesnya.
export async function before(ctx) {
  const quizResult = await handleQuizReply(ctx)
  if (quizResult === false) return false
  return dispatchReply(ctx)
}

export async function handler(ctx) {
  const result = await giveUp(ctx.storage, ctx.chat)
  if (!result) {
    const body = ctx.t('nyerah.noSession', { mood: ctx.say('malu') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('nyerah.footer'),
      replies: [
        { text: ctx.t('nyerah.otherBtn'), id: '.tekateki' },
      ],
      textFallback: body,
    })
  }
  const body = ctx.t('nyerah.result', { answer: result.answer || '-', mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('nyerah.footer'),
    replies: [
      { text: ctx.t('nyerah.againBtn'), id: `.${result.type}` },
    ],
    textFallback: body,
  })
}
