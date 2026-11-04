// Data statis RPG KANA: item, resep, monster, pekerjaan, toko, pet, clan bayangan.
// Semua logika ada di engine.js; file ini hanya data.

export const ITEMS = [
  // Hasil tambang
  { id: 'batu', name: { id: 'Batu', en: 'Stone' }, emoji: '🪨', price: 10, rarity: 'common' },
  { id: 'batubara', name: { id: 'Batubara', en: 'Coal' }, emoji: '⚫', price: 25, rarity: 'common' },
  { id: 'besi', name: { id: 'Besi', en: 'Iron' }, emoji: '⛓️', price: 60, rarity: 'uncommon' },
  { id: 'emas', name: { id: 'Emas', en: 'Gold' }, emoji: '🟡', price: 150, rarity: 'rare' },
  { id: 'berlian', name: { id: 'Berlian', en: 'Diamond' }, emoji: '💎', price: 500, rarity: 'epic' },
  // Hasil pancing
  { id: 'ikan', name: { id: 'Ikan Biasa', en: 'Common Fish' }, emoji: '🐟', price: 20, rarity: 'common' },
  { id: 'ikanmas', name: { id: 'Ikan Mas', en: 'Goldfish' }, emoji: '🐠', price: 45, rarity: 'common' },
  { id: 'udang', name: { id: 'Udang', en: 'Shrimp' }, emoji: '🦐', price: 55, rarity: 'uncommon' },
  { id: 'kepiting', name: { id: 'Kepiting', en: 'Crab' }, emoji: '🦀', price: 90, rarity: 'uncommon' },
  { id: 'ikanlegendaris', name: { id: 'Ikan Legendaris', en: 'Legendary Fish' }, emoji: '🐉', price: 800, rarity: 'epic' },
  // Hasil buru
  { id: 'daging', name: { id: 'Daging', en: 'Meat' }, emoji: '🍖', price: 35, rarity: 'common' },
  { id: 'kulit', name: { id: 'Kulit', en: 'Leather' }, emoji: '🟤', price: 50, rarity: 'uncommon' },
  { id: 'tanduk', name: { id: 'Tanduk', en: 'Horn' }, emoji: '🦌', price: 120, rarity: 'rare' },
  // Hasil tani
  { id: 'padi', name: { id: 'Padi', en: 'Rice Plant' }, emoji: '🌾', price: 15, rarity: 'common' },
  { id: 'sayur', name: { id: 'Sayur', en: 'Vegetable' }, emoji: '🥬', price: 30, rarity: 'common' },
  { id: 'buah', name: { id: 'Buah', en: 'Fruit' }, emoji: '🍎', price: 40, rarity: 'common' },
  { id: 'bunga', name: { id: 'Bunga', en: 'Flower' }, emoji: '🌸', price: 35, rarity: 'uncommon' },
  // Bahan craft
  { id: 'kayu', name: { id: 'Kayu', en: 'Wood' }, emoji: '🪵', price: 20, rarity: 'common' },
  { id: 'tali', name: { id: 'Tali', en: 'Rope' }, emoji: '🪢', price: 25, rarity: 'common' },
  { id: 'papan', name: { id: 'Papan Kayu', en: 'Wooden Plank' }, emoji: '🪟', price: 70, rarity: 'uncommon' },
  { id: 'kain', name: { id: 'Kain', en: 'Cloth' }, emoji: '🧵', price: 45, rarity: 'uncommon' },
  // Makanan pet dan spesial
  { id: 'makananpet', name: { id: 'Makanan Pet', en: 'Pet Food' }, emoji: '🦴', price: 60, rarity: 'common' },
  { id: 'kristal', name: { id: 'Kristal', en: 'Crystal' }, emoji: '🔮', price: 350, rarity: 'rare' },
  { id: 'telurmisterius', name: { id: 'Telur Misterius', en: 'Mysterious Egg' }, emoji: '🥚', price: 600, rarity: 'epic' },
  // Alat dan hasil craft
  { id: 'beliung', name: { id: 'Beliung', en: 'Pickaxe' }, emoji: '⛏️', price: 300, rarity: 'uncommon' },
  { id: 'joran', name: { id: 'Joran', en: 'Fishing Rod' }, emoji: '🎣', price: 250, rarity: 'uncommon' },
  { id: 'pedangkayu', name: { id: 'Pedang Kayu', en: 'Wooden Sword' }, emoji: '🗡️', price: 180, rarity: 'uncommon' },
  { id: 'pedangbesi', name: { id: 'Pedang Besi', en: 'Iron Sword' }, emoji: '⚔️', price: 700, rarity: 'rare' },
  { id: 'perisai', name: { id: 'Perisai', en: 'Shield' }, emoji: '🛡️', price: 550, rarity: 'rare' },
  { id: 'ramuan', name: { id: 'Ramuan', en: 'Potion' }, emoji: '🧪', price: 160, rarity: 'uncommon' },
  { id: 'kue', name: { id: 'Kue', en: 'Cake' }, emoji: '🍰', price: 140, rarity: 'uncommon' },
]

