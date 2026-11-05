import { sendButtons } from '../../src/ui/buttons.js'

// Lupakan: satu kutipan motivasi move-on acak dari daftar khusus,
// ditutup kalimat penyemangat tetap, seperti padanan Elaina-MD.
export const config = {
  name: 'lupakan',
  alias: [],
  category: 'fun',
  description: { id: 'Kutipan motivasi buat melupakan masa lalu', en: 'A motivational quote to let go of the past' },
  usage: '.lupakan',
  example: '.lupakan',
  cooldown: 5,
}

export const LUPAKAN_QUOTES = [
  'Masa lalu adalah pelajaran, bukan penjara. Biarkan dirimu terbang lebih tinggi.',
  'Setiap hari adalah kesempatan baru untuk menjadi versi terbaik dari dirimu.',
  'Jangan biarkan kemarin mengambil terlalu banyak dari hari ini.',
  'Lupakan apa yang tidak bisa diubah, fokus pada apa yang bisa kamu lakukan sekarang.',
  'Kehidupan terlalu singkat untuk menyimpan dendam dan penyesalan.',
  'Masa depan menunggu mereka yang berani meninggalkan masa lalu.',
  'Kesalahan adalah guru terbaik, bukan musuh. Belajar dan lanjutkan.',
  'Kamu tidak bisa mengubah masa lalu, tapi kamu bisa membentuk masa depan.',
  'Setiap detik adalah kesempatan untuk memulai ulang.',
  'Lepaskan beban masa lalu dan rasakan kebebasan sejati.',
  'Hidup dimulai ketika kamu berhenti memikirkan apa yang seharusnya terjadi.',
  'Masa lalu tidak mendefinisikan siapa kamu, pilihan hari ini yang melakukannya.',
  'Jangan terjebak dalam cerita lama, tulis cerita baru yang lebih indah.',
  'Keberanian bukan tidak takut, tapi melangkah maju meski takut.',
  'Setiap orang berhak mendapatkan kesempatan kedua, termasuk dirimu sendiri.',
]

export const i18n = {
  id: {
    lupakan: {
      title: 'Lupakan Masa Lalu',
      result: '╭─❏ ❀ 「 *LUPAKAN MASA LALU* 」\n┊ ᴍᴏᴛɪᴠᴀꜱɪ:\n┊ {quote}\n┊\n┊ Ingat, kamu lebih kuat dari yang kamu pikirkan. Masa depan penuh dengan kemungkinan tak terbatas! 💪✨\n╰━━━━━━━',
      btnAgain: 'Kutipan Lain',
    },
  },
  en: {
    lupakan: {
      title: 'Forget the Past',
      result: '╭─❏ ❀ 「 *FORGET THE PAST* 」\n┊ ᴍᴏᴛɪᴠᴀᴛɪᴏɴ:\n┊ {quote}\n┊\n┊ Remember, you are stronger than you think. The future is full of endless possibilities! 💪✨\n╰━━━━━━━',
      btnAgain: 'Another Quote',
    },
  },
}

export const test = { input: '.lupakan', expect: /lupakan masa lalu|forget the past/i }

export function pickLupakanQuote(rng = Math.random) {
  return LUPAKAN_QUOTES[Math.min(LUPAKAN_QUOTES.length - 1, Math.floor(rng() * LUPAKAN_QUOTES.length))]
}

export async function handler(ctx) {
  const body = ctx.t('lupakan.result', { quote: pickLupakanQuote() })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('lupakan.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('lupakan.btnAgain'), id: '.lupakan' }],
    textFallback: body,
  })
}
