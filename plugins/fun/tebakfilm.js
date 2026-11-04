import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakfilm',
  alias: ['filmkuis'],
  category: 'fun',
  description: { id: 'Kuis Tebak Film: tebak judul film dari tahun dan sinopsis singkatnya', en: 'Movie quiz: guess the movie title from its year and short synopsis' },
  usage: '.tebakfilm lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakfilm',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakfilm: {
      title: 'Kuis Tebak Film',
      intro: '🎬 KUIS TEBAK FILM\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan judul filmnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakfilm: {
      title: 'Movie Quiz',
      intro: '🎬 MOVIE QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the movie title~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakfilm', expect: /tebak film/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakfilm.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakfilm.title'),
      body,
      footer: ctx.t('tebakfilm.footer'),
      replies: [
        { text: ctx.t('tebakfilm.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakfilm', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakfilm.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakfilm.title'),
    body,
    footer: ctx.t('tebakfilm.footer'),
    replies: [
      { text: ctx.t('tebakfilm.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
