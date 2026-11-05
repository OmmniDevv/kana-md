import { sendButtons } from '../../src/ui/buttons.js'

// Tebakumur: nama wajib, lalu bot menebak umur dengan satu bacaan umur
// acak dari daftar, dipilih murni Math.random seperti padanan
// Elaina-MD.
export const config = {
  name: 'tebakumur',
  alias: [],
  category: 'fun',
  description: { id: 'Tebak umur seseorang dari namanya, bacaan acak', en: 'Guess someone age from their name, a random reading' },
  usage: '.tebakumur <nama>',
  example: '.tebakumur Budi',
  cooldown: 5,
}

export const AGE_READINGS = [
  '12 Tahun, Masih Bocil',
  '11 Tahun, Bocilll',
  '10 Tahun, Aduh Masih Gaboleh Main Hp Dek',
  '16 Tahun, Remaja Lah Ya',
  '19 Tahun, Remajaa',
  '20 Tahun, Udah Nikah?',
  '21 Tahun, Udah Ketemu Calon Nih?',
  '14 Tahun',
  '15 Tahun',
  '17 Tahun',
  '18 Tahun, Udah Balig Nih',
]

export const i18n = {
  id: {
    tebakumur: {
      title: 'Tebak Umur',
      usage: '╭─❏ 🎂 「 *TEBAK UMUR* 」\n┊ Masukkan namamu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.tebakumur Budi*\n╰━━━━━━━',
      result: '╭─❏ 🎂 「 *TEBAK UMUR* 」\n┊ ɴᴀᴍᴀ ᴋᴀᴍᴜ: *{name}*\n┊ ᴜᴍᴜʀ: *{reading}*\n╰━━━━━━━',
      btnAgain: 'Tebak Lagi',
    },
  },
  en: {
    tebakumur: {
      title: 'Guess Age',
      usage: '╭─❏ 🎂 「 *GUESS AGE* 」\n┊ Enter your name first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.tebakumur Budi*\n╰━━━━━━━',
      result: '╭─❏ 🎂 「 *GUESS AGE* 」\n┊ ʏᴏᴜʀ ɴᴀᴍᴇ: *{name}*\n┊ ᴀɢᴇ: *{reading}*\n╰━━━━━━━',
      btnAgain: 'Guess Again',
    },
  },
}

export const test = { input: '.tebakumur Budi', expect: /tebak umur|guess age/i }

export function pickAgeReading(rng = Math.random) {
  return AGE_READINGS[Math.min(AGE_READINGS.length - 1, Math.floor(rng() * AGE_READINGS.length))]
}

export async function handler(ctx) {
  const name = (ctx.text || '').trim().slice(0, 60)
  if (!name) return ctx.reply(ctx.t('tebakumur.usage'))
  const body = ctx.t('tebakumur.result', { name, reading: pickAgeReading() })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tebakumur.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('tebakumur.btnAgain'), id: '.tebakumur' }],
    textFallback: body,
  })
}
