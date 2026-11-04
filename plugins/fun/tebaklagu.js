import { getSession, startQuiz } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebaklagu',
  alias: ['lagu'],
  category: 'fun',
  description: { id: 'Kuis Tebak Lagu: tebak judul lagu dari potongan lirik pertamanya', en: 'Song quiz: guess the song title from its opening lyric' },
  usage: '.tebaklagu lalu jawab lewat chat atau .jawab <jawaban>',
  example: '.tebaklagu',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebaklagu: {
      title: 'Kuis Tebak Lagu',
      intro: '🎵 KUIS TEBAK LAGU\n\n{clue}\n\nPoin: {points} | Waktu: {seconds} detik. Balas dengan judul lagunya atau .jawab <jawaban> yaa~ {mood}',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebaklagu: {
      title: 'Song Quiz',
      intro: '🎵 SONG QUIZ\n\n{clue}\n\nPoints: {points} | Time: {seconds} seconds. Reply with the song title or .jawab <answer>~ {mood}',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebaklagu', expect: /tebak lagu/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaklagu.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebaklagu.title'),
      body,
      footer: ctx.t('tebaklagu.footer'),
      replies: [
        { text: ctx.t('tebaklagu.giveUpBtn'), id: '.nyerah' },
        { text: ctx.t('tebaklagu.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaklagu', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebaklagu.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebaklagu.title'),
    body,
    footer: ctx.t('tebaklagu.footer'),
    replies: [
      { text: ctx.t('tebaklagu.giveUpBtn'), id: '.nyerah' },
      { text: ctx.t('tebaklagu.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
