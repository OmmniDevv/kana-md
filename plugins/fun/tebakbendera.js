import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakbendera',
  alias: ['bendera'],
  category: 'fun',
  description: { id: 'Kuis Tebak Bendera: tebak nama negara dari emoji benderanya', en: 'Flag quiz: guess the country name from its flag emoji' },
  usage: '.tebakbendera lalu jawab nama negara lewat chat atau .jawab <negara>',
  example: '.tebakbendera',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakbendera: {
      title: 'Kuis Tebak Bendera',
      intro: '🏳️ KUIS TEBAK BENDERA\n\nBendera negara apa ini?\n\n{flag}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan nama negaranya atau .jawab <negara> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakbendera: {
      title: 'Flag Quiz',
      intro: '🏳️ FLAG QUIZ\n\nWhich country has this flag?\n\n{flag}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the country name or .jawab <country>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakbendera', expect: /tebak bendera|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakbendera.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakbendera.title'),
      body,
      footer: ctx.t('tebakbendera.footer'),
      replies: [
        { text: ctx.t('tebakbendera.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('tebakbendera.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakbendera', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakbendera.intro', {
    flag: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakbendera.title'),
    body,
    footer: ctx.t('tebakbendera.footer'),
    replies: [
      { text: ctx.t('tebakbendera.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('tebakbendera.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
