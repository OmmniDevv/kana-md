import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakgame',
  alias: ['gamekuis'],
  category: 'fun',
  description: { id: 'Kuis Tebak Game: tebak judul game dari petunjuknya', en: 'Game quiz: guess the game title from its clue' },
  usage: '.tebakgame lalu jawab lewat chat atau .jawab <jawaban>',
  example: '.tebakgame',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakgame: {
      title: 'Kuis Tebak Game',
      intro: '🎮 KUIS TEBAK GAME\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan judul gamenya atau .jawab <jawaban> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakgame: {
      title: 'Game Quiz',
      intro: '🎮 GAME QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the game title or .jawab <answer>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakgame', expect: /tebak game/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakgame.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakgame.title'),
      body,
      footer: ctx.t('tebakgame.footer'),
      replies: [
        { text: ctx.t('tebakgame.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('tebakgame.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakgame', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakgame.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakgame.title'),
    body,
    footer: ctx.t('tebakgame.footer'),
    replies: [
      { text: ctx.t('tebakgame.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('tebakgame.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
