import { answerQuiz, bindQuestionMessage, getSession, startQuiz } from '../../src/quiz/engine.js'
import { reportResult } from '../../src/quiz/respond.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'caklontong',
  alias: ['lontong'],
  category: 'fun',
  description: { id: 'Kuis Cak Lontong: tebak-tebakan logika absurd pilihan ganda', en: 'Cak Lontong quiz: absurd logic multiple choice riddles' },
  usage: '.caklontong lalu pilih jawaban lewat tombol atau balas pesan ini dengan hurufnya',
  example: '.caklontong',
  cooldown: 5,
}

export const i18n = {
  id: {
    caklontong: {
      title: 'Kuis Cak Lontong',
      intro: '╭─❏ 🤭 「 *KUIS CAK LONTONG* 」\n┊ {question}\n┊\n┊ {options}\n╰━━━━━━━\nᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\nBalas (reply) pesan ini dengan huruf jawabannya, atau pencet tombolnya yaa~ {mood}',
      already: '╭─❏ 🤭 「 *KUIS CAK LONTONG* 」\n┊ Ehh, masih ada kuis *{type}* yang jalan di chat ini~\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    caklontong: {
      title: 'Cak Lontong Quiz',
      intro: '╭─❏ 🤭 「 *CAK LONTONG QUIZ* 」\n┊ {question}\n┊\n┊ {options}\n╰━━━━━━━\nᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\nReply to this message with the answer letter, or tap an answer button~ {mood}',
      already: '╭─❏ 🤭 「 *CAK LONTONG QUIZ* 」\n┊ Eh, a *{type}* quiz is still running in this chat~\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.caklontong', expect: /cak lontong|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  const letterArg = (ctx.text || '').trim().toUpperCase()
  if (existing && existing.type === 'caklontong' && /^[A-D]$/.test(letterArg)) {
    const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, letterArg)
    return reportResult(ctx, result)
  }
  if (existing) {
    const body = ctx.t('caklontong.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('caklontong.title'),
      body,
      footer: ctx.t('caklontong.footer'),
      replies: [{ text: ctx.t('caklontong.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'caklontong', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('caklontong.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('caklontong.title'),
    body,
    footer: ctx.t('caklontong.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.caklontong ${LETTERS[i]}` })),
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
