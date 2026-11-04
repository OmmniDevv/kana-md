const GOMBAL = [
  'Kamu tahu bedanya kamu sama matahari? Matahari menyinari bumi, kamu menyinari hariku.',
  'Kalau kamu jadi lagu, kamu pasti reff-nya, yang paling sering kuputar ulang.',
  'Aku tidak butuh peta, sejak ketemu kamu semua jalan pulang terasa dekat.',
  'Kopi pahit pun terasa manis kalau yang nemenin kamu.',
  'Kamu itu kayak WiFi, tidak kelihatan tapi selalu bikin terhubung.',
  'Kalau disuruh memilih antara napas dan kamu, aku pilih kamu sambil tahan napas.',
  'Senyum kamu itu ilegal, terlalu sering mencuri perhatianku.',
  'Aku bukan fotografer, tapi aku bisa membayangkan masa depan kita.',
  'Kamu tahu tidak, kenapa aku selalu telat? Karena waktu berhenti tiap lihat kamu.',
  'Kalau kamu bintang, aku rela jadi langit malam biar selalu dekat.',
  'Belajar matematika itu susah, yang gampang itu jatuh cinta sama kamu.',
  'Kamu seperti tombol snooze, selalu ingin kutemui lima menit lagi.',
]

export const config = {
  name: 'gombal',
  alias: ['rayuan'],
  category: 'fun',
  description: { id: 'Satu gombalan manis acak, siap buat dikirim ke dia', en: 'One random sweet pick-up line, ready to send to them' },
  usage: '.gombal',
  example: '.gombal',
  cooldown: 3,
}

export const i18n = {
  id: { gombal: { body: '💌 {line} {mood}' } },
  en: { gombal: { body: '💌 {line} {mood}' } },
}

export const test = { input: '.gombal', expect: /💌/ }

export async function handler(ctx) {
  const line = GOMBAL[Math.floor(Math.random() * GOMBAL.length)]
  return ctx.reply(ctx.t('gombal.body', { line, mood: ctx.say('malu') }))
}
