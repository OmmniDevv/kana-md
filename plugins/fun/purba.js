// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent. Sekarang undian koleksi makhluk purba NYATA:
// 12 makhluk prasejarah asli dengan era hidup dan fakta, hasil undian
// disimpan sebagai koleksi persisten per pengguna.
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'purba',
  alias: ['dino'],
  category: 'fun',
  description: { id: 'Undi dan koleksi makhluk purba asli lengkap dengan era hidup dan faktanya', en: 'Draw and collect real prehistoric creatures complete with their era and facts' },
  usage: '.purba',
  example: '.purba',
  cooldown: 5,
}

export const CREATURES = [
  { name: 'Triceratops', era: 'Kapur Akhir, 68 juta tahun lalu', rarity: 'biasa', weight: 60, fact: { id: 'Frill besar di kepalanya dan tiga tanduk membuatnya hampir mustahil diserang dari depan', en: 'Its big head frill and three horns made it nearly impossible to attack from the front' } },
  { name: 'Velociraptor', era: 'Kapur Akhir, 75 juta tahun lalu', rarity: 'biasa', weight: 60, fact: { id: 'Ukuran aslinya cuma sebesar kalkun, dan tubuhnya berbulu seperti burung', en: 'Its real size was only like a turkey, and its body was feathered like a bird' } },
  { name: 'Stegosaurus', era: 'Jura Akhir, 150 juta tahun lalu', rarity: 'biasa', weight: 60, fact: { id: 'Otaknya hanya sebesar kenari padahal berat badannya mencapai 5 ton', en: 'Its brain was only walnut sized despite a 5 ton body' } },
  { name: 'Smilodon', era: 'Pleistosen, 2,5 juta tahun lalu', rarity: 'biasa', weight: 60, fact: { id: 'Harimau gigi pedang dengan taring atas sepanjang 28 cm', en: 'The saber toothed cat with upper fangs up to 28 cm long' } },
  { name: 'Tyrannosaurus rex', era: 'Kapur Akhir, 68 juta tahun lalu', rarity: 'langka', weight: 30, fact: { id: 'Gigitan terkuat hewan darat yang pernah diukur, sekitar 6 ton tekanan', en: 'The strongest measured bite of any land animal, around 6 tons of pressure' } },
  { name: 'Brachiosaurus', era: 'Jura Akhir, 154 juta tahun lalu', rarity: 'langka', weight: 30, fact: { id: 'Lehernya 9 meter, cukup untuk mengintip dari jendela lantai 4', en: 'Its 9 meter neck was enough to peek into a 4th floor window' } },
  { name: 'Pteranodon', era: 'Kapur Akhir, 86 juta tahun lalu', rarity: 'langka', weight: 30, fact: { id: 'Bukan dinosaurus, melainkan reptil terbang dengan rentang sayap sampai 7 meter', en: 'Not a dinosaur but a flying reptile with a wingspan up to 7 meters' } },
  { name: 'Mammoth Berbulu', era: 'Pleistosen, 300 ribu tahun lalu', rarity: 'epik', weight: 9, fact: { id: 'Populasi terakhirnya di Pulau Wrangel punah baru sekitar 4.000 tahun lalu, seangkatan dengan piramida Mesir', en: 'Its last population on Wrangel Island died out only about 4,000 years ago, in pyramid era Egypt times' } },
  { name: 'Mosasaurus', era: 'Kapur Akhir, 82 juta tahun lalu', rarity: 'epik', weight: 9, fact: { id: 'Kadal laut raksasa sepanjang 17 meter, predator puncak lautan zaman dinosaurus', en: 'A giant 17 meter sea lizard, apex predator of dinosaur era oceans' } },
  { name: 'Anomalocaris', era: 'Kambrium, 520 juta tahun lalu', rarity: 'epik', weight: 9, fact: { id: 'Predator puncak pertama di bumi, berburu dengan sepasang capit di depan mulutnya', en: 'The first apex predator on Earth, hunting with a pair of claws in front of its mouth' } },
  { name: 'Megalodon', era: 'Miosen, 23 juta tahun lalu', rarity: 'legenda', weight: 1, fact: { id: 'Hiu terbesar sepanjang sejarah, giginya sebesar telapak tangan orang dewasa', en: 'The largest shark in history, its teeth as big as an adult palm' } },
  { name: 'Dunkleosteus', era: 'Devon, 380 juta tahun lalu', rarity: 'legenda', weight: 1, fact: { id: 'Ikan berzirah tulang dengan rahang seperti gunting baja, salah satu gigitan tercepat di alam', en: 'A bone armored fish with steel scissor jaws, one of the fastest bites in nature' } },
]

export const i18n = {
  id: {
    purba: {
      title: 'Makhluk Purba',
      body: '╭─❏ 🦖 「 *MAKHLUK PURBA* 」\n┊ ʀᴀʀɪᴛᴀꜱ: ⭐ {rarity}\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴇʀᴀ: {era}\n┊ {fact}\n┊ \n┊ ᴋᴏʟᴇᴋꜱɪᴍᴜ: *{owned} dari {total} makhluk*\n┊ ᴛᴏᴛᴀʟ ᴜɴᴅɪᴀɴ: *{draws}x*\n╰━━━━━━━ {mood}',
      again: '🦖 Undi Lagi',
    },
  },
  en: {
    purba: {
      title: 'Prehistoric Creature',
      body: '╭─❏ 🦖 「 *PREHISTORIC CREATURE* 」\n┊ ʀᴀʀɪᴛʏ: ⭐ {rarity}\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴇʀᴀ: {era}\n┊ {fact}\n┊ \n┊ ʏᴏᴜʀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ: *{owned} of {total} creatures*\n┊ ᴛᴏᴛᴀʟ ᴅʀᴀᴡꜱ: *{draws}x*\n╰━━━━━━━ {mood}',
      again: '🦖 Draw Again',
    },
  },
}

export const test = { input: '.purba', expect: /MAKHLUK PURBA|PREHISTORIC/ }

export function pickWeighted(pool = CREATURES, rng = Math.random) {
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
  const state = (await ctx.storage.get('purba', key)) ?? { draws: 0, owned: {} }
  state.draws += 1
  state.owned[got.name] = (state.owned[got.name] ?? 0) + 1
  await ctx.storage.set('purba', key, state)
  const body = ctx.t('purba.body', {
    rarity: got.rarity.toUpperCase(),
    name: got.name,
    era: got.era,
    fact: got.fact[ctx.lang] ?? got.fact.id,
    owned: Object.keys(state.owned).length,
    total: CREATURES.length,
    draws: state.draws,
    mood: ctx.say('senang'),
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('purba.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('purba.again'), id: '.purba' }],
    textFallback: body,
  })
}
