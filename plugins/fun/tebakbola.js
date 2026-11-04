import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakbola',
  alias: ['bola'],
  category: 'fun',
  description: { id: 'Kuis Tebak Bola: tebak klub, pemain, atau stadion sepak bola dari petunjuknya', en: 'Football quiz: guess the club, player, or stadium from its clue' },
  usage: '.tebakbola lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakbola',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakbola: {
      title: 'Kuis Tebak Bola',
      intro: '⚽ KUIS TEBAK BOLA\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan jawabannya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakbola: {
      title: 'Football Quiz',
      intro: '⚽ FOOTBALL QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the answer~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakbola', expect: /tebak bola/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakbola.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakbola.title'),
      body,
      footer: ctx.t('tebakbola.footer'),
      replies: [
        { text: ctx.t('tebakbola.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakbola', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakbola.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakbola.title'),
    body,
    footer: ctx.t('tebakbola.footer'),
    replies: [
      { text: ctx.t('tebakbola.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
