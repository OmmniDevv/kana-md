import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'susunkata',
  alias: ['susun'],
  category: 'fun',
  description: { id: 'Kuis Susun Kata: susun huruf acak menjadi kata yang benar', en: 'Word scramble quiz: unscramble the letters into the right word' },
  usage: '.susunkata lalu jawab kata yang benar lewat chat atau .jawab <kata>',
  example: '.susunkata',
  cooldown: 5,
}

export const i18n = {
  id: {
    susunkata: {
      title: 'Kuis Susun Kata',
      intro: '🔤 KUIS SUSUN KATA\n\nSusun huruf ini jadi kata yang benar:\n\n{letters}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan katanya langsung atau .jawab <kata> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    susunkata: {
      title: 'Word Scramble Quiz',
      intro: '🔤 WORD SCRAMBLE QUIZ\n\nUnscramble these letters into the right word:\n\n{letters}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the word directly or .jawab <word>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.susunkata', expect: /susun kata|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('susunkata.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('susunkata.title'),
      body,
      footer: ctx.t('susunkata.footer'),
      replies: [
        { text: ctx.t('susunkata.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('susunkata.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'susunkata', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('susunkata.intro', {
    letters: question.text.split('').join(' '),
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('susunkata.title'),
    body,
    footer: ctx.t('susunkata.footer'),
    replies: [
      { text: ctx.t('susunkata.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('susunkata.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
