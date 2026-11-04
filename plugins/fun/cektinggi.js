import { sendButtons } from '../../src/ui/buttons.js'
import { hashPercent } from './cekmood.js'

export const config = {
  name: 'cektinggi',
  alias: ['tinggi', 'tall'],
  category: 'fun',
  description: { id: 'Cek tinggi badan versi bercanda, deterministik per hari', en: 'Joke height check, deterministic per day' },
  usage: '.cektinggi',
  example: '.cektinggi',
  cooldown: 3,
}

const BANDS = [
  { max: 25, id: 'Versi mini yang menggemaskan, jangan remehkan yang kecil-kecil cabe rawit.', en: 'Adorable mini version, never underestimate the small but mighty.' },
  { max: 50, id: 'Tinggi standar anak baik, pas buat foto grup baris tengah.', en: 'Standard good kid height, perfect for the middle row of group photos.' },
  { max: 75, id: 'Di atas rata-rata, ambil barang di rak atas bukan masalah buatmu.', en: 'Above average, reaching top shelves is not a problem for you.' },
  { max: 100, id: 'Postur model katalog, waspada kepala kena kusen pintu rumah lama.', en: 'Catalog model posture, watch your head on old house door frames.' },
]

export const i18n = {
  id: {
    cektinggi: {
      body: '📏 CEK TINGGI BADAN\n\nTinggi bercandamu hari ini: *{cm} cm*\n{comment}\n\nTetap ukur pakai meteran beneran buat data asli yaa~ {mood}',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cektinggi: {
      body: '📏 HEIGHT CHECK\n\nYour joke height today: *{cm} cm*\n{comment}\n\nUse a real measuring tape for actual data~ {mood}',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cektinggi', expect: /tinggi|height/i }

export async function handler(ctx) {
  const seed = hashPercent(`${ctx.senderDigits}:tinggi`)
  const cm = 145 + Math.floor((seed / 100) * 55)
  const band = BANDS.find((b) => seed <= b.max) ?? BANDS[BANDS.length - 1]
  const body = ctx.t('cektinggi.body', {
    cm,
    comment: ctx.lang === 'en' ? band.en : band.id,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('cektinggi.btnAgain'), id: '.cektinggi' }],
    textFallback: body,
  })
}
