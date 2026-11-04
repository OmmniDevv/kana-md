import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'apakah',
  alias: ['haruskah'],
  category: 'fun',
  description: { id: 'Tanya pertanyaan ya atau tidak, KANA jawab iseng dari bola kristal', en: 'Ask a yes or no question, KANA answers playfully from the crystal ball' },
  usage: '.apakah <pertanyaan>',
  example: '.apakah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    apakah: {
      title: 'Bola Kristal: Apakah?',
      ask: '🔮 {question}\n\nJawaban bola kristal KANA: {answer} {mood}',
      usage: 'Tanya dulu dong~ Contoh: .apakah <pertanyaan kamu>',
      answers: [
  "Iya, jelas iya~ ✨",
  "Iya, kemungkinan besar iya!",
  "Hmm, tanda-tandanya mengarah ke iya~",
  "Bisa jadi iya, tapi pelan-pelan yaa",
  "Kayaknya tidak deh...",
  "Tidak, lebih baik jangan berharap dulu yaa",
  "Masih abu-abu, coba tanya lagi nanti~",
  "Iya, asal kamu yakin dan usaha juga!"
],
      btnAgain: 'Tanya Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    apakah: {
      title: 'Crystal Ball: Will It?',
      ask: '🔮 {question}\n\nKANA crystal ball answer: {answer} {mood}',
      usage: 'Ask something first~ Example: .apakah <your question>',
      answers: [
  "Yes, definitely yes~ ✨",
  "Yes, most likely yes!",
  "Hmm, the signs point to yes~",
  "Could be yes, but take it slowly",
  "Seems like no...",
  "No, better not hope for it yet",
  "Still cloudy, ask again later~",
  "Yes, if you believe and also make an effort!"
],
      btnAgain: 'Ask Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.apakah besok cerah', expect: /bola kristal/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.apakah?.answers ?? i18n.id.apakah.answers
  if (!question) {
    const body = ctx.t('apakah.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('apakah.title'),
      body,
      footer: ctx.t('menu.footer'),
      textFallback: body,
    })
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('apakah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('apakah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('apakah.btnAgain'), id: '.apakah' },
    ],
    textFallback: body,
  })
}
