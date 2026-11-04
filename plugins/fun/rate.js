import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'rate',
  alias: ['nilai'],
  category: 'fun',
  description: { id: 'Nilai sesuatu dari 0 sampai 100 persen, hasilnya stabil untuk hal yang sama', en: 'Rate anything from 0 to 100 percent, stable result for the same thing' },
  usage: '.rate <hal yang mau dinilai>',
  example: '.rate masakan ibu',
  cooldown: 3,
}

export function hashPercent(seed) {
  let h = 2166136261
  const s = String(seed)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 101 + 101) % 101
}

export const i18n = {
  id: {
    rate: {
      title: 'Mesin Rating',
      ask: 'Mau nilai apa? Tulis begini yaa: .rate masakan ibu {mood}',
      body: '📊 RATING KANA\n\nTopik: *{topic}*\nNilai: *{percent}%*\n\n{comment} {mood}',
      low: ['Versi Kana sih... masih jauh dari kata jadi.', 'Hmm, ini perlu perbaikan besar-besaran.'],
      mid: ['Lumayan, tapi belum bikin Kana terkesan.', 'Setengah jalan, tinggal dipoles sedikit lagi.'],
      high: ['Bagus! Di atas rata-rata dengan percaya diri.', 'Ini sih kualitasnya terasa banget.'],
      max: ['Sempurna menurut mesin rating Kana!', 'Tidak ada notes. Legendaris.'],
      btnAgain: '📊 Nilai yang Ini Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    rate: {
      title: 'Rating Machine',
      ask: 'What should I rate? Write it like this: .rate mom cooking {mood}',
      body: '📊 KANA RATING\n\nTopic: *{topic}*\nScore: *{percent}%*\n\n{comment} {mood}',
      low: ['In Kana version... still far from done.', 'Hmm, this needs major repairs.'],
      mid: ['Decent, but not enough to impress Kana.', 'Halfway there, just needs a little polish.'],
      high: ['Good! Confidently above average.', 'You can really feel the quality here.'],
      max: ['Perfect according to Kana rating machine!', 'No notes. Legendary.'],
      btnAgain: '📊 Rate This Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.rate masakan ibu', expect: /rating/i }

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length]

export async function handler(ctx) {
  const topic = (ctx.text || '').trim().slice(0, 80)
  if (!topic) return ctx.reply(ctx.t('rate.ask', { mood: ctx.say('mikir') }))
  const percent = hashPercent(`rate:${topic.toLowerCase()}`)
  const band = percent <= 30 ? 'low' : percent <= 65 ? 'mid' : percent <= 90 ? 'high' : 'max'
  const pool = i18n[ctx.lang]?.rate?.[band] ?? i18n.id.rate[band]
  const body = ctx.t('rate.body', { topic, percent, comment: pick(pool, percent), mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('rate.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('rate.btnAgain'), id: `.rate ${topic}` },
    ],
    textFallback: body,
  })
}
