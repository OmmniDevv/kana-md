import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'faktaunik',
  alias: ['fakta'],
  category: 'fun',
  description: { id: 'Kirim satu fakta unik yang menarik', en: 'Send one interesting unique fact' },
  usage: '.faktaunik',
  example: '.faktaunik',
  cooldown: 3,
}

export const i18n = {
  id: {
    faktaunik: {
      title: 'Fakta Unik',
      body: '🧠 FAKTA UNIK UNTUKMU\n\n{item}\n\nNah, sekarang kamu tahu~ {mood}',
      pool: [
  "Madu tidak pernah basi. Madu berusia ribuan tahun dari makam Mesir kuno masih bisa dimakan.",
  "Gurita punya tiga jantung dan darahnya berwarna biru.",
  "Pisang termasuk buah beri secara botani, tapi stroberi justru bukan.",
  "Berang-berang laut bergandengan tangan saat tidur supaya tidak hanyut terpisah.",
  "Unicorn adalah hewan nasional Skotlandia.",
  "Air panas bisa membeku lebih cepat dari air dingin, ini disebut efek Mpemba.",
  "Satu hari di Venus lebih lama dari satu tahun di Venus.",
  "Kotoran wombat berbentuk kubus.",
  "Programmer komputer pertama adalah Ada Lovelace pada tahun 1840-an.",
  "Hiu sudah ada di Bumi sebelum pohon pertama muncul.",
  "Sekelompok flamingo dalam bahasa Inggris disebut flamboyance.",
  "Titik di atas huruf i dan j punya nama, disebut tittle.",
  "Sapi punya sahabat karib dan bisa stres bila dipisahkan dari sahabatnya.",
  "Sebagian Tembok Besar Tiongkok direkatkan memakai adukan beras ketan.",
  "Jejak kaki astronaut di Bulan bisa bertahan jutaan tahun karena di sana tidak ada angin.",
  "Kacang tanah adalah salah satu bahan dinamit, lewat gliserol dari minyak kacang.",
  "Penemu kaleng Pringles dimakamkan di dalam salah satu kalengnya.",
  "Sambaran petir sekitar lima kali lebih panas dari permukaan Matahari.",
  "Indonesia punya lebih dari tujuh belas ribu pulau.",
  "Jantung paus biru sangat besar, anak kecil bisa berenang lewat pembuluh arterinya."
],
      btnAgain: 'Fakta Lain',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    faktaunik: {
      title: 'Unique Facts',
      body: '🧠 UNIQUE FACT FOR YOU\n\n{item}\n\nNow you know~ {mood}',
      pool: [
  "Honey never spoils. Jars of honey thousands of years old found in ancient Egyptian tombs are still edible.",
  "An octopus has three hearts and blue blood.",
  "Bananas are berries in botanical terms, but strawberries are not.",
  "Sea otters hold hands while sleeping so they do not drift apart.",
  "The unicorn is the national animal of Scotland.",
  "Hot water can freeze faster than cold water, an effect called the Mpemba effect.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat droppings are cube shaped.",
  "The first computer programmer was Ada Lovelace in the 1840s.",
  "Sharks existed before trees appeared on Earth.",
  "A group of flamingos is called a flamboyance.",
  "The dot over the letter i and j has a name: it is called a tittle.",
  "Cows have best friends and get stressed when separated from them.",
  "The Great Wall of China is held together in parts by sticky rice mortar.",
  "An astronaut footprint on the Moon can stay for millions of years because there is no wind there.",
  "Peanuts are one of the ingredients of dynamite, through glycerol from peanut oil.",
  "The inventor of the Pringles can is buried in one.",
  "A bolt of lightning is about five times hotter than the surface of the Sun.",
  "Indonesia has more than seventeen thousand islands.",
  "The heart of a blue whale is so big that a small child could swim through its arteries."
],
      btnAgain: 'Another Fact',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.faktaunik', expect: /fakta unik/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.faktaunik?.pool ?? i18n.id.faktaunik.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('faktaunik.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('faktaunik.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('faktaunik.btnAgain'), id: '.faktaunik' },
    ],
    textFallback: body,
  })
}
