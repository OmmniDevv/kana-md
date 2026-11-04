const ANSWERS = [
  { id: 'Di tempat yang paling tidak kamu duga, coba cek lagi pelan-pelan.', en: 'In the place you least expect, check again slowly.' },
  { id: 'Dekat kok, cuma lagi sembunyi dari kamu sebentar.', en: 'It is near, just hiding from you for a moment.' },
  { id: 'Di mana terakhir kamu ingat, klasik tapi hampir selalu benar.', en: 'Where you last remember it, classic but almost always true.' },
  { id: 'Di luar sana, menunggumu berani melangkah keluar.', en: 'Out there, waiting for you to dare to step outside.' },
  { id: 'Di hati orang yang tepat, ciee.', en: 'In the right person heart, aww.' },
  { id: 'Di ujung pencarianmu sendiri, jawabannya selalu di akhir.', en: 'At the end of your own search, the answer is always last.' },
]

export const config = {
  name: 'dimana',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan dimana, versi santai KANA', en: 'Where-question answering machine, KANA relaxed version' },
  usage: '.dimana <pertanyaan>',
  example: '.dimana jodohku berada',
  cooldown: 3,
}

export const i18n = {
  id: { dimana: { hint: 'Tanya yang lengkap yaa~ Contoh: .dimana jodohku berada', body: '📍 {answer} {mood}' } },
  en: { dimana: { hint: 'Ask a full question please~ Example: .dimana is my soulmate', body: '📍 {answer} {mood}' } },
}

export const test = { input: '.dimana', expect: /tanya|ask/i }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('dimana.hint'))
  const item = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
  return ctx.reply(ctx.t('dimana.body', { answer: ctx.lang === 'en' ? item.en : item.id, mood: ctx.say('mikir') }))
}
