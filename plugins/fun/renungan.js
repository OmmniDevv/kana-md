import { quoteCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

// Renungan: gambar kartu kutipan renungan, dirender lokal memakai
// quoteCard (renderer yang sama dengan quotesimage) dengan satu
// kutipan renungan acak dari daftar lokal. Fallback teks bila render
// gagal, seperti pola quotesimage.
export const config = {
  name: 'renungan',
  alias: ['mutiara'],
  category: 'fun',
  description: { id: 'Gambar kartu kutipan renungan acak', en: 'A random reflection quote card image' },
  usage: '.renungan',
  example: '.renungan',
  cooldown: 5,
}

export const RENUNGAN_QUOTES = [
  'Hidup tidak menunggu badai berlalu, hidup belajar menari di tengah hujan.',
  'Syukuri hal kecil hari ini, karena suatu hari kamu akan sadar itu hal besar.',
  'Tidak semua yang hilang adalah kerugian, kadang itu cara Tuhan memberi ruang.',
  'Tenang bukan berarti tanpa beban, tenang berarti percaya beban itu ada jalannya.',
  'Orang sabar bukan yang tidak pernah marah, tapi yang tahu kapan harus diam.',
  'Rezeki tidak selalu uang, waktu dan kesehatan juga rezeki yang mewah.',
  'Jangan bandingkan bab hidupmu dengan bab hidup orang lain, bukunya saja berbeda.',
  'Lelah itu wajar, menyerah itu pilihan. Istirahatlah, bukan berhenti.',
  'Kebaikan kecil yang konsisten mengalahkan niat besar yang tidak pernah jalan.',
  'Maafkan bukan karena mereka pantas, tapi karena hatimu pantas tenang.',
  'Doa yang sederhana tapi tulus lebih kuat dari keluhan yang panjang.',
  'Masa sulit mengajari kita siapa yang benar benar tinggal.',
  'Tidak perlu jadi sempurna, cukup jadi lebih baik dari kemarin.',
  'Senyum adalah sedekah paling murah yang dampaknya tidak murah.',
  'Belajar menerima adalah separuh dari belajar bahagia.',
  'Jaga lisanmu, kata yang keluar tidak bisa ditarik kembali.',
  'Waktu tidak menyembuhkan segalanya, tapi waktu mengajari kita berdamai.',
  'Berbuat baiklah tanpa menunggu dilihat, Tuhan tidak pernah luput melihat.',
  'Ketenangan datang saat kita berhenti memaksa semua hal berjalan sesuai mau kita.',
  'Setiap orang sedang berjuang dengan ujiannya masing masing, jadilah lembut.',
  'Harta terbaik adalah hati yang cukup dan tidak iri pada milik orang.',
  'Bersyukur mengubah apa yang kita punya menjadi terasa cukup.',
]

export const i18n = {
  id: {
    renungan: {
      author: 'Renungan KANA',
      caption: '╭─❏ 🕊️ 「 *RENUNGAN* 」\n┊ "{quote}"\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *RENUNGAN GAGAL* 」\n┊ Mouu, kartu renungannya gagal dibuat: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    renungan: {
      author: 'KANA Reflection',
      caption: '╭─❏ 🕊️ 「 *REFLECTION* 」\n┊ "{quote}"\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *REFLECTION FAILED* 」\n┊ Mouu, the reflection card failed to render: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.renungan', expect: /renungan|reflection/i }

export function pickRenunganQuote(rng = Math.random) {
  return RENUNGAN_QUOTES[Math.min(RENUNGAN_QUOTES.length - 1, Math.floor(rng() * RENUNGAN_QUOTES.length))]
}

export async function handler(ctx) {
  const quote = pickRenunganQuote()
  try {
    const image = await quoteCard({ text: quote, author: ctx.t('renungan.author') })
    if (!Buffer.isBuffer(image) || !image.length) throw new Error('hasil render kosong')
    return await sendImage(ctx, image, { caption: ctx.t('renungan.caption', { quote }) })
  } catch {
    return ctx.reply(ctx.t('renungan.caption', { quote }))
  }
}
