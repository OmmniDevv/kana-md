import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakwarna',
  alias: ['warna'],
  category: 'fun',
  description: { id: 'Kuis Tebak Warna: tebak nama hewan dari petunjuknya', en: 'Color quiz: guess the result of mixing paint colors' },
  usage: '.tebakwarna lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakwarna',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakwarna: {
      title: 'Kuis Tebak Warna',
      intro: '╭─❏ 🎨 「 *KUIS TEBAK WARNA* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan nama warnanya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakwarna: {
      title: 'Color Quiz',
      intro: '╭─❏ 🎨 「 *COLOR QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the color name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakwarna', expect: /tebak warna/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakwarna.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakwarna.title'),
      body,
      footer: ctx.t('tebakwarna.footer'),
      replies: [
        { text: ctx.t('tebakwarna.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakwarna', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakwarna.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakwarna.title'),
    body,
    footer: ctx.t('tebakwarna.footer'),
    replies: [
      { text: ctx.t('tebakwarna.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
