import { giveUp } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'nyerah',
  alias: ['menyerah', 'giveup'],
  category: 'fun',
  description: { id: 'Menyerah pada kuis yang sedang berjalan dan lihat jawabannya', en: 'Give up on the running quiz and reveal the answer' },
  usage: '.nyerah',
  example: '.nyerah',
  cooldown: 0,
}

export const i18n = {
  id: {
    nyerah: {
      noSession: 'Belum ada kuis yang jalan di chat ini, jadi tidak ada yang perlu diserahin~ Mulai kuis yuk lewat tombol di bawah. {mood}',
      result: '🏳️ Okee, KANA buka jawabannya yaa~\n\nJawaban yang benar: {answer}\n\nTidak apa-apa menyerah, yang penting sudah berani coba! Main lagi yuk biar poinnya kekumpul. {mood}',
      againBtn: '🔁 Coba Lagi',
      otherBtn: '❓ Teka-Teki',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    nyerah: {
      noSession: 'No quiz is running in this chat, so there is nothing to give up on~ Start one with the button below. {mood}',
      result: '🏳️ Okay, KANA will reveal it~\n\nThe correct answer: {answer}\n\nGiving up is fine, what matters is you tried! Play again to collect those points. {mood}',
      againBtn: '🔁 Try Again',
      otherBtn: '❓ Trivia',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export async function handler(ctx) {
  const result = await giveUp(ctx.storage, ctx.chat)
  if (!result) {
    const body = ctx.t('nyerah.noSession', { mood: ctx.say('malu') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('nyerah.footer'),
      replies: [
        { text: ctx.t('nyerah.otherBtn'), id: '.tekateki' },
        { text: ctx.t('nyerah.menuBtn'), id: '.menu fun' },
      ],
      textFallback: body,
    })
  }
  const body = ctx.t('nyerah.result', { answer: result.answer || '-', mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('nyerah.footer'),
    replies: [
      { text: ctx.t('nyerah.againBtn'), id: `.${result.type}` },
      { text: ctx.t('nyerah.menuBtn'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
