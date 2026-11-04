import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tekateki',
  alias: ['teka'],
  category: 'fun',
  description: { id: 'Kuis Teka-Teki: pengetahuan umum pilihan ganda', en: 'Trivia quiz: general knowledge multiple choice' },
  usage: '.tekateki lalu pilih jawaban lewat tombol atau .jawab <A-D>',
  example: '.tekateki',
  cooldown: 5,
}

export const i18n = {
  id: {
    tekateki: {
      title: 'Kuis Teka-Teki',
      intro: '❓ KUIS TEKA-TEKI\n\n{question}\n\n{options}\n\nPoin: {points} | Waktu: {seconds} detik. Pencet tombol jawabannya atau balas dengan hurufnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tekateki: {
      title: 'Trivia Quiz',
      intro: '❓ TRIVIA QUIZ\n\n{question}\n\n{options}\n\nPoints: {points} | Time: {seconds} seconds. Tap an answer button or reply with its letter~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tekateki.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tekateki.title'),
      body,
      footer: ctx.t('tekateki.footer'),
      replies: [{ text: ctx.t('tekateki.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tekateki', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('tekateki.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tekateki.title'),
    body,
    footer: ctx.t('tekateki.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.jawab ${LETTERS[i]}` })),
    textFallback: body,
  })
}
