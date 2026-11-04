import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakkalimat',
  alias: ['kalimat'],
  category: 'fun',
  description: { id: 'Kuis Tebak Kalimat: lengkapi kata yang hilang dalam kalimat', en: 'Sentence quiz: complete the missing word in the sentence' },
  usage: '.tebakkalimat lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakkalimat',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakkalimat: {
      title: 'Kuis Tebak Kalimat',
      intro: '✏️ KUIS TEBAK KALIMAT\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan kata yang hilang yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakkalimat: {
      title: 'Sentence Quiz',
      intro: '✏️ SENTENCE QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the missing word~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakkalimat', expect: /tebak kalimat/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakkalimat.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakkalimat.title'),
      body,
      footer: ctx.t('tebakkalimat.footer'),
      replies: [
        { text: ctx.t('tebakkalimat.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakkalimat', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakkalimat.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakkalimat.title'),
    body,
    footer: ctx.t('tebakkalimat.footer'),
    replies: [
      { text: ctx.t('tebakkalimat.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
