import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakprofesi',
  alias: ['profesi'],
  category: 'fun',
  description: { id: 'Kuis Tebak Profesi: tebak nama pekerjaan dari petunjuk tugasnya', en: 'Profession quiz: guess the job name from its task clue' },
  usage: '.tebakprofesi lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakprofesi',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakprofesi: {
      title: 'Kuis Tebak Profesi',
      intro: '💼 KUIS TEBAK PROFESI\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama profesinya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakprofesi: {
      title: 'Profession Quiz',
      intro: '💼 PROFESSION QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the profession name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakprofesi', expect: /tebak profesi/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakprofesi.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakprofesi.title'),
      body,
      footer: ctx.t('tebakprofesi.footer'),
      replies: [
        { text: ctx.t('tebakprofesi.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakprofesi', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakprofesi.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakprofesi.title'),
    body,
    footer: ctx.t('tebakprofesi.footer'),
    replies: [
      { text: ctx.t('tebakprofesi.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
