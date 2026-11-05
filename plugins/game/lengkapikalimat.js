// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang kuis lengkapi kalimat beneran memakai
// mesin kuis repo dengan dataset kalimat berumpung sendiri
// (TEXT_SETS.lengkapikalimat), sesi berjalan lewat reply ke pesan soal.
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'lengkapikalimat',
  alias: ['lengkapi'],
  category: 'game',
  description: { id: 'Kuis lengkapi kalimat: tebak kata yang hilang, jawab dengan membalas pesan soal', en: 'Complete the sentence quiz: guess the missing word by replying to the question message' },
  usage: '.lengkapikalimat lalu balas pesan soal dengan kata yang hilang',
  example: '.lengkapikalimat',
  cooldown: 5,
}

export const i18n = {
  id: {
    lengkapikalimat: {
      title: 'Lengkapi Kalimat',
      intro: '╭─❏ ✏️ 「 *LENGKAPI KALIMAT* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan kata yang hilang yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    lengkapikalimat: {
      title: 'Complete the Sentence',
      intro: '╭─❏ ✏️ 「 *COMPLETE THE SENTENCE* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the missing word~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ NOT FINISHED* 」\n┊ A {type} quiz is still running in this chat. Finish it first or tap give up~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.lengkapikalimat', expect: /lengkapi|complete/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('lengkapikalimat.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('lengkapikalimat.title'), body, footer: ctx.t('lengkapikalimat.footer'), replies: [{ text: ctx.t('lengkapikalimat.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'lengkapikalimat', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('lengkapikalimat.intro', { clue: question.text, points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('lengkapikalimat.title'), body, footer: ctx.t('lengkapikalimat.footer'), replies: [{ text: ctx.t('lengkapikalimat.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
