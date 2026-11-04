import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'riddle',
  alias: ['tekariddle'],
  category: 'fun',
  description: { id: 'Teka-Teki Riddle: tebak nama hewan dari petunjuknya', en: 'Riddle quiz: answer classic riddles with one word or a short phrase' },
  usage: '.riddle lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.riddle',
  cooldown: 5,
}

export const i18n = {
  id: {
    riddle: {
      title: 'Teka-Teki Riddle',
      intro: '╭─❏ 🧩 「 *TEKA-TEKI RIDDLE* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan jawabannya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    riddle: {
      title: 'Riddle Quiz',
      intro: '╭─❏ 🧩 「 *RIDDLE TIME* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the answer~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.riddle', expect: /riddle/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('riddle.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('riddle.title'),
      body,
      footer: ctx.t('riddle.footer'),
      replies: [
        { text: ctx.t('riddle.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'riddle', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('riddle.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('riddle.title'),
    body,
    footer: ctx.t('riddle.footer'),
    replies: [
      { text: ctx.t('riddle.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
