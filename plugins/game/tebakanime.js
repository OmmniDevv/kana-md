
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "tebakanime",
  alias: [],
  category: "game",
  description: { id: "Tebak anime dari deskripsi (dapat limit)", en: "KANA version of the Elaina-MD tebakanime feature, rewritten in KANA style" },
  usage: ".tebakanime",
  example: ".tebakanime",
  cooldown: 5,
}

export const i18n = {
  id: {
    "tebakanime": {
      title: "Kuis tebakanime",
      intro: "╭─❏ ❓ 「 *KUIS TEBAKANIME* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan jawabannya yaa~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Menyerah (.nyerah)",
      footer: "Kuis KANA",
    },
  },
  en: {
    "tebakanime": {
      title: "tebakanime Quiz",
      intro: "╭─❏ ❓ 「 *TEBAKANIME QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the answer~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ A {type} quiz is still running in this chat. Finish it first or give up~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Give Up (.nyerah)",
      footer: "KANA Quiz",
    },
  },
}

export const test = { input: '.tebakanime', expect: /kuis|quiz/i }
export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakanime.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebakanime.title'), body, footer: ctx.t('tebakanime.footer'), replies: [{ text: ctx.t('tebakanime.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakanime', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('tebakanime.intro', { clue: question.question ?? question.text ?? '', points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebakanime.title'), body, footer: ctx.t('tebakanime.footer'), replies: [{ text: ctx.t('tebakanime.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
