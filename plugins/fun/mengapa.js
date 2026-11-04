const ANSWERS = [
  { id: 'Karena hidup memang suka bercanda di saat yang serius.', en: 'Because life likes to joke around at serious moments.' },
  { id: 'Karena semua ada waktunya, yang ini memang belum waktumu.', en: 'Because everything has its time, and this one is not yours yet.' },
  { id: 'Karena alam semesta lagi pengen kamu belajar sesuatu dulu.', en: 'Because the universe wants you to learn something first.' },
  { id: 'Karena pilihan kecil kemarin membawa ke hasil hari ini.', en: 'Because small choices yesterday led to today results.' },
  { id: 'Karena tidak semua pertanyaan butuh jawaban sekarang.', en: 'Because not every question needs an answer right now.' },
  { id: 'Karena takdir punya selera humor yang aneh, aku juga bingung.', en: 'Because fate has a weird sense of humor, I am confused too.' },
]

export const config = {
  name: 'mengapa',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan mengapa, versi santai KANA', en: 'Why-question answering machine, KANA relaxed version' },
  usage: '.mengapa <pertanyaan>',
  example: '.mengapa dia tidak membalas chatku',
  cooldown: 3,
}

export const i18n = {
  id: { mengapa: { hint: '╭─❏ 🌌 「 *MENGAPA* 」\n┊ Tanya yang lengkap yaa~\n┊ Contoh: *.mengapa dia tidak membalas chatku*\n╰━━━━━━━', body: '╭─❏ 🌌 「 *JAWABAN KANA* 」\n┊ {answer}\n╰━━━━━━━ {mood}' } },
  en: { mengapa: { hint: '╭─❏ 🌌 「 *WHY* 」\n┊ Ask a full question please~\n┊ Example: *.mengapa did they not reply*\n╰━━━━━━━', body: '╭─❏ 🌌 「 *KANA ANSWER* 」\n┊ {answer}\n╰━━━━━━━ {mood}' } },
}

export const test = { input: '.mengapa', expect: /tanya|ask/i }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('mengapa.hint'))
  const item = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
  return ctx.reply(ctx.t('mengapa.body', { answer: ctx.lang === 'en' ? item.en : item.id, mood: ctx.say('mikir') }))
}
