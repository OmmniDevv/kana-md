import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kapankah',
  alias: ['kapan'],
  category: 'fun',
  description: { id: 'Tanya kapan sesuatu terjadi, KANA jawab tebakan waktu iseng', en: 'Ask when something will happen, KANA answers a playful time guess' },
  usage: '.kapankah <pertanyaan>',
  example: '.kapankah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    kapankah: {
      title: 'Bola Kristal: Kapankah?',
      ask: '╭─❏ ⏳ 「 *BOLA KRISTAL: KAPANKAH?* 」\n┊ ᴘᴇʀᴛᴀɴʏᴀᴀɴ: {question}\n┊ ᴊᴀᴡᴀʙᴀɴ: *{answer}*\n╰━━━━━━━ {mood}',
      usage: '╭─❏ ⏳ 「 *BOLA KRISTAL: KAPANKAH?* 」\n┊ Tanya dulu dong~\n┊ Contoh: *.kapankah <pertanyaan kamu>*\n╰━━━━━━━',
      answers: [
  "Besok, kalau kamu tidak bangun kesiangan~",
  "Minggu depan, tandai kalendermu!",
  "Bulan depan, sabar dikit lagi yaa~",
  "Tahun depan, versi dirimu yang lebih siap yang akan menjemputnya",
  "Pas kamu lagi tidak kepikiran sama sekali~",
  "Sebentar lagi, lebih cepat dari dugaanmu!",
  "Masih lama, nikmati prosesnya dulu yaa",
  "Di hari yang paling tidak kamu sangka~"
],
      btnAgain: 'Tanya Lagi',
    },
  },
  en: {
    kapankah: {
      title: 'Crystal Ball: When?',
      ask: '╭─❏ ⏳ 「 *CRYSTAL BALL: WHEN?* 」\n┊ ǫᴜᴇꜱᴛɪᴏɴ: {question}\n┊ ᴀɴꜱᴡᴇʀ: *{answer}*\n╰━━━━━━━ {mood}',
      usage: '╭─❏ ⏳ 「 *CRYSTAL BALL: WHEN?* 」\n┊ Ask something first~\n┊ Example: *.kapankah <your question>*\n╰━━━━━━━',
      answers: [
  "Tomorrow, if you do not oversleep~",
  "Next week, mark your calendar!",
  "Next month, a little more patience~",
  "Next year, a more ready version of you will meet it",
  "When you least think about it~",
  "Very soon, faster than you expect!",
  "Still a while away, enjoy the process first",
  "On the day you least suspect~"
],
      btnAgain: 'Ask Again',
    },
  },
}

export const test = { input: '.kapankah besok cerah', expect: /bola kristal/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.kapankah?.answers ?? i18n.id.kapankah.answers
  if (!question) {
    return ctx.reply(ctx.t('kapankah.usage'))
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('kapankah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kapankah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('kapankah.btnAgain'), id: '.kapankah' },
    ],
    textFallback: body,
  })
}
