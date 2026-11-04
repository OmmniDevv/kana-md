import { ayat } from '../../src/data/religi.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ayat',
  alias: [],
  category: 'fun',
  description: { id: 'Kirim satu ayat Al-Quran pilihan beserta sumbernya', en: 'Send one selected Quran verse with its source' },
  usage: '.ayat',
  example: '.ayat',
  cooldown: 3,
}

export const i18n = {
  id: {
    ayat: {
      title: 'Ayat Pilihan',
      body: '📖 AYAT PILIHAN UNTUKMU\n\n"{text}"\n\n({source})\n\nSemoga menenangkan hati yaa~ {mood}',
      ayatBtn: '📖 Ayat Lain',
      haditsBtn: '🌙 Hadits',
      religiBtn: '🕌 Religi Harian',
      footer: 'Religi KANA',
    },
  },
  en: {
    ayat: {
      title: 'Selected Verse',
      body: '📖 A VERSE FOR YOU\n\n"{text}"\n\n({source})\n\nMay it soothe your heart~ {mood}',
      ayatBtn: '📖 Another Verse',
      haditsBtn: '🌙 Hadith',
      religiBtn: '🕌 Daily Religion',
      footer: 'KANA Religion',
    },
  },
}

export async function handler(ctx) {
  const item = ayat[Math.floor(Math.random() * ayat.length)]
  const body = ctx.t('ayat.body', { text: item.text, source: item.source, mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('ayat.title'),
    body,
    footer: ctx.t('ayat.footer'),
    replies: [
      { text: ctx.t('ayat.ayatBtn'), id: '.ayat' },
      { text: ctx.t('ayat.haditsBtn'), id: '.hadits' },
      { text: ctx.t('ayat.religiBtn'), id: '.religi' },
    ],
    textFallback: body,
  })
}
