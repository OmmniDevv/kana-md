import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'akankah',
  alias: [],
  category: 'fun',
  description: { id: 'Tanya akankah sesuatu terjadi, KANA jawab ramalan iseng', en: 'Ask if something will happen, KANA answers a playful fortune' },
  usage: '.akankah <pertanyaan>',
  example: '.akankah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    akankah: {
      title: 'Bola Kristal: Akankah?',
      ask: '🌟 {question}\n\nJawaban bola kristal KANA: {answer} {mood}',
      usage: 'Tanya dulu dong~ Contoh: .akankah <pertanyaan kamu>',
      answers: [
  "Akan terjadi, tinggal tunggu waktunya~ 🌟",
  "Akan, tapi tidak persis seperti yang kamu bayangkan",
  "Sepertinya akan, tanda-tandanya bagus!",
  "Belum akan terjadi dalam waktu dekat yaa",
  "Tidak akan, dan itu mungkin yang terbaik buatmu",
  "Akan terjadi kalau kamu berani mengambil langkah pertama~",
  "Hmm, bola kristalku bergetar: akan, tapi lama",
  "Pasti akan! Semesta lagi memihakmu~"
],
      btnAgain: 'Tanya Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    akankah: {
      title: 'Crystal Ball: Will It Happen?',
      ask: '🌟 {question}\n\nKANA crystal ball answer: {answer} {mood}',
      usage: 'Ask something first~ Example: .akankah <your question>',
      answers: [
  "It will happen, just wait for the time~ 🌟",
  "It will, but not exactly as you imagine",
  "Seems like it will, the signs are good!",
  "Not in the near future yet",
  "It will not, and that may be best for you",
  "It will happen if you dare to take the first step~",
  "Hmm, my crystal ball trembles: it will, but slowly",
  "It surely will! The universe is on your side~"
],
      btnAgain: 'Ask Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.akankah besok cerah', expect: /bola kristal/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.akankah?.answers ?? i18n.id.akankah.answers
  if (!question) {
    const body = ctx.t('akankah.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('akankah.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('akankah.btnMenu'), id: '.menu fun' }],
      textFallback: body,
    })
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('akankah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('akankah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('akankah.btnAgain'), id: '.akankah' },
      { text: ctx.t('akankah.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
