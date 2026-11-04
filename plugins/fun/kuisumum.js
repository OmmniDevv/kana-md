import { answerQuiz, bindQuestionMessage, getSession, startQuiz } from '../../src/quiz/engine.js'
import { reportResult } from '../../src/quiz/respond.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kuisumum',
  alias: ['umum'],
  category: 'fun',
  description: { id: 'Kuis Umum: teka-teki logika pilihan ganda', en: 'General quiz: mixed knowledge and logic multiple choice' },
  usage: '.kuisumum lalu pilih jawaban lewat tombol atau balas pesan ini dengan hurufnya',
  example: '.kuisumum',
  cooldown: 5,
}

export const i18n = {
  id: {
    kuisumum: {
      title: 'Kuis Umum',
      intro: '╭─❏ 🌐 「 *KUIS UMUM* 」\n┊ {question}\n┊\n┊ {options}\n┊\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan huruf jawabannya, atau pencet tombolnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🌐 「 *KUIS MASIH JALAN* 」\n┊ Masih ada kuis *{type}* yang jalan di chat ini.\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    kuisumum: {
      title: 'General Quiz',
      intro: '╭─❏ 🌐 「 *GENERAL QUIZ* 」\n┊ {question}\n┊\n┊ {options}\n┊\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the answer letter, or tap an answer button~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🌐 「 *QUIZ STILL RUNNING* 」\n┊ A *{type}* quiz is still running in this chat.\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.kuisumum', expect: /kuis umum/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  const letterArg = (ctx.text || '').trim().toUpperCase()
  if (existing && existing.type === 'kuisumum' && /^[A-D]$/.test(letterArg)) {
    const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, letterArg)
    return reportResult(ctx, result)
  }
  if (existing) {
    const body = ctx.t('kuisumum.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kuisumum.title'),
      body,
      footer: ctx.t('kuisumum.footer'),
      replies: [{ text: ctx.t('kuisumum.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'kuisumum', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('kuisumum.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kuisumum.title'),
    body,
    footer: ctx.t('kuisumum.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.kuisumum ${LETTERS[i]}` })),
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
