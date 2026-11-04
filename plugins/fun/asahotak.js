import { answerQuiz, bindQuestionMessage, getSession, startQuiz } from '../../src/quiz/engine.js'
import { reportResult } from '../../src/quiz/respond.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'asahotak',
  alias: ['asah'],
  category: 'fun',
  description: { id: 'Kuis Asah Otak: teka-teki logika pilihan ganda', en: 'Brain teaser quiz: multiple choice logic riddles' },
  usage: '.asahotak lalu pilih jawaban lewat tombol atau balas pesan ini dengan hurufnya',
  example: '.asahotak',
  cooldown: 5,
}

export const i18n = {
  id: {
    asahotak: {
      title: 'Kuis Asah Otak',
      intro: '╭─❏ 🧠 「 *KUIS ASAH OTAK* 」\n┊ {question}\n┊\n┊ {options}\n╰━━━━━━━\nᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\nBalas (reply) pesan ini dengan huruf jawabannya, atau pencet tombolnya yaa~ {mood}',
      already: '╭─❏ 🧠 「 *KUIS ASAH OTAK* 」\n┊ Ehh, masih ada kuis *{type}* yang jalan di chat ini~\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    asahotak: {
      title: 'Brain Teaser Quiz',
      intro: '╭─❏ 🧠 「 *BRAIN TEASER QUIZ* 」\n┊ {question}\n┊\n┊ {options}\n╰━━━━━━━\nᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\nReply to this message with the answer letter, or tap an answer button~ {mood}',
      already: '╭─❏ 🧠 「 *BRAIN TEASER QUIZ* 」\n┊ Eh, a *{type}* quiz is still running in this chat~\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

const LETTERS = ['A', 'B', 'C', 'D']

export const test = { input: '.asahotak', expect: /asah otak|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  const letterArg = (ctx.text || '').trim().toUpperCase()
  if (existing && existing.type === 'asahotak' && /^[A-D]$/.test(letterArg)) {
    const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, letterArg)
    return reportResult(ctx, result)
  }
  if (existing) {
    const body = ctx.t('asahotak.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('asahotak.title'),
      body,
      footer: ctx.t('asahotak.footer'),
      replies: [{ text: ctx.t('asahotak.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'asahotak', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const options = question.options ?? []
  const optionsText = options.map((opt, i) => `${LETTERS[i]}. ${opt}`).join('\n')
  const body = ctx.t('asahotak.intro', {
    question: question.text,
    options: optionsText,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('asahotak.title'),
    body,
    footer: ctx.t('asahotak.footer'),
    replies: options.map((opt, i) => ({ text: `${LETTERS[i]}. ${opt}`.slice(0, 60), id: `.asahotak ${LETTERS[i]}` })),
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
