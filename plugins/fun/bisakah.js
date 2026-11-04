import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'bisakah',
  alias: [],
  category: 'fun',
  description: { id: 'Tanya bisakah kamu melakukan sesuatu, KANA jawab iseng memotivasi', en: 'Ask if you can do something, KANA answers playfully and motivating' },
  usage: '.bisakah <pertanyaan>',
  example: '.bisakah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    bisakah: {
      title: 'Bola Kristal: Bisakah?',
      ask: '💪 {question}\n\nJawaban bola kristal KANA: {answer} {mood}',
      usage: 'Tanya dulu dong~ Contoh: .bisakah <pertanyaan kamu>',
      answers: [
  "Bisa banget! Kamu cuma perlu mulai~ 💪",
  "Bisa, asal konsisten dan tidak gampang menyerah",
  "Bisa kok, KANA percaya sama kamu!",
  "Hmm, bisa tapi jalannya agak berliku yaa",
  "Bisa, dengan bantuan orang yang tepat~",
  "Sekarang mungkin belum, tapi nanti pasti bisa",
  "Bisa! Yang susah itu memulainya saja",
  "Tentu bisa, kamu lebih kuat dari yang kamu kira~"
],
      btnAgain: 'Tanya Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    bisakah: {
      title: 'Crystal Ball: Can I?',
      ask: '💪 {question}\n\nKANA crystal ball answer: {answer} {mood}',
      usage: 'Ask something first~ Example: .bisakah <your question>',
      answers: [
  "Absolutely! You just need to start~ 💪",
  "You can, if you stay consistent and do not give up easily",
  "You can, KANA believes in you!",
  "Hmm, you can but the road is a bit winding",
  "You can, with help from the right people~",
  "Maybe not now, but later you surely can",
  "You can! The hard part is only starting",
  "Of course you can, you are stronger than you think~"
],
      btnAgain: 'Ask Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.bisakah besok cerah', expect: /bola kristal/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.bisakah?.answers ?? i18n.id.bisakah.answers
  if (!question) {
    const body = ctx.t('bisakah.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('bisakah.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('bisakah.btnMenu'), id: '.menu fun' }],
      textFallback: body,
    })
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('bisakah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('bisakah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('bisakah.btnAgain'), id: '.bisakah' },
      { text: ctx.t('bisakah.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
