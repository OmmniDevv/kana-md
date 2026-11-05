// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang kuis surah beneran memakai mesin kuis
// repo dengan dataset nomor dan fakta surah sendiri (TEXT_SETS.surah,
// berbeda dari set tebaksurah), sesi berjalan lewat reply ke pesan soal.
import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'surah',
  alias: ['kuissurah'],
  category: 'game',
  description: { id: 'Kuis surah: tebak nama surah dari nomor urut dan faktanya, jawab dengan membalas pesan soal', en: 'Surah quiz: guess the surah name from its order number and facts by replying to the question message' },
  usage: '.surah lalu balas pesan soal dengan nama surahnya',
  example: '.surah',
  cooldown: 5,
}

export const i18n = {
  id: {
    surah: {
      title: 'Kuis Surah',
      intro: '╭─❏ 🕌 「 *KUIS SURAH* 」\n┊ {clue}\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan nama surahnya yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *KUIS BELUM SELESAI* 」\n┊ Masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet menyerah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    surah: {
      title: 'Surah Quiz',
      intro: '╭─❏ 🕌 「 *SURAH QUIZ* 」\n┊ {clue}\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the surah name~\n╰━━━━━━━ {mood}',
      already: '╭─❏ ⏳ 「 *QUIZ NOT FINISHED* 」\n┊ A {type} quiz is still running in this chat. Finish it first or tap give up~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.surah', expect: /surah/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('surah.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('surah.title'), body, footer: ctx.t('surah.footer'), replies: [{ text: ctx.t('surah.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'surah', { lang: ctx.lang, startedBy: ctx.senderDigits })
  const body = ctx.t('surah.intro', { clue: question.text, points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sent = await sendButtons(ctx.sock, ctx.chat, { title: ctx.t('surah.title'), body, footer: ctx.t('surah.footer'), replies: [{ text: ctx.t('surah.giveUpBtn'), id: '.nyerah' }], textFallback: body })
  await bindQuestionMessage(ctx.storage, ctx.chat, sent?.key?.id)
  return sent
}
