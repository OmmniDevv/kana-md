import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakjkt',
  alias: ['jakarta'],
  category: 'fun',
  description: { id: 'Kuis Tebak Jakarta: tebak nama hewan dari petunjuknya', en: 'Jakarta quiz: guess Jakarta places and icons from clues' },
  usage: '.tebakjkt lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakjkt',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakjkt: {
      title: 'Kuis Tebak Jakarta',
      intro: '🏙️ KUIS TEBAK JAKARTA\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan jawabannya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakjkt: {
      title: 'Jakarta Quiz',
      intro: '🏙️ JAKARTA QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the answer~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakjkt', expect: /tebak jakarta/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakjkt.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakjkt.title'),
      body,
      footer: ctx.t('tebakjkt.footer'),
      replies: [
        { text: ctx.t('tebakjkt.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakjkt', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakjkt.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakjkt.title'),
    body,
    footer: ctx.t('tebakjkt.footer'),
    replies: [
      { text: ctx.t('tebakjkt.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
