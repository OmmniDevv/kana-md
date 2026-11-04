import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kataacak',
  alias: ['acak'],
  category: 'fun',
  description: { id: 'Kuis Kata Acak: susun huruf acak menjadi kata yang benar', en: 'Word scramble quiz: unscramble the letters into the right word' },
  usage: '.kataacak lalu balas pesan pertanyaannya dengan kata yang benar',
  example: '.kataacak',
  cooldown: 5,
}

export const i18n = {
  id: {
    kataacak: {
      title: 'Kuis Kata Acak',
      intro: '╭─❏ 🔤 「 *KUIS KATA ACAK* 」\n┊ Susun huruf ini jadi kata yang benar, kata-katanya lebih panjang dari Susun Kata:\n┊\n┊ *{letters}*\n┊\n┊ ᴘᴏɪɴ: *{points}* | ᴡᴀᴋᴛᴜ: *{seconds} detik*\n┊ Balas (reply) pesan ini dengan katanya langsung yaa~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🔤 「 *KUIS MASIH JALAN* 」\n┊ Masih ada kuis *{type}* yang jalan di chat ini.\n┊ Selesaikan dulu atau pencet tombol menyerah di bawah yaa~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      footer: 'Kuis KANA',
    },
  },
  en: {
    kataacak: {
      title: 'Kata Acak Word Scramble Quiz',
      intro: '╭─❏ 🔤 「 *KATA ACAK WORD QUIZ* 」\n┊ Unscramble these letters into the right word, longer words than Word Scramble:\n┊\n┊ *{letters}*\n┊\n┊ ᴘᴏɪɴᴛꜱ: *{points}* | ᴛɪᴍᴇ: *{seconds} seconds*\n┊ Reply to this message with the word directly~\n╰━━━━━━━ {mood}',
      already: '╭─❏ 🔤 「 *QUIZ STILL RUNNING* 」\n┊ A *{type}* quiz is still running in this chat.\n┊ Finish it first or tap the give up button below~\n╰━━━━━━━',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.kataacak', expect: /kata acak/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('kataacak.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kataacak.title'),
      body,
      footer: ctx.t('kataacak.footer'),
      replies: [
        { text: ctx.t('kataacak.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'kataacak', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const body = ctx.t('kataacak.intro', {
    letters: question.text.split('').join(' '),
    points: question.points,
    seconds: 120,
    mood: ctx.say('senang'),
  })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kataacak.title'),
    body,
    footer: ctx.t('kataacak.footer'),
    replies: [
      { text: ctx.t('kataacak.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
