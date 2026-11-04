import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakkimia',
  alias: ['kimia'],
  category: 'fun',
  description: { id: 'Kuis Tebak Kimia: tebak nama unsur dari lambangnya atau sebaliknya', en: 'Chemistry quiz: guess the element name from its symbol or the reverse' },
  usage: '.tebakkimia lalu jawab lewat chat atau .jawab <jawaban>',
  example: '.tebakkimia',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakkimia: {
      title: 'Kuis Tebak Kimia',
      introName: '🧪 KUIS TEBAK KIMIA\n\nLambang unsur ini nama unsurnya apa?\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan namanya atau .jawab <nama> yaa~ {mood}',
      introSymbol: '🧪 KUIS TEBAK KIMIA\n\nUnsur ini lambang kimianya apa?\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan lambangnya atau .jawab <lambang> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakkimia: {
      title: 'Chemistry Quiz',
      introName: '🧪 CHEMISTRY QUIZ\n\nWhat is the element name for this symbol?\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the name or .jawab <name>~ {mood}',
      introSymbol: '🧪 CHEMISTRY QUIZ\n\nWhat is the chemical symbol for this element?\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the symbol or .jawab <symbol>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakkimia.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakkimia.title'),
      body,
      footer: ctx.t('tebakkimia.footer'),
      replies: [
        { text: ctx.t('tebakkimia.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('tebakkimia.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakkimia', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const key = question.mode === 'name-to-symbol' ? 'tebakkimia.introSymbol' : 'tebakkimia.introName'
  const body = ctx.t(key, {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakkimia.title'),
    body,
    footer: ctx.t('tebakkimia.footer'),
    replies: [
      { text: ctx.t('tebakkimia.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('tebakkimia.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
