import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'family100',
  alias: ['family', 'f100'],
  category: 'fun',
  description: { id: 'Kuis Family 100: tebak jawaban paling populer, poin per jawaban', en: 'Family 100 quiz: guess the most popular answers, points per answer' },
  usage: '.family100 lalu jawab dengan teks atau .jawab <jawaban>',
  example: '.family100',
  cooldown: 5,
}

export const i18n = {
  id: {
    family100: {
      title: 'Kuis Family 100',
      intro: '🎉 KUIS FAMILY 100\n\n{question}\n\nAda {count} jawaban populer, total {points} poin. Jawab satu-satu lewat chat biasa atau .jawab <jawaban>. Waktunya {seconds} detik, menyerah pakai .nyerah yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    family100: {
      title: 'Family 100 Quiz',
      intro: '🎉 FAMILY 100 QUIZ\n\n{question}\n\nThere are {count} popular answers worth {points} points in total. Answer one by one via plain chat or .jawab <answer>. You have {seconds} seconds, give up with .nyerah~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.family100', expect: /family 100|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('family100.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('family100.title'),
      body,
      footer: ctx.t('family100.footer'),
      replies: [
        { text: ctx.t('family100.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('family100.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'family100', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('family100.intro', {
    question: question.text,
    count: question.answersCount,
    points: question.points,
    seconds: 300,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('family100.title'),
    body,
    footer: ctx.t('family100.footer'),
    replies: [
      { text: ctx.t('family100.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('family100.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
