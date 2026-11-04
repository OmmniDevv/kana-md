import { hadits } from '../../src/data/religi.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'hadits',
  alias: ['hadis'],
  category: 'fun',
  description: { id: 'Kirim satu hadits pilihan beserta sumbernya', en: 'Send one selected hadith with its source' },
  usage: '.hadits',
  example: '.hadits',
  cooldown: 3,
}

export const i18n = {
  id: {
    hadits: {
      title: 'Hadits Pilihan',
      body: '╭─❏ 🌙 「 *HADITS PILIHAN* 」\n┊ "{text}"\n┊\n┊ ꜱᴜᴍʙᴇʀ: *({source})*\n┊\n┊ Semoga jadi pengingat yang baik yaa~\n╰━━━━━━━ {mood}',
      haditsBtn: '🌙 Hadits Lain',
      ayatBtn: '📖 Ayat',
      religiBtn: '🕌 Religi Harian',
      footer: 'Religi KANA',
    },
  },
  en: {
    hadits: {
      title: 'Selected Hadith',
      body: '╭─❏ 🌙 「 *A HADITH FOR YOU* 」\n┊ "{text}"\n┊\n┊ ꜱᴏᴜʀᴄᴇ: *({source})*\n┊\n┊ May it be a gentle reminder~\n╰━━━━━━━ {mood}',
      haditsBtn: '🌙 Another Hadith',
      ayatBtn: '📖 Verse',
      religiBtn: '🕌 Daily Religion',
      footer: 'KANA Religion',
    },
  },
}

export const test = { input: '.hadits', expect: /hadits pilihan/i }

export async function handler(ctx) {
  const item = hadits[Math.floor(Math.random() * hadits.length)]
  const body = ctx.t('hadits.body', { text: item.text, source: item.source, mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('hadits.title'),
    body,
    footer: ctx.t('hadits.footer'),
    replies: [
      { text: ctx.t('hadits.haditsBtn'), id: '.hadits' },
      { text: ctx.t('hadits.ayatBtn'), id: '.ayat' },
      { text: ctx.t('hadits.religiBtn'), id: '.religi' },
    ],
    textFallback: body,
  })
}
