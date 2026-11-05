
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "tebaklogo",
  alias: [],
  category: "game",
  description: { id: "Fitur tebaklogo versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD tebaklogo feature, rewritten in KANA style" },
  usage: ".tebaklogo",
  example: ".tebaklogo",
  cooldown: 5,
}

export const i18n = {
  id: {
    "tebaklogo": {
      title: "Kuis tebaklogo",
      intro: "╭─❏ ❓ 「 *KUIS TEBAKLOGO* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} ᴅᴇᴛɪᴋ*\n┊ Balas (reply) pesan ini dengan jawabannya yaa~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Menyerah (.nyerah)",
      footer: "Kuis KANA",
    },
  },
  en: {
    "tebaklogo": {
      title: "tebaklogo Quiz",
      intro: "╭─❏ ❓ 「 *TEBAKLOGO QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} ꜱᴇᴄᴏɴᴅꜱ*\n┊ Reply to this message with the answer~\n╰━━━━━━━ {mood}",
      already: "╭─❏ ⏳ 「 *QUIZ STILL RUNNING* 」\n┊ A {type} quiz is still running in this chat. Finish it first or give up~\n╰━━━━━━━",
      giveUpBtn: "🏳️ Give Up (.nyerah)",
      footer: "KANA Quiz",
    },
  },
}

export const test = { input: '.tebaklogo', expect: /kuis|quiz/i }
export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebaklogo.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebaklogo.title'), body, footer: ctx.t('tebaklogo.footer'), replies: [{ text: ctx.t('tebaklogo.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebaklogo', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('tebaklogo.intro', { clue: question.question ?? question.text ?? '', points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('tebaklogo.title'), body, footer: ctx.t('tebaklogo.footer'), replies: [{ text: ctx.t('tebaklogo.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
