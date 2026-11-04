import { answerQuiz, bindQuestionMessage, getSession, startQuiz } from '../../src/quiz/engine.js'
import { reportResult } from '../../src/quiz/respond.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cerdascermat',
  alias: ['cerdas'],
  category: 'fun',
  description: { id: 'Kuis Cerdas Cermat: teka-teki logika pilihan ganda', en: 'Cerdas Cermat quiz: multiple choice general knowledge' },
  usage: '.cerdascermat lalu pilih jawaban lewat tombol atau balas pesan ini dengan hurufnya',
  example: '.cerdascermat',
  cooldown: 5,
}

export const i18n = {
  id: {
    cerdascermat: {
      title: 'Kuis Cerdas Cermat',
      intro: '🏆 KUIS CERDAS CERMAT\n\n{question}\n\n{options}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan huruf jawabannya, atau pencet tombolnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    cerdascermat: {
      title: 'Cerdas Cermat Quiz',
      intro: '🏆 CERDAS CERMAT QUIZ\n\n{question}\n\n{options}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the answer letter, or tap an answer button~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.cerdascermat', expect: /cerdas cermat/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  const letterArg = (ctx.text || '').trim().toUpperCase()
  if (existing && existing.type === 'cerdascermat' && /^[A-D]$/.test(letterArg)) {
    const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, letterArg)
    return reportResult(ctx, result)
  }
  if (existing) {
    const body = ctx.t('cerdascermat.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('cerdascermat.title'),
      body,
      footer: ctx.t('cerdascermat.footer'),
      replies: [{ text: ctx.t('cerdascermat.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'cerdascermat', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('cerdascermat.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cerdascermat.title'),
    body,
    footer: ctx.t('cerdascermat.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.cerdascermat ${LETTERS[i]}` })),
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
