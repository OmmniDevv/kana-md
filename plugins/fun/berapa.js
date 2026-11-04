export const config = {
  name: 'berapa',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan berapa dengan angka acak yang yakin', en: 'How-many question machine with a confident random number' },
  usage: '.berapa <pertanyaan>',
  example: '.berapa kali aku harus mencoba',
  cooldown: 3,
}

export const i18n = {
  id: { berapa: { hint: 'Tanya yang lengkap yaa~ Contoh: .berapa kali aku harus mencoba', body: '🔢 Jawabannya: *{number}*.\nPercaya saja dulu, semesta jarang salah hitung. {mood}' } },
  en: { berapa: { hint: 'Ask a full question please~ Example: .berapa how many times should I try', body: '🔢 The answer: *{number}*.\nJust trust it, the universe rarely miscounts. {mood}' } },
}

export const test = { input: '.berapa', expect: /tanya|ask/i }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('berapa.hint'))
  const number = Math.floor(Math.random() * 100) + 1
  return ctx.reply(ctx.t('berapa.body', { number, mood: ctx.say('mikir') }))
}
