import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'quotebijak',
  alias: ['bijak', 'katabijak'],
  category: 'fun',
  description: { id: 'Kirim satu kata bijak penyemangat hari', en: 'Send one wise quote to brighten your day' },
  usage: '.quotebijak',
  example: '.quotebijak',
  cooldown: 3,
}

export const i18n = {
  id: {
    quotebijak: {
      title: 'Kata Bijak',
      body: '🌿 KATA BIJAK UNTUKMU\n\n"{item}"\n\nSemoga nempel di hati kamu hari ini yaa~ {mood}',
      pool: [
  "Langkah lambat tetaplah langkah, asal tidak berbalik arah.",
  "Jangan bandingkan bab pertamamu dengan bab kedua puluh orang lain.",
  "Hati yang sabar melihat peluang yang tidak dilihat hati yang marah.",
  "Kebaikan adalah bahasa yang dimengerti bahkan oleh hati yang lelah.",
  "Kegagalan hanyalah data, bukan vonis akhir.",
  "Mimpi besar dimulai dari satu keputusan kecil yang berani.",
  "Disiplin adalah memilih yang paling kamu inginkan di atas yang kamu inginkan sekarang.",
  "Waktu terbaik memulai adalah kemarin, waktu terbaik kedua adalah hari ini.",
  "Hati yang bersyukur mengubah sedikit menjadi cukup.",
  "Sibukkan dirimu memperbaiki diri sampai tidak sempat iri pada orang lain.",
  "Hujan mengajarkan bunga cara bersabar.",
  "Masa depanmu dibangun oleh yang kamu lakukan hari ini, bukan besok.",
  "Mendengarkan adalah bentuk hormat yang paling sunyi.",
  "Keberanian bukan tidak punya rasa takut, tapi tetap berjalan bersamanya.",
  "Permintaan maaf yang tulus bisa membangun lagi jembatan yang runtuh.",
  "Kebiasaan kecil yang diulang tiap hari mengalahkan motivasi besar yang cepat padam."
],
      btnAgain: 'Lagi Dong',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    quotebijak: {
      title: 'Wise Quotes',
      body: '🌿 A WISE WORD FOR YOU\n\n"{item}"\n\nMay it stick with you today~ {mood}',
      pool: [
  "A slow step is still a step forward, as long as you do not turn back.",
  "Do not compare your first chapter with someone else chapter twenty.",
  "A patient heart sees chances that an angry heart misses.",
  "Kindness is a language even tired hearts understand.",
  "Failure is just data, not a final verdict.",
  "Big dreams start from one small brave decision.",
  "Discipline is choosing what you want most over what you want now.",
  "The best time to start was yesterday, the second best time is today.",
  "A grateful heart turns little into enough.",
  "Be so busy improving yourself that you have no time to envy others.",
  "Rain teaches flowers how to be patient.",
  "Your future is built by what you do today, not tomorrow.",
  "Listening is a quiet form of respect.",
  "Courage is not the absence of fear, it is walking with it.",
  "A sincere apology can rebuild a broken bridge.",
  "Small habits repeated daily beat big motivation that fades fast."
],
      btnAgain: 'Another One',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.quotebijak', expect: /kata bijak/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.quotebijak?.pool ?? i18n.id.quotebijak.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('quotebijak.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('quotebijak.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('quotebijak.btnAgain'), id: '.quotebijak' },
    ],
    textFallback: body,
  })
}
