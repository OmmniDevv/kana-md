// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang kuis pilihan ganda beneran memakai
// mesin kuis repo (src/quiz/engine.js, set kuisumum) dengan sesi reply.
import { answerQuiz, bindQuestionMessage, getSession, startQuiz } from '../../src/quiz/engine.js'
import { reportResult } from '../../src/quiz/respond.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kuis',
  alias: [],
  category: 'game',
  description: { id: 'Kuis pengetahuan umum pilihan ganda, jawab dengan membalas pesan soal', en: 'General knowledge multiple choice quiz, answer by replying to the question message' },
  usage: '.kuis lalu balas pesan soal dengan huruf jawabanmu',
  example: '.kuis',
  cooldown: 5,
}

export const i18n = {
  id: {
    kuis: {
      title: 'Kuis',
      intro: '╭─❏ ❓ 「 *KUIS* 」\n┊ {question}\n┊\n┊ {options}\n┊\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan huruf jawabannya, atau pencet tombolnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ❓ 「 *KUIS MASIH JALAN* 」\n┊ Masih ada kuis *{type}* yang jalan di chat ini.\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    kuis: {
      title: 'Quiz',
      intro: '╭─❏ ❓ 「 *QUIZ* 」\n┊ {question}\n┊\n┊ {options}\n┊\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the answer letter, or tap an answer button~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ❓ 「 *QUIZ STILL RUNNING* 」\n┊ A *{type}* quiz is still running in this chat.\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.kuis', expect: /kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  const letterArg = (ctx.text || '').trim().toUpperCase()
  if (existing && existing.type === 'kuisumum' && /^[A-D]$/.test(letterArg)) {
    const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, letterArg)
    return reportResult(ctx, result)
  }
  if (existing) {
    const body = ctx.t('kuis.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kuis.title'),
      body,
      footer: ctx.t('kuis.footer'),
      replies: [{ text: ctx.t('kuis.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'kuisumum', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n┊ ')
  const body = ctx.t('kuis.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kuis.title'),
    body,
    footer: ctx.t('kuis.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.kuis ${LETTERS[i]}` })),
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
