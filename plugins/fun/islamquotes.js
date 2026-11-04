// Kutipan islami pilihan (dataset lokal kurasi KANA dari sumber klasik
// yang dikenal luas, diterjemahkan bebas).
const QUOTES = {
  id: [
    '"Sesungguhnya bersama kesulitan ada kemudahan." (QS Al-Insyirah: 6)',
    '"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya." (QS Al-Baqarah: 286)',
    '"Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu." (QS Al-Baqarah: 152)',
    '"Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu." (QS Ghafir: 60)',
    '"Janganlah kamu berputus asa dari rahmat Allah." (QS Az-Zumar: 53)',
    '"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya." (HR Ahmad)',
    '"Barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya." (QS Ath-Thalaq: 2)',
    '"Sesungguhnya Allah bersama orang-orang yang sabar." (QS Al-Baqarah: 153)',
    '"Ilmu itu kehidupan hati dari kebutaan, cahaya mata dari kegelapan." (Imam Al-Ghazali)',
    '"Dunia ini hijau dan manis, dan Allah menjadikan kalian pengelola di dalamnya." (HR Muslim)',
  ],
  en: [
    '"Indeed, with hardship comes ease." (Quran 94:6)',
    '"Allah does not burden a soul beyond what it can bear." (Quran 2:286)',
    '"So remember Me, and I will remember you." (Quran 2:152)',
    '"And your Lord says: Call upon Me, I will respond to you." (Quran 40:60)',
    '"Do not despair of the mercy of Allah." (Quran 39:53)',
    '"The best of people are those who are most beneficial to others." (Hadith, Ahmad)',
    '"Whoever is mindful of Allah, He will make a way out for them." (Quran 65:2)',
    '"Indeed, Allah is with the patient." (Quran 2:153)',
    '"Knowledge is the life of the heart against blindness, the light of the eyes against darkness." (Imam Al-Ghazali)',
    '"The world is green and sweet, and Allah has entrusted you as stewards over it." (Hadith, Muslim)',
  ],
}

export const config = {
  name: 'islamquotes',
  alias: ['quoteislami', 'kataislami'],
  category: 'fun',
  description: { id: 'Kutipan islami pilihan yang menenangkan hati', en: 'Selected Islamic quotes to soothe the heart' },
  usage: '.islamquotes',
  example: '.islamquotes',
  cooldown: 5,
}

export const i18n = {
  id: { islamquotes: { head: '╭─❏ 🕌 「 *KUTIPAN ISLAMI* 」\n┊ ', foot: '\n╰━━━━━━━' } },
  en: { islamquotes: { head: '╭─❏ 🕌 「 *ISLAMIC QUOTE* 」\n┊ ', foot: '\n╰━━━━━━━' } },
}

export const test = { input: '.islamquotes', expect: /islami|islamic/i }

export async function handler(ctx) {
  const pool = QUOTES[ctx.lang] ?? QUOTES.id
  return ctx.reply(`${ctx.t('islamquotes.head')}${pool[Math.floor(Math.random() * pool.length)]}${ctx.t('islamquotes.foot')}`)
}
