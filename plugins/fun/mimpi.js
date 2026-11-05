import { sendButtons } from '../../src/ui/buttons.js'

// Mimpi: generator bacaan mimpi seperti padanan Elaina-MD, tetapi semua
// komponen dipilih acak murni dengan Math.random (versi Elaina memakai
// seed nama untuk sebagian komponen). Satu bacaan utuh menggabungkan
// level, kualitas, elemen, peristiwa, pertemuan, kekuatan, dan pesan.
export const config = {
  name: 'mimpi',
  alias: ['dream', 'dreamworld'],
  category: 'fun',
  description: { id: 'Jelajahi dunia mimpimu: bacaan mimpi acak berdasarkan nama', en: 'Explore your dream world: a random dream reading by name' },
  usage: '.mimpi <nama>',
  example: '.mimpi Keisya',
  cooldown: 5,
}

export const DREAM_LEVELS = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇']
export const DREAM_QUALITIES = ['Peaceful 😌', 'Adventure 🚀', 'Mystical 🔮', 'Prophecy 📖', 'Epic 🗺️']
export const DREAM_ELEMENTS = [
  '🌊 Lautan Kristal Bercahaya',
  '🌈 Pelangi Mengambang',
  '🌺 Taman Melayang',
  '⭐ Konstelasi Hidup',
  '🌙 Bulan Kembar',
  '🏰 Kastil Awan',
  '🌋 Gunung Prisma',
  '🎭 Theater Bayangan',
]
export const DREAM_EVENTS = [
  '🦋 Kupu-kupu membawa pesan rahasia',
  '🎭 Topeng menari sendiri',
  '🌊 Hujan bintang jatuh ke laut',
  '🎪 Parade makhluk ajaib',
  '🌺 Bunga bernyanyi lagu kuno',
  '🎨 Lukisan menjadi hidup',
  '🎵 Musik terlihat sebagai warna',
  '⚡ Petir membentuk tangga ke langit',
]
export const DREAM_ENCOUNTERS = [
  '🐉 Naga Pelangi Bijaksana',
  '🧙 Penyihir Bintang',
  '🦊 Rubah Spirit Sembilan Ekor',
  '🧝 Peri Pembawa Mimpi',
  '🦁 Singa Kristal',
  '🐋 Paus Terbang Mistis',
  '🦅 Burung Phoenix Waktu',
  '🐢 Kura-kura Pembawa Dunia',
  '🦄 Unicorn Dimensi',
]
export const DREAM_POWERS = [
  '✨ Mengendalikan Waktu',
  '🌊 Berbicara dengan Elemen',
  '🎭 Shapeshifting',
  '🌈 Manipulasi Realitas',
  '👁️ Penglihatan Masa Depan',
  '🎪 Teleportasi Dimensi',
  '🌙 Penyembuhan Spiritual',
  '⚡ Energi Kosmik',
]
export const DREAM_MESSAGES = [
  'Perjalananmu akan membawa perubahan besar',
  'Rahasia kuno akan terungkap dalam waktu dekat',
  'Kekuatan tersembunyi akan segera bangkit',
  'Takdir baru menanti di horizon',
  'Koneksi spiritual akan menguat',
  'Transformasi besar akan terjadi',
  'Pencerahan akan datang dari arah tak terduga',
  'Misi penting akan segera dimulai',
]

export const i18n = {
  id: {
    mimpi: {
      title: 'Dunia Mimpi',
      result:
        '╭─❏ 🌙 「 *DREAM WORLD* 」\n┊ 👤 ᴇxᴘʟᴏʀᴇʀ: *{name}*\n┊ ⭐ ʟᴇᴠᴇʟ: *{level}*\n┊ 💫 ǫᴜᴀʟɪᴛʏ: *{quality}*\n┊\n┊ 🌈 *Elemen:*\n{elements}\n┊\n┊ 🎪 *Peristiwa:*\n{events}\n┊\n┊ 🌟 *Pertemuan:*\n{encounters}\n┊\n┊ 💫 *Kekuatan:*\n{powers}\n┊\n┊ 🔮 *Pesan:* {message}\n╰━━━━━━━',
      btnAgain: 'Mimpi Lain',
    },
  },
  en: {
    mimpi: {
      title: 'Dream World',
      result:
        '╭─❏ 🌙 「 *DREAM WORLD* 」\n┊ 👤 ᴇxᴘʟᴏʀᴇʀ: *{name}*\n┊ ⭐ ʟᴇᴠᴇʟ: *{level}*\n┊ 💫 ǫᴜᴀʟɪᴛʏ: *{quality}*\n┊\n┊ 🌈 *Elements:*\n{elements}\n┊\n┊ 🎪 *Events:*\n{events}\n┊\n┊ 🌟 *Encounters:*\n{encounters}\n┊\n┊ 💫 *Powers:*\n{powers}\n┊\n┊ 🔮 *Message:* {message}\n╰━━━━━━━',
      btnAgain: 'Another Dream',
    },
  },
}

export const test = { input: '.mimpi Keisya', expect: /dream world/i }

function pickOne(arr, rng) {
  return arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))]
}

function pickMany(arr, count, rng) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export function generateDream(rng = Math.random) {
  return {
    level: pickOne(DREAM_LEVELS, rng),
    quality: pickOne(DREAM_QUALITIES, rng),
    elements: pickMany(DREAM_ELEMENTS, 3, rng),
    events: pickMany(DREAM_EVENTS, 2, rng),
    encounters: pickMany(DREAM_ENCOUNTERS, 2, rng),
    powers: pickMany(DREAM_POWERS, 2, rng),
    message: pickOne(DREAM_MESSAGES, rng),
  }
}

export function formatDream(t, name, dream) {
  const list = (items) => items.map((item) => `┊ ├ ${item}`).join('\n')
  return t('mimpi.result', {
    name,
    level: dream.level,
    quality: dream.quality,
    elements: list(dream.elements),
    events: list(dream.events),
    encounters: list(dream.encounters),
    powers: list(dream.powers),
    message: dream.message,
  })
}

export async function handler(ctx) {
  const name = (ctx.text || '').trim().slice(0, 60) || ctx.pushName || ctx.senderDigits
  const body = formatDream(ctx.t, name, generateDream())
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('mimpi.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('mimpi.btnAgain'), id: '.mimpi' }],
    textFallback: body,
  })
}
