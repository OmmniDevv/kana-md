import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kerangajaib',
  alias: ['kerang', 'magic'],
  category: 'fun',
  description: { id: 'Bertanya ke kerang ajaib dan dapat jawaban iseng', en: 'Ask the magic conch and get a playful answer' },
  usage: '.kerangajaib',
  example: '.kerangajaib',
  cooldown: 3,
}

export const i18n = {
  id: {
    kerangajaib: {
      title: 'Kerang Ajaib',
      body: '╭─❏ 🐚 「 *KERANG AJAIB BERKATA* 」\n┊ {item}\n┊\n┊ Begitulah kata kerang ajaib~\n╰━━━━━━━ {mood}',
      pool: [
  "Iya. Kerang menyetujui.",
  "Tidak. Bukan hari ini, manusia.",
  "Tanya lagi setelah ngemil.",
  "Kata kerang: mungkin, kalau kamu berani.",
  "Kerang diam saja, artinya pikir dua kali.",
  "Lanjutkan, tapi pelan-pelan dan dramatis.",
  "Cangkang-cangkang sejajar mendukungmu.",
  "Tidak. Kerang sudah pernah menonton episode itu.",
  "Percaya prosesnya, kata kerang.",
  "Jawabannya sedang berenang ke arahmu.",
  "Kerang menuntut tidur siang dulu.",
  "Iya banget, pakai taburan di atasnya."
],
      btnAgain: 'Tanya Lagi',
    },
  },
  en: {
    kerangajaib: {
      title: 'Magic Conch',
      body: '╭─❏ 🐚 「 *THE MAGIC CONCH SAYS* 」\n┊ {item}\n┊\n┊ The conch has spoken~\n╰━━━━━━━ {mood}',
      pool: [
  "Yes. The conch approves.",
  "No. Not today, human.",
  "Ask again after a snack.",
  "The conch says: maybe, if you dare.",
  "Silence from the conch means think twice.",
  "Proceed, but slowly and dramatically.",
  "The shells align in your favor.",
  "Nope. The conch has seen that episode before.",
  "Trust the process, says the conch.",
  "The answer is swimming toward you.",
  "The conch demands a nap first.",
  "Absolutely yes, with sprinkles on top."
],
      btnAgain: 'Ask Again',
    },
  },
}

export const test = { input: '.kerangajaib', expect: /kerang ajaib/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.kerangajaib?.pool ?? i18n.id.kerangajaib.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('kerangajaib.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kerangajaib.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('kerangajaib.btnAgain'), id: '.kerangajaib' },
    ],
    textFallback: body,
  })
}
