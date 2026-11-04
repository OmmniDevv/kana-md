import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakkartun',
  alias: ['kartun'],
  category: 'fun',
  description: { id: 'Kuis Tebak Kartun: tebak nama hewan dari petunjuknya', en: 'Cartoon quiz: guess the cartoon character from the clue' },
  usage: '.tebakkartun lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakkartun',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakkartun: {
      title: 'Kuis Tebak Kartun',
      intro: '📺 KUIS TEBAK KARTUN\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama tokohnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakkartun: {
      title: 'Cartoon Quiz',
      intro: '📺 CARTOON QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the character name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakkartun', expect: /tebak kartun/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakkartun.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakkartun.title'),
      body,
      footer: ctx.t('tebakkartun.footer'),
      replies: [
        { text: ctx.t('tebakkartun.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakkartun', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakkartun.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakkartun.title'),
    body,
    footer: ctx.t('tebakkartun.footer'),
    replies: [
      { text: ctx.t('tebakkartun.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
