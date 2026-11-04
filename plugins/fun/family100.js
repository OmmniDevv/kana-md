import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'family100',
  alias: ['family', 'f100'],
  category: 'fun',
  description: { id: 'Kuis Family 100: tebak jawaban paling populer, poin per jawaban', en: 'Family 100 quiz: guess the most popular answers, points per answer' },
  usage: '.family100 lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.family100',
  cooldown: 5,
}

export const i18n = {
  id: {
    family100: {
      title: 'Kuis Family 100',
      intro: '╭─❏ 🎉 「 *KUIS FAMILY 100* 」\n┊ {question}\n┊\n┊ ᴀᴅᴀ *{count} ᴊᴀᴡᴀʙᴀɴ ᴘᴏᴘᴜʟᴇʀ*, total *{points} ᴘᴏɪɴ*\n┊ Balas (reply) pesan ini dengan jawabanmu satu-satu.\n┊ ᴡᴀᴋᴛᴜ: *{seconds} detik*, menyerah pakai *.nyerah* yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🎉 「 *KUIS MASIH JALAN* 」\n┊ Masih ada kuis *{type}* yang jalan di chat ini.\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    family100: {
      title: 'Family 100 Quiz',
      intro: '╭─❏ 🎉 「 *FAMILY 100 QUIZ* 」\n┊ {question}\n┊\n┊ ᴛʜᴇʀᴇ ᴀʀᴇ *{count} ᴘᴏᴘᴜʟᴀʀ ᴀɴꜱᴡᴇʀꜱ* worth *{points} ᴘᴏɪɴᴛꜱ* in total.\n┊ Reply to this message with your answers one by one.\n┊ ᴛɪᴍᴇ: *{seconds} seconds*, give up with *.nyerah*~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🎉 「 *QUIZ STILL RUNNING* 」\n┊ A *{type}* quiz is still running in this chat.\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.family100', expect: /family 100|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('family100.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('family100.title'),
      body,
      footer: ctx.t('family100.footer'),
      replies: [
        { text: ctx.t('family100.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'family100', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('family100.intro', {
    question: question.text,
    count: question.answersCount,
    points: question.points,
    seconds: 300,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('family100.title'),
    body,
    footer: ctx.t('family100.footer'),
    replies: [
      { text: ctx.t('family100.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
