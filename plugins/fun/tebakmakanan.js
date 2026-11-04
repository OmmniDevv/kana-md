import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakmakanan',
  alias: ['makanan'],
  category: 'fun',
  description: { id: 'Kuis Tebak Makanan: tebak nama makanan khas Indonesia dari petunjuknya', en: 'Food quiz: guess the Indonesian food name from its clue' },
  usage: '.tebakmakanan lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakmakanan',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakmakanan: {
      title: 'Kuis Tebak Makanan',
      intro: '🍜 KUIS TEBAK MAKANAN\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama makanannya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakmakanan: {
      title: 'Food Quiz',
      intro: '🍜 FOOD QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the food name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakmakanan', expect: /tebak makanan/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakmakanan.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakmakanan.title'),
      body,
      footer: ctx.t('tebakmakanan.footer'),
      replies: [
        { text: ctx.t('tebakmakanan.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakmakanan', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakmakanan.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakmakanan.title'),
    body,
    footer: ctx.t('tebakmakanan.footer'),
    replies: [
      { text: ctx.t('tebakmakanan.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
