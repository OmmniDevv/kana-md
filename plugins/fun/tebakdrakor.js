import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakdrakor',
  alias: ['drakor'],
  category: 'fun',
  description: { id: 'Kuis Tebak Drakor: tebak judul drama Korea dari sinopsis singkatnya', en: 'K-drama quiz: guess the Korean drama title from its short synopsis' },
  usage: '.tebakdrakor lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakdrakor',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakdrakor: {
      title: 'Kuis Tebak Drakor',
      intro: '📺 KUIS TEBAK DRAKOR\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan judul dramanya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakdrakor: {
      title: 'K-Drama Quiz',
      intro: '📺 K-DRAMA QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the drama title~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakdrakor', expect: /tebak drakor/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakdrakor.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakdrakor.title'),
      body,
      footer: ctx.t('tebakdrakor.footer'),
      replies: [
        { text: ctx.t('tebakdrakor.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakdrakor', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakdrakor.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakdrakor.title'),
    body,
    footer: ctx.t('tebakdrakor.footer'),
    replies: [
      { text: ctx.t('tebakdrakor.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
