import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'bola8',
  alias: ['8ball'],
  category: 'fun',
  description: { id: 'Tanya bola ajaib 8 untuk jawaban acak seru', en: 'Ask the magic 8 ball for a fun random answer' },
  usage: '.bola8 <pertanyaan>',
  example: '.bola8 apakah hari ini beruntung?',
  cooldown: 3,
}

export const i18n = {
  id: {
    bola8: {
      usage: 'Tulis pertanyaannya dulu yaa, contoh: .bola8 apakah hari ini beruntung?~ 🔮',
      title: 'Bola Ajaib KANA 🔮',
      answer: 'Pertanyaan: {question}\nJawaban bola ajaib: {answer} ✨\n\n{disclaimer}',
      disclaimer: 'Catatan kecil: ini cuma hiburan yaa, jangan dijadiin keputusan hidup~ (≧▽≦)',
      btnAgain: 'Tanya Lagi',
      btnMenu: 'Menu Fun',
      answers: [
        'Iyaa, pasti itu~ ✨',
        'Kayaknya sih iya, bintang-bintang setuju~ 🌟',
        'Hmm, tanda-tandanya bagus, lanjut aja~ 💖',
        'Bola ajaib bilang: gas, jangan ragu~ (•̀ᴗ•́)و',
        'Bisa jadi... tapi tanya hatimu juga ya~ 🌸',
        'Kaboel, eh maksudnya kabur jawabannya, coba tanya lagi nanti~ 💭',
        'Sstt, bola ajaib lagi ngantuk, jawabannya belum jelas~ 😴',
        'Kayaknya belum waktunya deh~ ⏳',
        'Hmm, peluangnya tipis nih... (╥﹏╥)',
        'Bola ajaib geleng-geleng: nggak dulu yaa~ 🙈',
        'Jangan deh, kata bola ajaib mending cari jalan lain~ ✨',
        'Ehh, jawabannya: ntar dulu, pikir lagi baik-baik~ 🤔',
      ],
    },
  },
  en: {
    bola8: {
      usage: 'Write your question first, example: .bola8 will today be lucky?~ 🔮',
      title: 'KANA Magic Ball 🔮',
      answer: 'Question: {question}\nMagic ball says: {answer} ✨\n\n{disclaimer}',
      disclaimer: 'Small note: this is just for fun, do not make life decisions from it~ (≧▽≦)',
      btnAgain: 'Ask Again',
      btnMenu: 'Fun Menu',
      answers: [
        'Yes, definitely~ ✨',
        'Looks like yes, the stars agree~ 🌟',
        'Hmm, signs are good, go for it~ 💖',
        'The magic ball says: go, do not hesitate~ (•̀ᴗ•́)و',
        'Could be... but ask your heart too~ 🌸',
        'The answer is hiding in fog, ask again later~ 💭',
        'Shh, the ball is sleepy, the answer is unclear~ 😴',
        'Seems like not the right time yet~ ⏳',
        'Hmm, the chances look thin... (╥﹏╥)',
        'The ball shakes its head: not this time~ 🙈',
        'Better not, the ball suggests another path~ ✨',
        'Eh, the answer is: wait, think it over first~ 🤔',
      ],
    },
  },
}

export const test = { input: '.bola8 apakah hari ini cerah?', expect: /bola ajaib/i }

export async function handler(ctx) {
  const question = ctx.text.trim()
  if (!question) return ctx.reply(ctx.t('bola8.usage'))
  const pool = i18n[ctx.lang]?.bola8?.answers ?? i18n.id.bola8.answers
  const answer = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('bola8.answer', { question, answer, disclaimer: ctx.t('bola8.disclaimer') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('bola8.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('bola8.btnAgain'), id: `.bola8 ${question.slice(0, 60)}` },
      { text: ctx.t('bola8.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
