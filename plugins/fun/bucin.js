import { sendButtons } from '../../src/ui/buttons.js'

// Bucin: satu kata bucin acak dari dataset lokal, seperti padanan
// Elaina-MD yang mengambil satu item acak dari bucin.json. Dataset di
// bawah ditulis untuk KANA (tema bucin umum Bahasa Indonesia), dipilih
// murni dengan Math.random.
export const config = {
  name: 'bucin',
  alias: ['romantis'],
  category: 'fun',
  description: { id: 'Kata kata bucin romantis acak', en: 'A random romantic bucin line' },
  usage: '.bucin',
  example: '.bucin',
  cooldown: 5,
}

export const BUCIN_WORDS = [
  'Kamu itu kayak charger, dekat kamu baterai hatiku langsung penuh lagi.',
  'Kalau rindu itu utang, aku sudah bangkrut gara-gara kamu.',
  'Dunia ini luas, tapi pikiranku selalu pulang ke kamu.',
  'Kamu bukan Google, tapi semua yang aku cari ada di kamu.',
  'Senyum kamu itu kayak wifi, bikin aku betah tidak mau pindah tempat.',
  'Aku tidak perlu alarm, cukup ingat kamu aku langsung bangun semangat.',
  'Kalau kamu bintang, aku rela jadi langit yang menjaga setiap malam.',
  'Jarak cuma angka, yang penting hati kita satu frekuensi.',
  'Kamu datang seperti lagu favorit, diputar berapa kali pun tidak bosan.',
  'Bersamamu, hari biasa terasa seperti liburan panjang.',
  'Aku tidak pandai merayu, tapi aku pandai menjaga perasaanmu.',
  'Kalau cinta itu kopi, kamu adalah gula yang pas takarannya.',
  'Matamu itu rumah, setiap aku menatapnya aku merasa pulang.',
  'Kamu alasanku percaya bahwa kebetulan itu sebenarnya takdir.',
  'Tidak perlu janji manis, cukup temani aku sampai tua nanti.',
  'Chat dari kamu itu notifikasi paling aku tunggu setiap hari.',
  'Kalau aku penulis, kamu adalah bab favorit yang tidak mau aku akhiri.',
  'Dekat kamu waktu terasa cepat, jauh dari kamu waktu terasa jahat.',
  'Kamu seperti senja, selalu indah dan selalu aku tunggu.',
  'Aku rela jadi payung, asal kamu tidak kehujanan sendirian.',
  'Suaramu itu lagu pengantar tidur sekaligus alarm pagiku.',
  'Kalau sayang bisa diukur, alat ukurnya pasti rusak karena kepenuhan.',
  'Kamu bukan candu, kamu kebutuhan pokok hatiku.',
  'Setiap hari bersamamu adalah episode terbaik dalam hidupku.',
  'Aku tidak mencari yang sempurna, aku hanya mencari kamu yang apa adanya.',
  'Kamu itu kayak kunci, membuka semua pintu bahagiaku.',
  'Rinduku ke kamu tidak kenal hari libur, apalagi tanggal merah.',
  'Kalau kamu hujan, aku rela kehujanan asal bersamamu.',
  'Namamu adalah kata sandi semua akun bahagiaku.',
  'Aku ingin menua bersamamu, meski rambut kita berubah warna bersama.',
  'Kamu alasanku tersenyum sendiri di tengah keramaian.',
  'Kalau hati ini rumah, kamu penghuni tetapnya, tidak ada masa sewa.',
  'Tatapanmu lebih manis dari semua gula di dapur ibu.',
  'Aku tidak butuh peta, karena semua jalanku menuju kamu.',
  'Kamu seperti baterai cadangan, selalu ada saat aku hampir menyerah.',
  'Bersamamu, diam saja sudah terasa seperti percakapan paling seru.',
  'Kalau aku boleh egois, aku ingin kamu selalu di sisiku.',
  'Kamu adalah jawaban dari doa yang tidak pernah aku ucapkan keras keras.',
  'Setiap detik tanpamu terasa seperti menit, setiap menit terasa seperti jam.',
  'Aku suka caramu tertawa, sederhana tapi bikin dunia lebih ramah.',
  'Kamu itu matahari versiku, munculmu saja sudah menghangatkan hari.',
  'Kalau cinta adalah perjalanan, aku ingin tersesat bersamamu saja.',
  'Tidak ada kata lelah untuk orang yang tujuannya adalah kamu.',
  'Kamu membuat hal biasa jadi luar biasa hanya dengan hadir.',
  'Aku berjanji bukan jadi yang terbaik, tapi jadi yang selalu ada.',
  'Pelukanmu adalah tempat paling aman setelah rumah ibu.',
  'Kalau aku bisa memilih sekali lagi, aku tetap memilih kamu.',
  'Kamu adalah puisi yang hidup, bukan sekadar kata di kertas.',
  'Duniaku mungkin kecil, tapi selalu cukup selama ada kamu.',
  'Aku mencintaimu dengan cara paling sederhana: tidak pernah pergi.',
]

export const i18n = {
  id: {
    bucin: {
      title: 'Kata Bucin',
      result: '╭─❏ 💌 「 *KATA BUCIN* 」\n┊ "{quote}"\n╰━━━━━━━',
      btnAgain: 'Kata Lain',
    },
  },
  en: {
    bucin: {
      title: 'Bucin Line',
      result: '╭─❏ 💌 「 *BUCIN LINE* 」\n┊ "{quote}"\n╰━━━━━━━',
      btnAgain: 'Another Line',
    },
  },
}

export const test = { input: '.bucin', expect: /kata bucin|bucin line/i }

export function pickBucin(rng = Math.random) {
  return BUCIN_WORDS[Math.min(BUCIN_WORDS.length - 1, Math.floor(rng() * BUCIN_WORDS.length))]
}

export async function handler(ctx) {
  const body = ctx.t('bucin.result', { quote: pickBucin() })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('bucin.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('bucin.btnAgain'), id: '.bucin' }],
    textFallback: body,
  })
}
