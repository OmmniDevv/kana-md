import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebaknegara',
  alias: ['negara'],
  category: 'fun',
  description: { id: 'Kuis Tebak Negara: tebak nama negara dari petunjuknya', en: 'Country quiz: guess the country name from its clue' },
  usage: '.tebaknegara lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebaknegara',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebaknegara: {
      title: 'Kuis Tebak Negara',
      intro: '🌍 KUIS TEBAK NEGARA\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama negaranya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebaknegara: {
      title: 'Country Quiz',
      intro: '🌍 COUNTRY QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the country name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebaknegara', expect: /tebak negara/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaknegara.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebaknegara.title'),
      body,
      footer: ctx.t('tebaknegara.footer'),
      replies: [
        { text: ctx.t('tebaknegara.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaknegara', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebaknegara.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebaknegara.title'),
    body,
    footer: ctx.t('tebaknegara.footer'),
    replies: [
      { text: ctx.t('tebaknegara.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
