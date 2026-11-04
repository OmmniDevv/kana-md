import { TRUTHS } from '../../src/data/fun.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'truth',
  alias: [],
  category: 'fun',
  description: { id: 'Ambil pertanyaan truth acak untuk permainan truth or dare', en: 'Draw a random truth question for truth or dare' },
  usage: '.truth',
  example: '.truth',
  cooldown: 3,
}

export const i18n = {
  id: {
    truth: {
      title: 'Truth',
      body: 'Waktunya TRUTH! Jujur-jujuran yuk~\n\n❓ {question}\n\nJawab sejujurnya yaa, tidak boleh ngeles~ {mood}',
      dareBtn: '😈 Berani Dare?',
      truthBtn: '💬 Truth Lagi',
      footer: 'Truth or Dare KANA',
    },
  },
  en: {
    truth: {
      title: 'Truth',
      body: 'Time for TRUTH!\n\n❓ {question}\n\nAnswer honestly, no dodging~ {mood}',
      dareBtn: '😈 Dare Instead?',
      truthBtn: '💬 Another Truth',
      footer: 'KANA Truth or Dare',
    },
  },
}

export async function handler(ctx) {
  const item = TRUTHS[Math.floor(Math.random() * TRUTHS.length)]
  const body = ctx.t('truth.body', { question: item[ctx.lang] ?? item.id, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('truth.title'),
    body,
    footer: ctx.t('truth.footer'),
    replies: [
      { text: ctx.t('truth.dareBtn'), id: '.dare' },
      { text: ctx.t('truth.truthBtn'), id: '.truth' },
    ],
    textFallback: body,
  })
}
