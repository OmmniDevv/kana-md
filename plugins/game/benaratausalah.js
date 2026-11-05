// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang kuis benar/salah beneran memakai mesin
// kuis repo dengan dataset pernyataan faktual (TEXT_SETS.benaratausalah),
// sesi berjalan lewat reply ke pesan soal.
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'benaratausalah',
  alias: ['bos', 'truefalse'],
  category: 'game',
  description: { id: 'Kuis benar atau salah: nilai pernyataan faktual, jawab dengan membalas pesan soal', en: 'True or false quiz: judge factual statements, answer by replying to the question message' },
  usage: '.benaratausalah lalu balas pesan soal dengan kata benar atau salah',
  example: '.benaratausalah',
  cooldown: 5,
}

export const i18n = {
  id: {
    benaratausalah: {
      title: 'Benar atau Salah',
      intro: '╭─❏ ⚖️ 「 *BENAR ATAU SALAH* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan kata *benar* atau *salah* yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    benaratausalah: {
      title: 'True or False',
      intro: '╭─❏ ⚖️ 「 *TRUE OR FALSE* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the word *true* or *false*~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ NOT FINISHED* 」\n┊ A {type} quiz is still running in this chat. Finish it first or tap give up~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.benaratausalah', expect: /benar atau salah|true or false/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('benaratausalah.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('benaratausalah.title'), body, footer: ctx.t('benaratausalah.footer'), replies: [{ text: ctx.t('benaratausalah.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'benaratausalah', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('benaratausalah.intro', { clue: question.text, points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('benaratausalah.title'), body, footer: ctx.t('benaratausalah.footer'), replies: [{ text: ctx.t('benaratausalah.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
