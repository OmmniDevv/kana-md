import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebaksurah',
  alias: ['surah'],
  category: 'fun',
  description: { id: 'Kuis Tebak Surah: tebak nama surah Al-Quran dari petunjuknya', en: 'Surah quiz: guess the Quran surah name from its clue' },
  usage: '.tebaksurah lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebaksurah',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebaksurah: {
      title: 'Kuis Tebak Surah',
      intro: '🕌 KUIS TEBAK SURAH\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan nama surahnya yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebaksurah: {
      title: 'Surah Quiz',
      intro: '🕌 SURAH QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply to this message with the surah name~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebaksurah', expect: /tebak surah/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaksurah.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebaksurah.title'),
      body,
      footer: ctx.t('tebaksurah.footer'),
      replies: [
        { text: ctx.t('tebaksurah.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaksurah', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebaksurah.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebaksurah.title'),
    body,
    footer: ctx.t('tebaksurah.footer'),
    replies: [
      { text: ctx.t('tebaksurah.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
