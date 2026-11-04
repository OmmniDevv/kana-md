import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakprovinsi',
  alias: ['provinsi'],
  category: 'fun',
  description: { id: 'Kuis Tebak Provinsi: tebak nama provinsi Indonesia dari petunjuknya', en: 'Province quiz: guess the Indonesian province name from its clue' },
  usage: '.tebakprovinsi lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakprovinsi',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakprovinsi: {
      title: 'Kuis Tebak Provinsi',
      intro: '╭─❏ 🗺️ 「 *KUIS TEBAK PROVINSI* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan nama provinsinya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakprovinsi: {
      title: 'Province Quiz',
      intro: '╭─❏ 🗺️ 「 *PROVINCE QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the province name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakprovinsi', expect: /tebak provinsi/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakprovinsi.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakprovinsi.title'),
      body,
      footer: ctx.t('tebakprovinsi.footer'),
      replies: [
        { text: ctx.t('tebakprovinsi.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakprovinsi', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakprovinsi.intro', {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakprovinsi.title'),
    body,
    footer: ctx.t('tebakprovinsi.footer'),
    replies: [
      { text: ctx.t('tebakprovinsi.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
