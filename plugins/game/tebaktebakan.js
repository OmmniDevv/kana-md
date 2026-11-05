
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "tebaktebakan",
  alias: [],
  category: "game",
  description: { id: "Fitur tebaktebakan versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD tebaktebakan feature, rewritten in KANA style" },
  usage: ".tebaktebakan",
  example: ".tebaktebakan",
  cooldown: 5,
}

export const i18n = {
  id: {
    "tebaktebakan": {
      title: "Kuis tebaktebakan",
      intro: "╭─❏ ❓ 「 *KUIS TEBAKTEBAKAN* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan jawabannya yaa~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Menyerah (.nyerah)",
      footer: "Kuis KANA",
    },
  },
  en: {
    "tebaktebakan": {
      title: "tebaktebakan Quiz",
      intro: "╭─❏ ❓ 「 *TEBAKTEBAKAN QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the answer~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ A {type} quiz is still running in this chat. Finish it first or give up~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Give Up (.nyerah)",
      footer: "KANA Quiz",
    },
  },
}

export const test = { input: '.tebaktebakan', expect: /kuis|quiz/i }
export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaktebakan.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebaktebakan.title'), body, footer: ctx.t('tebaktebakan.footer'), replies: [{ text: ctx.t('tebaktebakan.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaktebakan', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('tebaktebakan.intro', { clue: question.question ?? question.text ?? '', points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebaktebakan.title'), body, footer: ctx.t('tebaktebakan.footer'), replies: [{ text: ctx.t('tebaktebakan.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
