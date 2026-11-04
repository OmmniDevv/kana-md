import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'susunkata',
  alias: ['susun'],
  category: 'fun',
  description: { id: 'Kuis Susun Kata: susun huruf acak menjadi kata yang benar', en: 'Word scramble quiz: unscramble the letters into the right word' },
  usage: '.susunkata lalu balas pesan pertanyaannya dengan kata yang benar',
  example: '.susunkata',
  cooldown: 5,
}

export const i18n = {
  id: {
    susunkata: {
      title: 'Kuis Susun Kata',
      intro: '╭─❏ 🔤 「 *KUIS SUSUN KATA* 」\n┊ Susun huruf ini jadi kata yang benar:\n┊ {letters}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan katanya langsung yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    susunkata: {
      title: 'Word Scramble Quiz',
      intro: '╭─❏ 🔤 「 *WORD SCRAMBLE QUIZ* 」\n┊ Unscramble these letters into the right word:\n┊ {letters}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the word directly~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.susunkata', expect: /susun kata|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('susunkata.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('susunkata.title'),
      body,
      footer: ctx.t('susunkata.footer'),
      replies: [
        { text: ctx.t('susunkata.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'susunkata', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('susunkata.intro', {
    letters: question.text.split('').join(' '),
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('susunkata.title'),
    body,
    footer: ctx.t('susunkata.footer'),
    replies: [
      { text: ctx.t('susunkata.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
