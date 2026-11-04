import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'siapakahaku',
  alias: ['siapaaku'],
  category: 'fun',
  description: { id: 'Kuis Siapakah Aku: tebak nama hewan dari petunjuknya', en: 'Who Am I quiz: guess the famous figure from first-person clues' },
  usage: '.siapakahaku lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.siapakahaku',
  cooldown: 5,
}

export const i18n = {
  id: {
    siapakahaku: {
      title: 'Kuis Siapakah Aku',
      intro: '╭─❏ 🕵️ 「 *KUIS SIAPAKAH AKU* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan nama tokohnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    siapakahaku: {
      title: 'Who Am I Quiz',
      intro: '╭─❏ 🕵️ 「 *WHO AM I QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the figure name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.siapakahaku', expect: /siapakah aku/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('siapakahaku.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('siapakahaku.title'),
      body,
      footer: ctx.t('siapakahaku.footer'),
      replies: [
        { text: ctx.t('siapakahaku.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'siapakahaku', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('siapakahaku.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('siapakahaku.title'),
    body,
    footer: ctx.t('siapakahaku.footer'),
    replies: [
      { text: ctx.t('siapakahaku.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
