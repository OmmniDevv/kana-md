import { DARES } from '../../src/data/fun.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'dare',
  alias: ['dare2', 'dareq'],
  category: 'fun',
  description: { id: 'Ambil tantangan dare acak yang aman dan bisa dilakukan di chat', en: 'Draw a random safe dare that can be done in chat' },
  usage: '.dare',
  example: '.dare',
  cooldown: 3,
}

export const i18n = {
  id: {
    dare: {
      title: 'Dare',
      body: '╭─❏ 😈 「 *DARE* 」\n┊ Waktunya dare! Berani terima tantangan KANA?\n┊\n┊ 😈 {challenge}\n┊\n┊ Lakukan yaa, jangan cuma dibaca~\n╰━━━━━━━ {mood}',
      truthBtn: '💬 Ganti Truth Aja',
      dareBtn: '😈 Dare Lagi',
      footer: 'Truth or Dare KANA',
    },
  },
  en: {
    dare: {
      title: 'Dare',
      body: '╭─❏ 😈 「 *DARE* 」\n┊ Time for dare! Brave enough for KANA challenge?\n┊\n┊ 😈 {challenge}\n┊\n┊ Actually do it, do not just read it~\n╰━━━━━━━ {mood}',
      truthBtn: '💬 Switch to Truth',
      dareBtn: '😈 Another Dare',
      footer: 'KANA Truth or Dare',
    },
  },
}

export const test = { input: '.dare', expect: /dare/i }

export async function handler(ctx) {
  const item = DARES[Math.floor(Math.random() * DARES.length)]
  const body = ctx.t('dare.body', { challenge: item[ctx.lang] ?? item.id, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('dare.title'),
    body,
    footer: ctx.t('dare.footer'),
    replies: [
      { text: ctx.t('dare.truthBtn'), id: '.truth' },
      { text: ctx.t('dare.dareBtn'), id: '.dare' },
    ],
    textFallback: body,
  })
}
