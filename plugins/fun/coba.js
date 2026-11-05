import { sendButtons } from '../../src/ui/buttons.js'

// Coba: user menulis pertanyaan atau tebakan, bot mengulang
// pertanyaannya lalu menjawab dengan satu tebakan acak dari daftar
// khusus coba, seperti padanan Elaina-MD.
export const config = {
  name: 'coba',
  alias: ['try'],
  category: 'fun',
  description: { id: 'Coba tanyakan atau tebak sesuatu, KANA menebak balik', en: 'Ask or guess something, KANA guesses back' },
  usage: '.coba <pertanyaan>',
  example: '.coba tebak apa yang aku pikirkan',
  cooldown: 5,
}

export const COBA_ANSWERS = [
  'Hmm, aku coba ya... Kamu lagi mikirin makanan!',
  'Aku tebak... Kamu lagi gabut berat!',
  'Coba ya... Kayaknya kamu lagi senang nih!',
  'Hmm, aku rasa kamu lagi bingung.',
  'Aku coba nebak... Kamu lagi kangen seseorang?',
  'Kayaknya kamu lagi santai deh.',
  'Aku tebak kamu lagi scroll HP terus dari tadi.',
  'Hmm, pasti lagi bosan ya?',
  'Coba ditebak... Kamu lagi pengen jalan-jalan!',
  'Aku rasa kamu lagi butuh hiburan.',
  'Hmm, kayaknya kamu lagi happy banget!',
  'Aku coba... Kamu pasti lagi penasaran!',
  'Tebakan aku: kamu lagi rebahan sambil main HP.',
  'Hmm, kamu mungkin lagi mikirin seseorang yang spesial.',
  'Aku coba: kamu lagi mau curhat ya?',
  'Kayaknya kamu lagi pengen main game!',
  'Hmm, aku tebak kamu lagi dengerin musik.',
  'Coba aku tebak... Kamu lagi di kamar!',
  'Aku rasa kamu lagi menunggu sesuatu.',
  'Hmm, tebakan aku: kamu butuh teman ngobrol!',
]

export const i18n = {
  id: {
    coba: {
      title: 'Coba Tebak',
      usage: '╭─❏ 🎯 「 *COBA* 」\n┊ Tulis pertanyaannya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.coba tebak apa yang aku pikirkan*\n╰━━━━━━━',
      result: '╭─❏ 🎯 「 *COBA TEBAK* 」\n┊ ᴘᴇʀᴛᴀɴʏᴀᴀɴ: *{question}*\n┊ ᴛᴇʙᴀᴋᴀɴ ᴋᴀɴᴀ: *{answer}*\n╰━━━━━━━',
      btnAgain: 'Coba Lagi',
    },
  },
  en: {
    coba: {
      title: 'Try a Guess',
      usage: '╭─❏ 🎯 「 *TRY* 」\n┊ Write your question first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.coba guess what I am thinking*\n╰━━━━━━━',
      result: '╭─❏ 🎯 「 *TRY GUESS* 」\n┊ ǫᴜᴇꜱᴛɪᴏɴ: *{question}*\n┊ ᴋᴀɴᴀ ɢᴜᴇꜱꜱ: *{answer}*\n╰━━━━━━━',
      btnAgain: 'Try Again',
    },
  },
}

export const test = { input: '.coba tebak apa yang aku pikirkan', expect: /coba tebak|try guess/i }

export function pickCobaAnswer(rng = Math.random) {
  return COBA_ANSWERS[Math.min(COBA_ANSWERS.length - 1, Math.floor(rng() * COBA_ANSWERS.length))]
}

export async function handler(ctx) {
  const question = (ctx.text || '').trim().slice(0, 300)
  if (!question) return ctx.reply(ctx.t('coba.usage'))
  const body = ctx.t('coba.result', { question, answer: pickCobaAnswer() })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('coba.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('coba.btnAgain'), id: '.coba' }],
    textFallback: body,
  })
}
