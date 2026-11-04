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
      noSession: '╭─❏ ❓ 「 *BELUM ADA KUIS* 」\n┊ Belum ada kuis yang jalan di chat ini.\n┊ Mulai dulu yuk, pencet tombol di bawah~\n╰━━━━━━━ {mood}',
      correct: '╭─❏ 🎉 「 *BENAR* 」\n┊ ᴊᴀᴡᴀʙᴀɴɴʏᴀ: *{answer}*\n┊ Kamu dapat *{points} poin XP*~\n╰━━━━━━━ {mood}',
      correctPartial: '╭─❏ 🎉 「 *BENAR* 」\n┊ *"{answer}"* ketemu, *+{points} poin*.\n┊ ᴛᴏᴛᴀʟ ꜱᴇᴍᴇɴᴛᴀʀᴀ: *{earned} poin*, masih ada *{remaining} jawaban* lagi.\n┊ Balas pesan pertanyaannya lagi buat lanjut nebak yaa~\n╰━━━━━━━',
      allFound: '╭─❏ 🏆 「 *SEMUA JAWABAN KETEMU* 」\n┊ Total *{earned} poin XP* masuk ke profilmu~\n╰━━━━━━━ {mood}',
      wrong: '╭─❏ 🌸 「 *BELUM TEPAT* 」\n┊ Mouu, belum tepat...\n┊ Balas pesan pertanyaannya lagi buat coba lagi yaa, waktunya masih ada~\n╰━━━━━━━ {mood}',
      startBtn: '❓ Mulai Teka-Teki',
      againBtn: '🔁 Main Lagi',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
    nyerah: {
      noSession: '╭─❏ 🏳️ 「 *BELUM ADA KUIS* 」\n┊ Belum ada kuis yang jalan di chat ini, jadi tidak ada yang perlu diserahin~\n┊ Mulai kuis yuk lewat tombol di bawah.\n╰━━━━━━━ {mood}',
      result: '╭─❏ 🏳️ 「 *JAWABAN DIBUKA* 」\n┊ Okee, KANA buka jawabannya yaa~\n┊ ᴊᴀᴡᴀʙᴀɴ ʏᴀɴɢ ʙᴇɴᴀʀ: *{answer}*\n┊\n┊ Tidak apa-apa menyerah, yang penting sudah berani coba! Main lagi yuk biar poinnya kekumpul.\n╰━━━━━━━ {mood}',
      againBtn: '🔁 Coba Lagi',
      otherBtn: '❓ Teka-Teki',
      footer: 'Kuis KANA',
    },
  },
  en: {
    jawab: {
      noSession: '╭─❏ ❓ 「 *NO QUIZ YET* 」\n┊ No quiz is running in this chat yet.\n┊ Let us start one, tap the button below~\n╰━━━━━━━ {mood}',
      correct: '╭─❏ 🎉 「 *CORRECT* 」\n┊ ᴛʜᴇ ᴀɴꜱᴡᴇʀ ɪꜱ: *{answer}*\n┊ You earned *{points} XP points*~\n╰━━━━━━━ {mood}',
      correctPartial: '╭─❏ 🎉 「 *CORRECT* 」\n┊ *"{answer}"* found, *+{points} points*.\n┊ ʀᴜɴɴɪɴɢ ᴛᴏᴛᴀʟ: *{earned} points*, *{remaining} answers* left.\n┊ Reply to the question message again to keep guessing~\n╰━━━━━━━',
      allFound: '╭─❏ 🏆 「 *ALL ANSWERS FOUND* 」\n┊ A total of *{earned} XP points* went to your profile~\n╰━━━━━━━ {mood}',
      wrong: '╭─❏ 🌸 「 *NOT QUITE* 」\n┊ Mouu, not quite...\n┊ Reply to the question message to try again, there is still time~\n╰━━━━━━━ {mood}',
      startBtn: '❓ Start Trivia',
      againBtn: '🔁 Play Again',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
    nyerah: {
      noSession: '╭─❏ 🏳️ 「 *NO QUIZ YET* 」\n┊ No quiz is running in this chat, so there is nothing to give up on~\n┊ Start one with the button below.\n╰━━━━━━━ {mood}',
      result: '╭─❏ 🏳️ 「 *ANSWER REVEALED* 」\n┊ Okay, KANA will reveal it~\n┊ ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ᴀɴꜱᴡᴇʀ: *{answer}*\n┊\n┊ Giving up is fine, what matters is you tried! Play again to collect those points.\n╰━━━━━━━ {mood}',
      againBtn: '🔁 Try Again',
      otherBtn: '❓ Trivia',
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
