import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'motivasi',
  alias: [],
  category: 'fun',
  description: { id: 'Dapat kutipan motivasi original dari KANA', en: 'Get an original motivational quote from KANA' },
  usage: '.motivasi',
  example: '.motivasi',
  cooldown: 3,
}

export const i18n = {
  id: {
    motivasi: {
      title: 'Motivasi dari KANA 💪',
      body: '{quote}\n\n{mood}',
      btnAgain: 'Motivasi Lagi',
      btnPantun: 'Pantun',
      btnMenu: 'Menu Fun',
      quotes: [
        'Langkah kecil yang kamu ulang tiap hari bakal ngalahin lompatan besar yang cuma direncanain.',
        'Nggak harus sempurna hari ini, cukup lebih baik dari kemarin sedikit aja.',
        'Istirahat itu bagian dari perjalanan, bukan tanda kamu nyerah.',
        'Orang hebat juga pernah bingung, bedanya mereka tetap jalan sambil bingung.',
        'Fokus ke satu hal sampai selesai lebih berharga dari sepuluh hal yang setengah jadi.',
        'Kegagalan itu data, bukan label. Baca datanya, perbaiki jalannya.',
        'Mulai aja dulu dari yang paling gampang, momentum bakal nyusul sendiri.',
        'Kamu nggak telat, kamu cuma lagi di bab yang berbeda dari orang lain.',
        'Disiplin adalah jembatan antara niat baik dan hasil nyata.',
        'Kalau capek, pelankan langkahmu, jangan arahmu.',
        'Bertanya itu bukan lemah, itu cara orang pintar menghemat waktu.',
        'Versi terbaikmu dibangun dari hari-hari biasa yang kamu jalani dengan serius.',
        'Jangan bandingkan prosesmu dengan panggung orang lain.',
        'Satu halaman tiap hari tetap bikin bukumu selesai suatu hari nanti.',
        'Keberanian itu bukan nggak takut, tapi tetap melangkah sambil takut.',
        'Bibit yang dirawat sabar bakal jadi pohon yang meneduhkan banyak orang.',
      ],
    },
  },
  en: {
    motivasi: {
      title: 'Motivation from KANA 💪',
      body: '{quote}\n\n{mood}',
      btnAgain: 'More Motivation',
      btnPantun: 'Pantun',
      btnMenu: 'Fun Menu',
      quotes: [
        'Small steps repeated daily will beat a giant leap that is only ever planned.',
        'You do not have to be perfect today, just a little better than yesterday.',
        'Resting is part of the journey, not a sign that you gave up.',
        'Great people were confused too, they just kept walking while confused.',
        'Finishing one thing is worth more than ten things left halfway.',
        'Failure is data, not a label. Read the data, fix the path.',
        'Start with the easiest part, momentum will follow on its own.',
        'You are not late, you are just in a different chapter than everyone else.',
        'Discipline is the bridge between good intentions and real results.',
        'When you are tired, slow your steps, not your direction.',
        'Asking questions is not weakness, it is how smart people save time.',
        'Your best version is built from ordinary days taken seriously.',
        'Do not compare your process with someone else stage.',
        'One page a day still finishes your book someday.',
        'Courage is not the absence of fear, it is walking while afraid.',
        'A seed cared for patiently becomes a tree that shades many people.',
      ],
    },
  },
}

export const test = { input: '.motivasi', expect: /motivasi/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.motivasi?.quotes ?? i18n.id.motivasi.quotes
  const quote = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('motivasi.body', { quote, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('motivasi.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('motivasi.btnAgain'), id: '.motivasi' },
      { text: ctx.t('motivasi.btnPantun'), id: '.pantun' },
    ],
    textFallback: body,
  })
}
