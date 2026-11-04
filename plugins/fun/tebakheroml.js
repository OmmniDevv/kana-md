import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakheroml',
  alias: ['heroml'],
  category: 'fun',
  description: { id: 'Kuis Tebak Hero ML: tebak nama hewan dari petunjuknya', en: 'Mobile Legends hero quiz from skill and role clues' },
  usage: '.tebakheroml lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakheroml',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakheroml: {
      title: 'Kuis Tebak Hero ML',
      intro: '⚔️ KUIS TEBAK HERO ML\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama heronya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakheroml: {
      title: 'ML Hero Quiz',
      intro: '⚔️ ML HERO QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the hero name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakheroml', expect: /tebak hero/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakheroml.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakheroml.title'),
      body,
      footer: ctx.t('tebakheroml.footer'),
      replies: [
        { text: ctx.t('tebakheroml.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakheroml', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakheroml.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakheroml.title'),
    body,
    footer: ctx.t('tebakheroml.footer'),
    replies: [
      { text: ctx.t('tebakheroml.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
