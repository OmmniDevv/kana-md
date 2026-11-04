import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'bacot',
  alias: ['roasting'],
  category: 'fun',
  description: { id: 'Kirim satu bacot ringan buat lucu-lucuan', en: 'Send one light playful roast line, all jokes' },
  usage: '.bacot',
  example: '.bacot',
  cooldown: 3,
}

export const i18n = {
  id: {
    bacot: {
      title: 'Bacot Ringan',
      body: '╭─❏ 🔥 「 *BACOT RINGAN* 」\n┊ "{item}"\n╰━━━━━━━\nSantai, ini cuma bercanda yaa~ {mood}',
      pool: [
  "Sinyal wifimu lebih kuat dari sinyal motivasimu.",
  "Kamu buka kulkas berharap ada makanan baru yang muncul seperti update game.",
  "Jam alarmmu sudah menyerah sama kamu sejak bulan lalu.",
  "Kamu bilang lima menit lagi seolah itu kontrak resmi.",
  "Rekening tabunganmu lagi LDR sama uang.",
  "Isi kulkas kamu pelajari seperti materi ujian.",
  "Baterai HP-mu lebih awet dari resolusi tahun barumu.",
  "Kamu menyebutnya multitasking, tugasmu menyebutnya ditelantarkan.",
  "Masakanmu bisa jadi level bos di game survival.",
  "Kamu sabuk hitam dalam hal menunda, dan delapan.",
  "Playlistmu menyala, produktivitasmu masih buffering.",
  "Deadline kamu anggap saran dari orang asing.",
  "Kasurmu kangen kamu padahal kamu lagi rebahan di atasnya.",
  "Kamu bukan malas, kamu lagi mode hemat energi permanen."
],
      btnAgain: 'Bacot Lagi',
    },
  },
  en: {
    bacot: {
      title: 'Light Roast',
      body: '╭─❏ 🔥 「 *LIGHT ROAST* 」\n┊ "{item}"\n╰━━━━━━━\nNo hard feelings, it is all jokes~ {mood}',
      pool: [
  "Your wifi signal is stronger than your motivation signal.",
  "You open the fridge hoping new food spawned like a game update.",
  "Your alarm clock has given up on you since last month.",
  "You say five more minutes like it is a legally binding contract.",
  "Your savings account is in a long distance relationship with money.",
  "You study the fridge contents like it is an exam subject.",
  "Your phone battery lasts longer than your new year resolutions.",
  "You call it multitasking, your tasks call it abandonment.",
  "Your cooking could be used as a boss level in a survival game.",
  "You have a black belt in procrastination, eighth dan.",
  "Your playlist is fire, your productivity is still buffering.",
  "You treat deadlines like suggestions from a stranger.",
  "Your bed misses you even when you are lying on it.",
  "You are not lazy, you are in permanent energy saving mode."
],
      btnAgain: 'Roast Me Again',
    },
  },
}

export const test = { input: '.bacot', expect: /bacot/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.bacot?.pool ?? i18n.id.bacot.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('bacot.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('bacot.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('bacot.btnAgain'), id: '.bacot' },
    ],
    textFallback: body,
  })
}