export const ITEM_MAP = Object.fromEntries(ITEMS.map((i) => [i.id, i]))

// Kelompok hasil per aktivitas gather (dengan bobot dasar, rarity mengatur bobot akhir).
export const GATHER_TABLES = {
  mining: ['batu', 'batu', 'batubara', 'batubara', 'besi', 'emas', 'berlian', 'kristal'],
  fishing: ['ikan', 'ikan', 'ikanmas', 'ikanmas', 'udang', 'kepiting', 'ikanlegendaris'],
  hunting: ['daging', 'daging', 'kulit', 'kulit', 'tanduk', 'kain'],
  farming: ['padi', 'padi', 'sayur', 'buah', 'bunga', 'kayu', 'tali'],
}

export const RECIPES = [
  { id: 'papan', name: { id: 'Papan Kayu', en: 'Wooden Plank' }, needs: { kayu: 3 }, gives: { papan: 2 } },
  { id: 'beliung', name: { id: 'Beliung', en: 'Pickaxe' }, needs: { kayu: 2, besi: 2 }, gives: { beliung: 1 } },
  { id: 'joran', name: { id: 'Joran', en: 'Fishing Rod' }, needs: { kayu: 2, tali: 1 }, gives: { joran: 1 } },
  { id: 'pedangkayu', name: { id: 'Pedang Kayu', en: 'Wooden Sword' }, needs: { kayu: 3 }, gives: { pedangkayu: 1 } },
  { id: 'pedangbesi', name: { id: 'Pedang Besi', en: 'Iron Sword' }, needs: { kayu: 1, besi: 3 }, gives: { pedangbesi: 1 } },
  { id: 'perisai', name: { id: 'Perisai', en: 'Shield' }, needs: { papan: 2, besi: 1 }, gives: { perisai: 1 } },
  { id: 'ramuan', name: { id: 'Ramuan', en: 'Potion' }, needs: { bunga: 2, buah: 1 }, gives: { ramuan: 1 } },
  { id: 'kue', name: { id: 'Kue', en: 'Cake' }, needs: { padi: 2, buah: 1 }, gives: { kue: 1 } },
]

export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]))

