import { sendButtons } from '../../src/ui/buttons.js'
import { JOKES } from '../../src/data/fun.js'

// Lelucon original dari dataset fun (src/data/fun.js). Ditambahkan koordinator
// saat integrasi karena dataset JOKES belum punya perintah yang menyajikan.
export const config = {
  name: 'joke',
  alias: ['lucu', 'lelucon', 'candaan'],
  category: 'fun',
  description: { id: 'Lelucon acak original dari KANA', en: 'A random original joke from KANA' },
  usage: '.joke',
  example: '.joke',
  cooldown: 3,
}

export const i18n = {
  id: {
    joke: {
      title: '╭─❏ 😂 「 *LELUCON KANA* 」',
      btnAgain: '😂 Lagi Dong',
      btnTruth: '🫣 Truth',
      btnDare: '😈 Dare',
    },
  },
  en: {
    joke: {
      title: '╭─❏ 😂 「 *KANA JOKE* 」',
      btnAgain: '😂 One More',
      btnTruth: '🫣 Truth',
      btnDare: '😈 Dare',
    },
  },
}

export function pickJoke(lang, rng = Math.random) {
  const item = JOKES[Math.floor(rng() * JOKES.length)]
  return item[lang] ?? item.id
}

export const test = { input: '.joke', expect: /lelucon|joke/i }

export async function handler(ctx) {
  const body = `${ctx.t('joke.title')}\n┊ ${pickJoke(ctx.lang)}\n╰━━━━━━━ ${ctx.say('senang')}`
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('joke.btnAgain'), id: '.joke' },
      { text: ctx.t('joke.btnTruth'), id: '.truth' },
      { text: ctx.t('joke.btnDare'), id: '.dare' },
    ],
    textFallback: body,
  })
}
