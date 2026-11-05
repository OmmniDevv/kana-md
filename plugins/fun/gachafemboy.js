// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent, tidak ada gacha apa pun. Sekarang gacha NYATA
// mengikuti pola sehat .gachakarakter: kolam karakter anime femboy
// faktual berbobot rarity, hasil undian disimpan sebagai koleksi
// persisten per pengguna dan terbaca lagi di tarikan berikutnya.
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gachafemboy',
  alias: [],
  category: 'fun',
  description: { id: 'Gacha karakter anime femboy dari kolam berbobot rarity, hasilnya masuk koleksi persistenmu', en: 'Pull femboy anime characters from a rarity weighted pool, results go into your persistent collection' },
  usage: '.gachafemboy',
  example: '.gachafemboy',
  cooldown: 5,
}

export const POOL = [
  { name: 'Nagisa Shiota', from: 'Assassination Classroom', rarity: 'biasa', weight: 60, trait: { id: 'Pembunuh berbakat berwajah lembut yang sering dikira perempuan oleh teman sekelasnya', en: 'A soft faced talented assassin often mistaken for a girl by classmates' } },
  { name: 'Saika Totsuka', from: 'Oregairu', rarity: 'biasa', weight: 60, trait: { id: 'Anggota klub tenis yang manisnya membuat semua orang salah sangka', en: 'The tennis club member whose cuteness fools everyone' } },
  { name: 'Hideyoshi Kinoshita', from: 'Baka to Test', rarity: 'biasa', weight: 60, trait: { id: 'Saking meyakinkannya, jenis kelaminnya dianggap kategori sendiri: Hideyoshi', en: 'So convincing that his gender is treated as its own category: Hideyoshi' } },
  { name: 'Chihiro Fujisaki', from: 'Danganronpa', rarity: 'langka', weight: 30, trait: { id: 'Programmer jenius pemalu yang berpakaian perempuan untuk menyembunyikan kelemahannya', en: 'A shy genius programmer who dressed as a girl to hide his weakness' } },
  { name: 'Hideri Kanzaki', from: 'Blend S', rarity: 'langka', weight: 30, trait: { id: 'Calon idol yang bekerja sebagai pelayan kafe dengan gaya femboy penuh percaya diri', en: 'An aspiring idol working as a cafe waiter with total femboy confidence' } },
  { name: 'Felix Argyle', from: 'Re:Zero', rarity: 'epik', weight: 9, trait: { id: 'Ksatria penyihir penyembuh bertelinga kucing dengan gaya bicara "nya" yang ikonik', en: 'A cat eared healer knight with an iconic verbal tic' } },
  { name: 'Mariya Shidou', from: 'Maria+Holic', rarity: 'epik', weight: 9, trait: { id: 'Siswa sekolah perempuan yang sebenarnya laki-laki dan suka menggoda Kanako', en: 'A girls school student who is actually a boy and loves teasing Kanako' } },
  { name: 'Astolfo', from: 'Fate/Apocrypha', rarity: 'legenda', weight: 1, trait: { id: 'Rider of Black, paladin legendaris paling ikonik di seluruh jagat Fate', en: 'Rider of Black, the most iconic legendary paladin across the Fate universe' } },
]

export const i18n = {
  id: {
    gachafemboy: {
      title: 'Gacha Femboy',
      body: '╭─❏ 🎀 「 *GACHA FEMBOY* 」\n┊ ʀᴀʀɪᴛᴀꜱ: ⭐ {rarity}\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴅᴀʀɪ: {from}\n┊ {trait}\n┊ \n┊ ᴋᴏʟᴇᴋꜱɪᴍᴜ: *{owned} dari {total} karakter*\n┊ ᴛᴏᴛᴀʟ ᴛᴀʀɪᴋᴀɴ: *{pulls}x*\n╰━━━━━━━ {mood}',
      again: '🎀 Gacha Lagi',
    },
  },
  en: {
    gachafemboy: {
      title: 'Femboy Gacha',
      body: '╭─❏ 🎀 「 *FEMBOY GACHA* 」\n┊ ʀᴀʀɪᴛʏ: ⭐ {rarity}\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ꜰʀᴏᴍ: {from}\n┊ {trait}\n┊ \n┊ ʏᴏᴜʀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ: *{owned} of {total} characters*\n┊ ᴛᴏᴛᴀʟ ᴘᴜʟʟꜱ: *{pulls}x*\n╰━━━━━━━ {mood}',
      again: '🎀 Pull Again',
    },
  },
}

export const test = { input: '.gachafemboy', expect: /GACHA FEMBOY|FEMBOY GACHA/ }

export function pickWeighted(pool = POOL, rng = Math.random) {
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
  const state = (await ctx.storage.get('gachafemboy', key)) ?? { pulls: 0, owned: [] }
  state.pulls += 1
  if (!state.owned.includes(got.name)) state.owned.push(got.name)
  await ctx.storage.set('gachafemboy', key, state)
  const body = ctx.t('gachafemboy.body', {
    rarity: got.rarity.toUpperCase(),
    name: got.name,
    from: got.from,
    trait: got.trait[ctx.lang] ?? got.trait.id,
    owned: state.owned.length,
    total: POOL.length,
    pulls: state.pulls,
    mood: ctx.say('senang'),
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gachafemboy.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('gachafemboy.again'), id: '.gachafemboy' }],
    textFallback: body,
  })
}
