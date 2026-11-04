const ADVICE = [
  { id: 'Mulai dari yang kecil, konsistensi mengalahkan semangat sesaat.', en: 'Start small, consistency beats short bursts of motivation.' },
  { id: 'Kalau lelah, istirahat. Berhenti dan istirahat itu beda jauh.', en: 'When you are tired, rest. Resting and quitting are very different.' },
  { id: 'Tulis dulu sebelum lupa, otak bukan tempat arsip yang rapi.', en: 'Write it down before you forget, your brain is not a tidy archive.' },
  { id: 'Satu tugas selesai lebih baik dari sepuluh tugas setengah jalan.', en: 'One finished task beats ten half-done ones.' },
  { id: 'Jangan bandingkan babak pertamamu dengan babak final orang lain.', en: 'Do not compare your first chapter with someone else final chapter.' },
  { id: 'Minum air, postur duduk yang benar, lalu lanjut lagi.', en: 'Drink water, fix your posture, then continue.' },
  { id: 'Bertanya itu bukan lemah, pura-pura tahu yang berbahaya.', en: 'Asking is not weakness, pretending to know is the danger.' },
  { id: 'Simpan uang recehmu, kebiasaan kecil jadi gunung pelan-pelan.', en: 'Save your small change, small habits quietly become mountains.' },
  { id: 'Tidur cukup adalah cheat code paling legal di dunia.', en: 'Enough sleep is the most legal cheat code in the world.' },
  { id: 'Maafkan dirimu yang kemarin, lalu perbaiki satu hal hari ini.', en: 'Forgive yesterday you, then fix one thing today.' },
  { id: 'Notifikasi bisa menunggu, orang di depanmu tidak selalu bisa.', en: 'Notifications can wait, the person in front of you may not.' },
  { id: 'Kalau ragu antara baik dan benar, pilih yang baik dulu.', en: 'When torn between kind and right, choose kind first.' },
]

export const config = {
  name: 'advice',
  alias: ['nasihat'],
  category: 'fun',
  description: { id: 'Satu nasihat baik acak buat harimu', en: 'One random piece of good advice for your day' },
  usage: '.advice',
  example: '.advice',
  cooldown: 3,
}

export const i18n = {
  id: { advice: { body: '🌱 Nasihat buatmu:\n{advice} {mood}' } },
  en: { advice: { body: '🌱 Advice for you:\n{advice} {mood}' } },
}

export const test = { input: '.advice', expect: /nasihat|advice/i }

export async function handler(ctx) {
  const item = ADVICE[Math.floor(Math.random() * ADVICE.length)]
  return ctx.reply(ctx.t('advice.body', {
    advice: ctx.lang === 'en' ? item.en : item.id,
    mood: ctx.say('sayang'),
  }))
}
