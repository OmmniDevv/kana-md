import { tarotCardImage } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'tarot',
  alias: ['kartutarot'],
  category: 'maker',
  description: { id: 'Tarik satu kartu tarot Major Arcana acak lengkap dengan maknanya', en: 'Draw one random Major Arcana tarot card with its meaning' },
  usage: '.tarot',
  example: '.tarot',
  cooldown: 5,
}

const ARCANA = [
  { name: 'The Fool', numeral: '0', emoji: '🃏', id: 'Awal baru, keberanian melompat, dan rasa percaya pada perjalanan.', en: 'New beginnings, a brave leap, and trust in the journey.' },
  { name: 'The Magician', numeral: 'I', emoji: '🪄', id: 'Semua alat sudah di tanganmu, tinggal dipakai dengan fokus.', en: 'All the tools are already in your hands, use them with focus.' },
  { name: 'The High Priestess', numeral: 'II', emoji: '🌙', id: 'Dengarkan intuisi, jawabannya sudah ada di dalam hati.', en: 'Listen to your intuition, the answer is already inside.' },
  { name: 'The Empress', numeral: 'III', emoji: '🌸', id: 'Musim tumbuh dan berkelimpahan, rawat yang kamu mulai.', en: 'A season of growth and abundance, nurture what you started.' },
  { name: 'The Emperor', numeral: 'IV', emoji: '🏛️', id: 'Struktur dan disiplin membawa hasil yang kokoh.', en: 'Structure and discipline bring solid results.' },
  { name: 'The Lovers', numeral: 'VI', emoji: '💞', id: 'Pilihan hati dan hubungan yang selaras sedang menonjol.', en: 'A heartfelt choice and a harmonious bond stand out.' },
  { name: 'The Chariot', numeral: 'VII', emoji: '🏇', id: 'Maju dengan tekad, kemudi ada di tanganmu.', en: 'Move forward with determination, the reins are yours.' },
  { name: 'Strength', numeral: 'VIII', emoji: '🦁', id: 'Kekuatan lembut: sabar dan berani pada saat yang sama.', en: 'Gentle strength: patient and brave at the same time.' },
  { name: 'The Hermit', numeral: 'IX', emoji: '🏮', id: 'Saatnya menyendiri sebentar untuk menemukan cahaya sendiri.', en: 'Time to step back a little and find your own light.' },
  { name: 'Wheel of Fortune', numeral: 'X', emoji: '🎡', id: 'Roda berputar, keberuntungan sedang bergeser ke arahmu.', en: 'The wheel turns, fortune is shifting your way.' },
  { name: 'The Star', numeral: 'XVII', emoji: '⭐', id: 'Harapan dan pemulihan, masa depan terasa lebih terang.', en: 'Hope and healing, the future looks brighter.' },
  { name: 'The Moon', numeral: 'XVIII', emoji: '🌕', id: 'Tidak semua terlihat jelas, berjalanlah pelan dan waspada.', en: 'Not everything is clear, walk slowly and stay alert.' },
  { name: 'The Sun', numeral: 'XIX', emoji: '☀️', id: 'Hari cerah: energi, kejelasan, dan kabar baik.', en: 'A bright day: energy, clarity, and good news.' },
  { name: 'The World', numeral: 'XXI', emoji: '🌍', id: 'Satu siklus selesai dengan baik, siap membuka babak baru.', en: 'A cycle completes well, ready for a new chapter.' },
]

export const i18n = {
  id: { tarot: { caption: '╭─❏ 🔮 「 *KARTU TAROTMU* 」\n┊ ᴋᴀʀᴛᴜ: *{name}* 🔮\n┊ {meaning}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *GAGAL TARIK KARTU* 」\n┊ Mouu, gagal menarik kartu tarot: *{error}*~\n╰━━━━━━━' } },
  en: { tarot: { caption: '╭─❏ 🔮 「 *YOUR TAROT CARD* 」\n┊ ᴄᴀʀᴅ: *{name}* 🔮\n┊ {meaning}\n╰━━━━━━━', fail: '╭─❏ 💦 「 *TAROT DRAW FAILED* 」\n┊ Mouu, failed to draw a tarot card: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.tarot', expect: /tarot/i }

export async function handler(ctx) {
  const card = ARCANA[Math.floor(Math.random() * ARCANA.length)]
  const meaning = ctx.lang === 'en' ? card.en : card.id
  try {
    const buffer = await tarotCardImage({ name: card.name, numeral: card.numeral, meaning, emoji: card.emoji })
    return sendImage(ctx, buffer, { caption: ctx.t('tarot.caption', { name: card.name, meaning }) })
  } catch (err) {
    return ctx.reply(ctx.t('tarot.fail', { error: err.message }))
  }
}
