import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebaklirik',
  alias: ['kuislirik'],
  category: 'fun',
  description: { id: 'Kuis Tebak Lirik: lengkapi kata yang hilang dari lirik lagu', en: 'Lyric quiz: complete the missing word from song lyrics' },
  usage: '.tebaklirik lalu jawab lewat chat atau .jawab <jawaban>',
  example: '.tebaklirik',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebaklirik: {
      title: 'Kuis Tebak Lirik',
      intro: '🎤 KUIS TEBAK LIRIK\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan kata lirik yang hilang atau .jawab <jawaban> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebaklirik: {
      title: 'Lyric Quiz',
      intro: '🎤 LYRIC QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the missing lyric word or .jawab <answer>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebaklirik', expect: /tebak lirik/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaklirik.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebaklirik.title'),
      body,
      footer: ctx.t('tebaklirik.footer'),
      replies: [
        { text: ctx.t('tebaklirik.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('tebaklirik.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaklirik', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebaklirik.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebaklirik.title'),
    body,
    footer: ctx.t('tebaklirik.footer'),
    replies: [
      { text: ctx.t('tebaklirik.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('tebaklirik.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
