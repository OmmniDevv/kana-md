import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakkimia',
  alias: ['kimia'],
  category: 'fun',
  description: { id: 'Kuis Tebak Kimia: tebak nama unsur dari lambangnya atau sebaliknya', en: 'Chemistry quiz: guess the element name from its symbol or the reverse' },
  usage: '.tebakkimia lalu balas pesan pertanyaannya dengan jawabanmu',
  example: '.tebakkimia',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakkimia: {
      title: 'Kuis Tebak Kimia',
      introName: '╭─❏ 🧪 「 *KUIS TEBAK KIMIA* 」\n┊ Lambang unsur ini nama unsurnya apa?\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan namanya yaa~\n╰━━━━━━━ {mood}',
      introSymbol: '╭─❏ 🧪 「 *KUIS TEBAK KIMIA* 」\n┊ Unsur ini lambang kimianya apa?\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan lambangnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakkimia: {
      title: 'Chemistry Quiz',
      introName: '╭─❏ 🧪 「 *CHEMISTRY QUIZ* 」\n┊ What is the element name for this symbol?\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the name~\n╰━━━━━━━ {mood}',
      introSymbol: '╭─❏ 🧪 「 *CHEMISTRY QUIZ* 」\n┊ What is the chemical symbol for this element?\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the symbol~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakkimia', expect: /tebak kimia|kuis/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakkimia.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakkimia.title'),
      body,
      footer: ctx.t('tebakkimia.footer'),
      replies: [
        { text: ctx.t('tebakkimia.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakkimia', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const key = question.mode === 'name-to-symbol' ? 'tebakkimia.introSymbol' : 'tebakkimia.introName'
  const body = ctx.t(key, {
    clue: question.text,
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakkimia.title'),
    body,
    footer: ctx.t('tebakkimia.footer'),
    replies: [
      { text: ctx.t('tebakkimia.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
