const ANSWERS = [
  { id: 'Caranya gampang, mulai aja dulu, urusan bisa dipikir sambil jalan.', en: 'The way is easy, just start first, skill comes along the way.' },
  { id: 'Dengan niat, doa, dan sedikit keberuntungan tentunya.', en: 'With intention, prayer, and a little bit of luck of course.' },
  { id: 'Pelan-pelan saja, yang penting konsisten tiap hari.', en: 'Slowly but surely, what matters is daily consistency.' },
  { id: 'Tanya orang yang sudah pernah, lalu tiru yang cocok buatmu.', en: 'Ask someone who has done it, then copy what fits you.' },
  { id: 'Pakai cara paling sederhana dulu, jangan langsung yang ribet.', en: 'Use the simplest way first, skip the complicated one for now.' },
  { id: 'Dengan berani gagal sekali, biar tahu rasanya dan belajar.', en: 'By daring to fail once, so you know how it feels and learn.' },
]

export const config = {
  name: 'bagaimana',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan bagaimana, versi santai KANA', en: 'How-question answering machine, KANA relaxed version' },
  usage: '.bagaimana <pertanyaan>',
  example: '.bagaimana cara move on',
  cooldown: 3,
}

export const i18n = {
  id: { bagaimana: { hint: 'Tanya yang lengkap yaa~ Contoh: .bagaimana cara move on', body: '🤔 {answer} {mood}' } },
  en: { bagaimana: { hint: 'Ask a full question please~ Example: .bagaimana how to move on', body: '🤔 {answer} {mood}' } },
}

export const test = { input: '.bagaimana', expect: /tanya|ask/i }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('bagaimana.hint'))
  const item = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
  return ctx.reply(ctx.t('bagaimana.body', { answer: ctx.lang === 'en' ? item.en : item.id, mood: ctx.say('mikir') }))
}
