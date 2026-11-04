import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kapankah',
  alias: ['kapan'],
  category: 'fun',
  description: { id: 'Tanya kapan sesuatu terjadi, KANA jawab tebakan waktu iseng', en: 'Ask when something will happen, KANA answers a playful time guess' },
  usage: '.kapankah <pertanyaan>',
  example: '.kapankah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    kapankah: {
      title: 'Bola Kristal: Kapankah?',
      ask: '⏳ {question}\n\nJawaban bola kristal KANA: {answer} {mood}',
      usage: 'Tanya dulu dong~ Contoh: .kapankah <pertanyaan kamu>',
      answers: [
  "Besok, kalau kamu tidak bangun kesiangan~",
  "Minggu depan, tandai kalendermu!",
  "Bulan depan, sabar dikit lagi yaa~",
  "Tahun depan, versi dirimu yang lebih siap yang akan menjemputnya",
  "Pas kamu lagi tidak kepikiran sama sekali~",
  "Sebentar lagi, lebih cepat dari dugaanmu!",
  "Masih lama, nikmati prosesnya dulu yaa",
  "Di hari yang paling tidak kamu sangka~"
],
      btnAgain: 'Tanya Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    kapankah: {
      title: 'Crystal Ball: When?',
      ask: '⏳ {question}\n\nKANA crystal ball answer: {answer} {mood}',
      usage: 'Ask something first~ Example: .kapankah <your question>',
      answers: [
  "Tomorrow, if you do not oversleep~",
  "Next week, mark your calendar!",
  "Next month, a little more patience~",
  "Next year, a more ready version of you will meet it",
  "When you least think about it~",
  "Very soon, faster than you expect!",
  "Still a while away, enjoy the process first",
  "On the day you least suspect~"
],
      btnAgain: 'Ask Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.kapankah besok cerah', expect: /bola kristal/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.kapankah?.answers ?? i18n.id.kapankah.answers
  if (!question) {
    const body = ctx.t('kapankah.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kapankah.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('kapankah.btnMenu'), id: '.menu fun' }],
      textFallback: body,
    })
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('kapankah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kapankah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('kapankah.btnAgain'), id: '.kapankah' },
      { text: ctx.t('kapankah.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
