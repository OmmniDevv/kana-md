// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang kuis matematika beneran: soal aritmetika
// dibangkitkan mesin kuis repo (tipe 'math' di src/quiz/engine.js), sesi
// berjalan lewat reply ke pesan soal. Kanonis untuk .maths (alias).
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'math',
  alias: ['maths'],
  category: 'game',
  description: { id: 'Kuis matematika: hitung soal aritmetika yang dibangkitkan acak, jawab dengan membalas pesan soal', en: 'Math quiz: solve randomly generated arithmetic, answer by replying to the question message' },
  usage: '.math lalu balas pesan soal dengan hasil hitungnya',
  example: '.math',
  cooldown: 5,
}

export const i18n = {
  id: {
    math: {
      title: 'Kuis Matematika',
      intro: '╭─❏ 🔢 「 *KUIS MATEMATIKA* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan hasil hitungnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    math: {
      title: 'Math Quiz',
      intro: '╭─❏ 🔢 「 *MATH QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the result~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ NOT FINISHED* 」\n┊ A {type} quiz is still running in this chat. Finish it first or tap give up~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.math', expect: /=\s*\?/ }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('math.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('math.title'), body, footer: ctx.t('math.footer'), replies: [{ text: ctx.t('math.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'math', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('math.intro', { clue: question.text, points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('math.title'), body, footer: ctx.t('math.footer'), replies: [{ text: ctx.t('math.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
