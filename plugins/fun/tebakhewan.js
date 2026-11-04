import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakhewan',
  alias: ['hewan'],
  category: 'fun',
  description: { id: 'Kuis Tebak Hewan: tebak nama hewan dari petunjuknya', en: 'Animal quiz: guess the animal name from its clue' },
  usage: '.tebakhewan lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakhewan',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakhewan: {
      title: 'Kuis Tebak Hewan',
      intro: '🐾 KUIS TEBAK HEWAN\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama hewannya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakhewan: {
      title: 'Animal Quiz',
      intro: '🐾 ANIMAL QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the animal name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakhewan', expect: /tebak hewan/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakhewan.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakhewan.title'),
      body,
      footer: ctx.t('tebakhewan.footer'),
      replies: [
        { text: ctx.t('tebakhewan.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakhewan', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakhewan.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakhewan.title'),
    body,
    footer: ctx.t('tebakhewan.footer'),
    replies: [
      { text: ctx.t('tebakhewan.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
