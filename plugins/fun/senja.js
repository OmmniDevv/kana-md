import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'senja',
  alias: ['sadboy'],
  category: 'fun',
  description: { id: 'Kirim satu kalimat puitis bertema senja', en: 'Send one poetic evening themed line' },
  usage: '.senja',
  example: '.senja',
  cooldown: 3,
}

export const i18n = {
  id: {
    senja: {
      title: 'Kalimat Senja',
      body: '🌇 KALIMAT SENJA UNTUKMU\n\n"{item}"\n\nLangit sedang menutup hari dengan lembut~ {mood}',
      pool: [
  "Senja mengajarkan bahwa yang indah tidak harus selamanya untuk bisa berarti.",
  "Langit merona dulu sebelum pamit pada matahari.",
  "Senja adalah bisikan semesta: istirahatlah, besok lanjut lagi.",
  "Cahaya oranye membuat jalan biasa pun terasa seperti kenangan.",
  "Hari melambai perlahan, seperti teman lama di stasiun.",
  "Di antara siang dan malam ada jeda bernama syukur.",
  "Senja adalah bukti bahwa akhir pun bisa indah.",
  "Matahari tidak pernah terburu-buru tenggelam, tapi juga tidak pernah terlambat.",
  "Bayangan memanjang seiring cerita kita yang makin dalam.",
  "Setiap senja adalah latihan kecil untuk melepas dengan anggun.",
  "Cakrawala menyimpan rahasia yang tidak sanggup ditampung siang.",
  "Angin senja membawa aroma perjuangan yang sudah selesai."
],
      btnAgain: 'Satu Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    senja: {
      title: 'Evening Lines',
      body: '🌇 EVENING LINES FOR YOU\n\n"{item}"\n\nThe sky is closing the day gently~ {mood}',
      pool: [
  "Dusk teaches that beautiful things do not need to last forever to be meaningful.",
  "The sky blushes before it says goodbye to the sun.",
  "Evening is the universe whispering, rest now, continue tomorrow.",
  "Orange light makes even ordinary streets feel like memories.",
  "The day waves slowly, like an old friend at a station.",
  "Between day and night there is a pause called gratitude.",
  "Dusk is proof that endings can be beautiful too.",
  "The sun never hurries to set, yet it is never late.",
  "Shadows grow longer as our stories grow deeper.",
  "Every evening is a small rehearsal for letting go gracefully.",
  "The horizon keeps secrets the day could not hold.",
  "Evening breeze carries the scent of finished struggles."
],
      btnAgain: 'One More',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.senja', expect: /senja/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.senja?.pool ?? i18n.id.senja.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('senja.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('senja.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('senja.btnAgain'), id: '.senja' },
    ],
    textFallback: body,
  })
}
