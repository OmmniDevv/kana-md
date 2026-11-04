import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'asahotak',
  alias: ['asah'],
  category: 'fun',
  description: { id: 'Kuis Asah Otak: teka-teki logika pilihan ganda', en: 'Brain teaser quiz: multiple choice logic riddles' },
  usage: '.asahotak lalu pilih jawaban lewat tombol atau .jawab <A-D>',
  example: '.asahotak',
  cooldown: 5,
}

export const i18n = {
  id: {
    asahotak: {
      title: 'Kuis Asah Otak',
      intro: '🧠 KUIS ASAH OTAK\n\n{question}\n\n{options}\n\nPoin: {points} | Waktu: {seconds} detik. Pencet tombol jawabannya atau balas dengan hurufnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    asahotak: {
      title: 'Brain Teaser Quiz',
      intro: '🧠 BRAIN TEASER QUIZ\n\n{question}\n\n{options}\n\nPoints: {points} | Time: {seconds} seconds. Tap an answer button or reply with its letter~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.asahotak', expect: /asah otak|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('asahotak.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('asahotak.title'),
      body,
      footer: ctx.t('asahotak.footer'),
      replies: [{ text: ctx.t('asahotak.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'asahotak', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('asahotak.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('asahotak.title'),
    body,
    footer: ctx.t('asahotak.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.jawab ${LETTERS[i]}` })),
    textFallback: body,
  })
}
