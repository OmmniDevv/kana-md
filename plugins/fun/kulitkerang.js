// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent. Sekarang undian koleksi kulit kerang NYATA:
// 12 spesies kerang laut asli dengan nama Latin dan fakta, hasil
// undian disimpan sebagai koleksi persisten per pengguna.
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kulitkerang',
  alias: ['kerang'],
  category: 'fun',
  description: { id: 'Undi dan koleksi kulit kerang laut asli lengkap dengan nama Latin dan faktanya', en: 'Draw and collect real seashells complete with Latin names and facts' },
  usage: '.kulitkerang',
  example: '.kulitkerang',
  cooldown: 5,
}

export const SHELLS = [
  { name: 'Kerang Darah', latin: 'Anadara granosa', rarity: 'biasa', weight: 60, fact: { id: 'Disebut kerang darah karena cairan tubuhnya kemerahan mengandung hemoglobin', en: 'Called blood cockle because its body fluid is reddish with hemoglobin' } },
  { name: 'Kerang Hijau', latin: 'Perna viridis', rarity: 'biasa', weight: 60, fact: { id: 'Kerang budidaya populer di pesisir Indonesia, menempel berkelompok di tiang dan jaring', en: 'A popular farmed mussel on Indonesian coasts, clustering on poles and nets' } },
  { name: 'Kerang Simping', latin: 'Amusium pleuronectes', rarity: 'biasa', weight: 60, fact: { id: 'Bisa berenang dengan mengepakkan kedua cangkangnya seperti kipas', en: 'It can swim by flapping both shells like a fan' } },
  { name: 'Keong Macan', latin: 'Babylonia spirata', rarity: 'biasa', weight: 60, fact: { id: 'Corak totol cokelatnya mirip kulit macan tutul', en: 'Its brown spotted pattern resembles a leopard coat' } },
  { name: 'Siput Gonggong', latin: 'Strombus canarium', rarity: 'langka', weight: 30, fact: { id: 'Ikon kuliner Kepulauan Riau, dinamai dari suara gonggong anjing saat direbus', en: 'A culinary icon of the Riau Islands, named after a dog bark sound when boiled' } },
  { name: 'Kerang Kipas', latin: 'Pecten maximus', rarity: 'langka', weight: 30, fact: { id: 'Cangkangnya yang simetris menjadi logo perusahaan minyak raksasa Shell', en: 'Its symmetrical shell became the logo of the Shell oil giant' } },
  { name: 'Abalon', latin: 'Haliotis asinina', rarity: 'langka', weight: 30, fact: { id: 'Bagian dalam cangkangnya berkilau seperti mutiara dan bernilai jual tinggi', en: 'The inside of its shell shines like mother of pearl and is highly valued' } },
  { name: 'Kerang Mutiara', latin: 'Pinctada maxima', rarity: 'epik', weight: 9, fact: { id: 'Penghasil mutiara air laut terbesar, dibudidayakan di Lombok dan Sulawesi', en: 'Producer of the largest sea pearls, farmed in Lombok and Sulawesi' } },
  { name: 'Cowrie Emas', latin: 'Callistocypraea aurantium', rarity: 'epik', weight: 9, fact: { id: 'Dulu dipakai sebagai alat tukar dan simbol kemewahan bangsawan Fiji', en: 'Once used as currency and a luxury symbol by Fijian nobility' } },
  { name: 'Terompet Triton', latin: 'Charonia tritonis', rarity: 'epik', weight: 9, fact: { id: 'Salah satu keong laut terbesar, cangkangnya dipakai sebagai terompet upacara', en: 'One of the largest sea snails, its shell is used as a ceremonial trumpet' } },
  { name: 'Kerang Kima Raksasa', latin: 'Tridacna gigas', rarity: 'legenda', weight: 1, fact: { id: 'Kerang terbesar di dunia, beratnya bisa lebih dari 200 kg dan dilindungi hukum', en: 'The largest clam in the world, weighing over 200 kg and protected by law' } },
  { name: 'Nautilus', latin: 'Nautilus pompilius', rarity: 'legenda', weight: 1, fact: { id: 'Fosil hidup dari 500 juta tahun lalu, pola spiral cangkangnya mengikuti rasio emas', en: 'A living fossil from 500 million years ago, its spiral shell follows the golden ratio' } },
]

export const i18n = {
  id: {
    kulitkerang: {
      title: 'Kulit Kerang',
      body: '╭─❏ 🐚 「 *KULIT KERANG* 」\n┊ ʀᴀʀɪᴛᴀꜱ: ⭐ {rarity}\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɴᴀᴍᴀ ʟᴀᴛɪɴ: _{latin}_\n┊ {fact}\n┊ \n┊ ᴋᴏʟᴇᴋꜱɪᴍᴜ: *{owned} dari {total} spesies*\n┊ ᴛᴏᴛᴀʟ ᴜɴᴅɪᴀɴ: *{draws}x*\n╰━━━━━━━ {mood}',
      again: '🐚 Undi Lagi',
    },
  },
  en: {
    kulitkerang: {
      title: 'Seashell',
      body: '╭─❏ 🐚 「 *SEASHELL* 」\n┊ ʀᴀʀɪᴛʏ: ⭐ {rarity}\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʟᴀᴛɪɴ ɴᴀᴍᴇ: _{latin}_\n┊ {fact}\n┊ \n┊ ʏᴏᴜʀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ: *{owned} of {total} species*\n┊ ᴛᴏᴛᴀʟ ᴅʀᴀᴡꜱ: *{draws}x*\n╰━━━━━━━ {mood}',
      again: '🐚 Draw Again',
    },
  },
}

export const test = { input: '.kulitkerang', expect: /KULIT KERANG|SEASHELL/ }

export function pickWeighted(pool = SHELLS, rng = Math.random) {
  const total = pool.reduce((sum, item) => sum + item.weight, 0)
  let roll = rng() * total
  for (const item of pool) {
    roll -= item.weight
    if (roll < 0) return item
  }
  return pool[pool.length - 1]
}

export async function handler(ctx) {
  const got = pickWeighted()
  const key = `collection:${ctx.senderDigits}`
  const state = (await ctx.storage.get('kulitkerang', key)) ?? { draws: 0, owned: {} }
  state.draws += 1
  state.owned[got.name] = (state.owned[got.name] ?? 0) + 1
  await ctx.storage.set('kulitkerang', key, state)
  const body = ctx.t('kulitkerang.body', {
    rarity: got.rarity.toUpperCase(),
    name: got.name,
    latin: got.latin,
    fact: got.fact[ctx.lang] ?? got.fact.id,
    owned: Object.keys(state.owned).length,
    total: SHELLS.length,
    draws: state.draws,
    mood: ctx.say('senang'),
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kulitkerang.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('kulitkerang.again'), id: '.kulitkerang' }],
    textFallback: body,
  })
}
