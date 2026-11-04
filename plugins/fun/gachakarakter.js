import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gachakarakter',
  alias: ['gachachar'],
  category: 'fun',
  description: { id: 'Gacha karakter orisinal: kumpulkan tokoh dari yang Biasa sampai Legenda', en: 'Original character gacha: collect characters from Common to Legendary' },
  usage: '.gachakarakter',
  example: '.gachakarakter',
  cooldown: 3,
}

// Karakter orisinal untuk koleksi hiburan. Bobot: Biasa 50%, Langka 30%,
// Epik 15%, Legenda 5%.
const CHARACTERS = [
  { name: 'Pipit si Penjual Jamu', trait: { id: 'Selalu tahu ramuan untuk segala keluhan tetangga', en: 'Always knows a herbal remedy for every neighbor complaint' }, rarity: 'biasa' },
  { name: 'Beni Tukang Ojek', trait: { id: 'Hafal semua jalan tikus satu kota', en: 'Knows every shortcut in the city by heart' }, rarity: 'biasa' },
  { name: 'Sari Penjaga Warung', trait: { id: 'Ingat utang semua pelanggan sampai perak terakhir', en: 'Remembers every customer tab down to the last coin' }, rarity: 'biasa' },
  { name: 'Udin si Pemanjat Kelapa', trait: { id: 'Tidak pernah jatuh, keseimbangannya legendaris di kampung', en: 'Never falls, his balance is legendary in the village' }, rarity: 'biasa' },
  { name: 'Lastri Guru Ngaji', trait: { id: 'Suaranya menenangkan satu surau', en: 'Her voice calms the whole prayer house' }, rarity: 'biasa' },
  { name: 'Kapten Rara', trait: { id: 'Pilot pesawat kertas yang belum pernah kalah lomba', en: 'Paper plane pilot who never lost a contest' }, rarity: 'langka' },
  { name: 'Profesor Kodel', trait: { id: 'Memperbaiki radio rusak hanya dengan sendok', en: 'Fixes broken radios using only a spoon' }, rarity: 'langka' },
  { name: 'Ninja Narti', trait: { id: 'Bergerak tanpa suara, muncul selalu saat ada gorengan', en: 'Moves silently, always appears when fried snacks show up' }, rarity: 'langka' },
  { name: 'Duta Duta', trait: { id: 'Kembar yang bisa menyelesaikan kalimat satu sama lain', en: 'Twins who finish each other sentences' }, rarity: 'langka' },
  { name: 'Ratu Es Krim', trait: { id: 'Menemukan rasa baru tiap bulan purnama', en: 'Invents a new flavor every full moon' }, rarity: 'epik' },
  { name: 'Penjaga Mercusuar Tua', trait: { id: 'Menghafal nama semua kapal yang lewat sejak 1980', en: 'Memorized the name of every passing ship since 1980' }, rarity: 'epik' },
  { name: 'Si Buta dari Gua Kompilasi', trait: { id: 'Men-debug kode hanya dari bunyi kipas laptop', en: 'Debugs code just from the sound of the laptop fan' }, rarity: 'epik' },
  { name: 'Naga Kecil Ember', trait: { id: 'Naga sebesar kucing yang menyemburkan percikan hangat', en: 'A cat sized dragon who breathes warm sparks' }, rarity: 'legenda' },
  { name: 'Kana versi Alternatif', trait: { id: 'Datang dari linimasa lain khusus untuk menyapa', en: 'Came from another timeline just to say hi' }, rarity: 'legenda' },
]

const WEIGHTS = { biasa: 50, langka: 30, epik: 15, legenda: 5 }
const RARITY_LABEL = {
  id: { biasa: '⚪ Biasa', langka: '🔵 Langka', epik: '🟣 Epik', legenda: '🟡 Legenda' },
  en: { biasa: '⚪ Common', langka: '🔵 Rare', epik: '🟣 Epic', legenda: '🟡 Legendary' },
}

export const i18n = {
  id: {
    gachakarakter: {
      title: 'Gacha Karakter',
      body: '╭─❏ 🎁 「 *GACHA KARAKTER* 」\n┊ ʀᴀʀɪᴛᴀꜱ: ⭐ {rarity}\n┊ ɴᴀᴍᴀ: *{name}*\n┊ {trait}\n┊\n┊ ᴋᴏʟᴇᴋꜱɪᴍᴜ: *{owned} dari {total} karakter*\n┊ ᴛᴏᴛᴀʟ ᴛᴀʀɪᴋᴀɴ: *{pulls}x*\n╰━━━━━━━ {mood}',
      btnAgain: '🎁 Tarik Lagi',
    },
  },
  en: {
    gachakarakter: {
      title: 'Character Gacha',
      body: '╭─❏ 🎁 「 *CHARACTER GACHA* 」\n┊ ʀᴀʀɪᴛʏ: ⭐ {rarity}\n┊ ɴᴀᴍᴇ: *{name}*\n┊ {trait}\n┊\n┊ ʏᴏᴜʀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ: *{owned} of {total} characters*\n┊ ᴛᴏᴛᴀʟ ᴘᴜʟʟꜱ: *{pulls}x*\n╰━━━━━━━ {mood}',
      btnAgain: '🎁 Pull Again',
    },
  },
}

export const test = { input: '.gachakarakter', expect: /gacha karakter/i }

function roll() {
  const bag = []
  for (const c of CHARACTERS) for (let i = 0; i < WEIGHTS[c.rarity]; i++) bag.push(c)
  return bag[Math.floor(Math.random() * bag.length)]
}

export async function handler(ctx) {
  const got = roll()
  const key = `collection:${ctx.senderDigits}`
  const state = (await ctx.storage.get('gachakarakter', key)) ?? { pulls: 0, owned: [] }
  state.pulls += 1
  if (!state.owned.includes(got.name)) state.owned.push(got.name)
  await ctx.storage.set('gachakarakter', key, state)
  const labels = RARITY_LABEL[ctx.lang] ?? RARITY_LABEL.id
  const body = ctx.t('gachakarakter.body', {
    rarity: labels[got.rarity],
    name: got.name,
    trait: got.trait[ctx.lang] ?? got.trait.id,
    owned: state.owned.length,
    total: CHARACTERS.length,
    pulls: state.pulls,
    mood: ctx.say(got.rarity === 'legenda' ? 'senang' : 'sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gachakarakter.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('gachakarakter.btnAgain'), id: '.gachakarakter' },
    ],
    textFallback: body,
  })
}
