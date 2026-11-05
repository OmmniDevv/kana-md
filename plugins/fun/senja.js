import { sendButtons } from '../../src/ui/buttons.js'
import { SENJA, randomSenja } from '../../src/data/senja.js'

// Senja: kata senja dari dataset lokal besar src/data/senja.js
// (pengganti API neoxr Elaina yang butuh API key terdaftar). Pilihan
// acak memakai Math.random lewat randomSenja, bukan hash nama.
export const config = {
  name: 'senja',
  alias: ['sadboy'],
  category: 'fun',
  description: { id: 'Kirim satu kalimat puitis bertema senja dari dataset lokal KANA', en: 'Send one poetic evening themed line from the local KANA dataset' },
  usage: '.senja',
  example: '.senja',
  cooldown: 3,
}

export const i18n = {
  id: {
    senja: {
      title: 'Kalimat Senja',
      body: '╭─❏ 🌇 「 *KALIMAT SENJA UNTUKMU* 」\n┊ "{item}"\n┊ Langit sedang menutup hari dengan lembut~\n╰━━━━━━━ {mood}',
      btnAgain: 'Satu Lagi',
    },
  },
  en: {
    senja: {
      title: 'Evening Lines',
      body: '╭─❏ 🌇 「 *EVENING LINES FOR YOU* 」\n┊ "{item}"\n┊ The sky is closing the day gently~\n╰━━━━━━━ {mood}',
      btnAgain: 'One More',
    },
  },
}

export const test = { input: '.senja', expect: /senja|evening lines/i }

export { SENJA }

export async function handler(ctx, { rng = Math.random } = {}) {
  const item = randomSenja(rng, ctx.lang === 'en' ? 'en' : 'id')
  const body = ctx.t('senja.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('senja.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('senja.btnAgain'), id: '.senja' }],
    textFallback: body,
  })
}
