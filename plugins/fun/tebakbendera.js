import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakbendera',
  alias: ['bendera'],
  category: 'fun',
  description: { id: 'Kuis Tebak Bendera: tebak nama negara dari emoji benderanya', en: 'Flag quiz: guess the country name from its flag emoji' },
  usage: '.tebakbendera lalu balas pesan pertanyaannya dengan nama negaranya',
  example: '.tebakbendera',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakbendera: {
      title: 'Kuis Tebak Bendera',
      intro: '╭─❏ 🏳️ 「 *KUIS TEBAK BENDERA* 」\n┊ Bendera negara apa ini?\n┊ {flag}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan nama negaranya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakbendera: {
      title: 'Flag Quiz',
      intro: '╭─❏ 🏳️ 「 *FLAG QUIZ* 」\n┊ Which country has this flag?\n┊ {flag}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the country name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakbendera', expect: /tebak bendera|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakbendera.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakbendera.title'),
      body,
      footer: ctx.t('tebakbendera.footer'),
      replies: [
        { text: ctx.t('tebakbendera.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakbendera', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('tebakbendera.intro', {
    flag: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakbendera.title'),
    body,
    footer: ctx.t('tebakbendera.footer'),
    replies: [
      { text: ctx.t('tebakbendera.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