export const MONSTERS = [
  { id: 'slime', name: { id: 'Slime', en: 'Slime' }, emoji: '🟢', power: 5, reward: { coins: [20, 50] } },
  { id: 'goblin', name: { id: 'Goblin', en: 'Goblin' }, emoji: '👺', power: 14, reward: { coins: [40, 90], item: 'kulit' } },
  { id: 'serigala', name: { id: 'Serigala Liar', en: 'Wild Wolf' }, emoji: '🐺', power: 24, reward: { coins: [60, 120], item: 'daging' } },
  { id: 'bandit', name: { id: 'Bandit', en: 'Bandit' }, emoji: '🥷', power: 36, reward: { coins: [90, 180], item: 'batubara' } },
  { id: 'orc', name: { id: 'Orc', en: 'Orc' }, emoji: '👹', power: 52, reward: { coins: [130, 240], item: 'tanduk' } },
  { id: 'troll', name: { id: 'Troll', en: 'Troll' }, emoji: '🧌', power: 72, reward: { coins: [180, 320], item: 'besi' } },
  { id: 'golem', name: { id: 'Golem Batu', en: 'Stone Golem' }, emoji: '🗿', power: 98, reward: { coins: [250, 450], item: 'kristal' } },
  { id: 'nagakecil', name: { id: 'Naga Kecil', en: 'Small Dragon' }, emoji: '🐲', power: 135, reward: { coins: [400, 700], item: 'telurmisterius' } },
]

export const JOBS = [
  { id: 'penambang', name: { id: 'Penambang', en: 'Miner' }, emoji: '⛏️', bonus: { activity: 'mining', percent: 20 } },
  { id: 'nelayan', name: { id: 'Nelayan', en: 'Fisher' }, emoji: '🎣', bonus: { activity: 'fishing', percent: 20 } },
  { id: 'pemburu', name: { id: 'Pemburu', en: 'Hunter' }, emoji: '🏹', bonus: { activity: 'hunting', percent: 20 } },
  { id: 'petani', name: { id: 'Petani', en: 'Farmer' }, emoji: '🌾', bonus: { activity: 'farming', percent: 20 } },
  { id: 'pedagang', name: { id: 'Pedagang', en: 'Merchant' }, emoji: '🧮', bonus: { activity: 'sell', percent: 10 } },
  { id: 'pengrajin', name: { id: 'Pengrajin', en: 'Crafter' }, emoji: '🔨', bonus: { activity: 'craft', percent: 20 } },
]

export const JOB_MAP = Object.fromEntries(JOBS.map((j) => [j.id, j]))

// Item yang dijual toko beserta harga beli (koin).
export const SHOP = [
  { id: 'kayu', price: 50 },
  { id: 'tali', price: 40 },
  { id: 'kain', price: 90 },
  { id: 'makananpet', price: 100 },
  { id: 'beliung', price: 500 },
  { id: 'joran', price: 400 },
  { id: 'pedangkayu', price: 300 },
  { id: 'pedangbesi', price: 1200 },
  { id: 'perisai', price: 900 },
  { id: 'ramuan', price: 250 },
  { id: 'telurmisterius', price: 2000 },
]

export const SHOP_MAP = Object.fromEntries(SHOP.map((s) => [s.id, s]))

export const PETS = [
  { id: 'kucing', name: { id: 'Kucing', en: 'Cat' }, emoji: '🐱' },
  { id: 'anjing', name: { id: 'Anjing', en: 'Dog' }, emoji: '🐶' },
  { id: 'burung', name: { id: 'Burung', en: 'Bird' }, emoji: '🐦' },
  { id: 'naga', name: { id: 'Naga Kecil', en: 'Small Dragon' }, emoji: '🐲' },
]

export const PET_MAP = Object.fromEntries(PETS.map((p) => [p.id, p]))

// Clan bayangan untuk clanwar bila belum ada clan lawan nyata.
export const SHADOW_CLANS = [
  { name: 'Clan Bayangan Bulan', power: [40, 90] },
  { name: 'Clan Serigala Senja', power: [70, 140] },
  { name: 'Clan Naga Abu', power: [110, 200] },
  { name: 'Clan Bintang Jatuh', power: [25, 60] },
]

// Power tambahan dari alat yang dimiliki (dihitung sekali per jenis alat).
export const POWER_ITEMS = { pedangbesi: 25, pedangkayu: 10, perisai: 15, beliung: 5, joran: 3 }

export const CLAIM_REWARDS = {
  daily: { coins: 500, xp: 20 },
  hourly: { coins: 100, xp: 5 },
  weekly: { coins: 3000, xp: 100 },
}
