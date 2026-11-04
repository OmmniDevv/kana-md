import { getSession, startQuiz, bindQuestionMessage } from '../../src/quiz/engine.js'
import { textImage } from '../../src/services/text-image.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tebakgambar',
  alias: ['tbgambar'],
  category: 'fun',
  description: { id: 'Kuis Tebak Gambar: tebak kata dari gambar petunjuk huruf tersembunyi', en: 'Picture quiz: guess the word from a hidden letter image clue' },
  usage: '.tebakgambar lalu balas pesan pertanyaannya dengan katanya',
  example: '.tebakgambar',
  cooldown: 5,
}

export const i18n = {
  id: {
    tebakgambar: {
      title: 'Kuis Tebak Gambar',
      caption: '🖼️ KUIS TEBAK GAMBAR {emoji}\nKategori: {category}\nSebagian hurufnya KANA sembunyikan jadi bintang. Tebak katanya yaa~',
      intro: 'Poin: {points} | Waktu: {seconds} detik. Balas (reply) pesan ini dengan katanya. Kalau stuck, pencet menyerah aja~ {mood}',
      imageFail: 'Mouu, gambar petunjuknya gagal dibuat... KANA kirim teksnya saja yaa: {masked} (kategori: {category})',
      already: 'Ehh, masih ada kuis {type} yang jalan di chat ini. Selesaikan dulu atau pencet tombol menyerah di bawah yaa~',
      giveUpBtn: '🏳️ Menyerah (.nyerah)',
      menuBtn: '🎲 Menu Fun',
      footer: 'Kuis KANA',
    },
  },
  en: {
    tebakgambar: {
      title: 'Picture Quiz',
      caption: '🖼️ PICTURE QUIZ {emoji}\nCategory: {category}\nSome letters are hidden as stars. Guess the word~',
      intro: 'Points: {points} | Time: {seconds} seconds. Reply to this message with the word. If you are stuck, just give up~ {mood}',
      imageFail: 'Mouu, the clue image failed to render... here is the text version: {masked} (category: {category})',
      already: 'Eh, a {type} quiz is still running in this chat. Finish it first or tap the give up button below~',
      giveUpBtn: '🏳️ Give Up (.nyerah)',
      menuBtn: '🎲 Fun Menu',
      footer: 'KANA Quiz',
    },
  },
}

export const test = { input: '.tebakgambar', expect: /tebak gambar|poin/i }

export async function handler(ctx) {
  const existing = await getSession(ctx.storage, ctx.chat)
  if (existing) {
    const body = ctx.t('tebakgambar.already', { type: existing.type })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tebakgambar.title'),
      body,
      footer: ctx.t('tebakgambar.footer'),
      replies: [
        { text: ctx.t('tebakgambar.giveUpBtn'), id: '.nyerah' },
      ],
      textFallback: body,
    })
  }
  const { question } = await startQuiz(ctx.storage, ctx.chat, 'tebakgambar', {
    lang: ctx.lang,
    startedBy: ctx.senderDigits,
  })
  const caption = ctx.t('tebakgambar.caption', { emoji: question.emoji, category: question.category })
  try {
    const image = await textImage({
      lines: [
        { text: question.emoji || '🖼️', size: 64 },
        { text: question.text, size: 72, bold: true },
        { text: question.category, size: 30 },
      ],
      width: 768,
      height: 512,
    })
    const imageSent = await ctx.sock.sendMessage(ctx.chat, { image, caption }, { quoted: ctx.raw })
    await bindQuestionMessage(ctx.storage, ctx.chat, imageSent?.key?.id)
  } catch {
    const failSent = await ctx.reply(ctx.t('tebakgambar.imageFail', { masked: question.text, category: question.category }))
    await bindQuestionMessage(ctx.storage, ctx.chat, failSent?.key?.id)
  }
  const body = ctx.t('tebakgambar.intro', { points: question.points, seconds: 120, mood: ctx.say('senang') })
  const sentQuestion = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakgambar.title'),
    body,
    footer: ctx.t('tebakgambar.footer'),
    replies: [
      { text: ctx.t('tebakgambar.giveUpBtn'), id: '.nyerah' },
    ],
    textFallback: body,
  })
  await bindQuestionMessage(ctx.storage, ctx.chat, sentQuestion?.key?.id)
  return sentQuestion
}
