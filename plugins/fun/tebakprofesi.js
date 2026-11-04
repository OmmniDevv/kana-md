import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakprofesi',
  alias: ['profesi'],
  category: 'fun',
  description: { id: 'Kuis Tebak Profesi: tebak nama pekerjaan dari petunjuk tugasnya', en: 'Profession quiz: guess the job name from its task clue' },
  usage: '.tebakprofesi lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakprofesi',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakprofesi: {
      title: 'Kuis Tebak Profesi',
      intro: '╭─❏ 💼 「 *KUIS TEBAK PROFESI* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan nama profesinya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakprofesi: {
      title: 'Profession Quiz',
      intro: '╭─❏ 💼 「 *PROFESSION QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the profession name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakprofesi', expect: /tebak profesi/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakprofesi.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakprofesi.title'),
      body,
      footer: ctx.t('tebakprofesi.footer'),
      replies: [
        { text: ctx.t('tebakprofesi.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakprofesi', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakprofesi.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakprofesi.title'),
    body,
    footer: ctx.t('tebakprofesi.footer'),
    replies: [
      { text: ctx.t('tebakprofesi.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
