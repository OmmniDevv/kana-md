import { getProfile, saveProfile } from '../../src/services/user-service.js'
import { consumeEnergy, energyOf } from '../../src/rpg/energy.js'

// Simulator kafe satu plugin dengan subperintah (peta Elaina: cafeopen,
// cafestock, cafemenu, cafeupgrade, cafelist, cafeadd, caferename jadi
// subperintah .cafe). State di profile.cafe.
const MENU = [
  { item: 'kopi', price: 25, cost: 10 },
  { item: 'teh', price: 18, cost: 7 },
  { item: 'roti', price: 30, cost: 14 },
  { item: 'kue', price: 45, cost: 20 },
  { item: 'jus', price: 35, cost: 15 },
]

export const config = {
  name: 'cafe',
  alias: ['kafe'],
  category: 'rpg',
  description: { id: 'Simulator kafe: buka kafe, isi stok, layani pelanggan, upgrade. Sub: buka/tutup/stok/layani/upgrade/status/ganti', en: 'Cafe simulator: open a cafe, stock up, serve customers, upgrade. Subs: buka/tutup/stok/layani/upgrade/status/ganti' },
  usage: '.cafe <buka|status|stok|layani|upgrade|tutup|ganti nama>',
  example: '.cafe buka',
  cooldown: 5,
}

export const i18n = {
  id: {
    cafe: {
      hint: '☕ SIMULATOR KAFE\n\n.cafe buka: buka kafe (modal awal gratis)\n.cafe status: lihat kafe kamu\n.cafe stok: beli stok bahan (50 koin per 10 stok)\n.cafe layani: layani pelanggan (10 energi)\n.cafe upgrade: naikkan level kafe\n.cafe tutup: tutup kafe sementara\n.cafe ganti <nama>: ganti nama kafe',
      opened: '☕ Kafe "{name}" resmi dibuka! Stok awal 10. Layani pelanggan pakai .cafe layani yaa~',
      already: 'Kafemu sudah ada: "{name}" (level {level}). Pakai .cafe status buat lihat.',
      closed: 'Kafemu lagi tutup. Buka lagi pakai .cafe buka.',
      reopened: '☕ Kafe "{name}" dibuka lagi. Selamat melayani~',
      status: '☕ KAFE "{name}"\nStatus: {state}\nLevel: {level}\nStok: {stock}\nPelanggan terlayani: {served}\nTotal pendapatan: {earned} koin',
      noCafe: 'Kamu belum punya kafe. Buka pakai .cafe buka yaa~ {mood}',
      stocked: '📦 Stok dibeli: +10 stok seharga 50 koin. Stok sekarang {stock}. Saldo {balance} koin.',
      poor: 'Koinmu kurang (perlu {need}, saldo {balance}).',
      served: '😊 Kamu melayani {guests} pelanggan, menjual {sold} item {item}. Dapat {gain} koin! Stok sisa {stock}. Saldo {balance} koin.',
      noStock: 'Stok kafemu habis. Beli dulu pakai .cafe stok yaa~',
      lowEnergy: 'Energimu tinggal {energy}, tidak cukup buat melayani (perlu 10).',
      upgraded: '⬆️ Kafe naik ke level {level}! Kapasitas dan harga jual naik. Biaya upgrade tadi {cost} koin.',
      closedNow: 'Kafe ditutup sementara. Buka lagi kapan aja pakai .cafe buka.',
      renamed: 'Nama kafe diganti jadi "{name}"~',
      needName: 'Tulis nama barunya yaa: .cafe ganti <nama>',
    },
  },
  en: {
    cafe: {
      hint: '☕ CAFE SIMULATOR\n\n.cafe buka: open a cafe (free starter capital)\n.cafe status: view your cafe\n.cafe stok: buy stock (50 coins per 10 stock)\n.cafe layani: serve customers (10 energy)\n.cafe upgrade: level up the cafe\n.cafe tutup: close temporarily\n.cafe ganti <name>: rename the cafe',
      opened: '☕ Cafe "{name}" is officially open! Starting stock 10. Serve customers with .cafe layani~',
      already: 'You already have a cafe: "{name}" (level {level}). Use .cafe status to view it.',
      closed: 'Your cafe is closed. Reopen with .cafe buka.',
      reopened: '☕ Cafe "{name}" is open again. Happy serving~',
      status: '☕ CAFE "{name}"\nStatus: {state}\nLevel: {level}\nStock: {stock}\nCustomers served: {served}\nTotal earnings: {earned} coins',
      noCafe: 'You do not have a cafe yet. Open one with .cafe buka~ {mood}',
      stocked: '📦 Bought +10 stock for 50 coins. Stock now {stock}. Balance {balance} coins.',
      poor: 'Not enough coins (needs {need}, balance {balance}).',
      served: '😊 You served {guests} customers, selling {sold} {item}. Earned {gain} coins! Stock left {stock}. Balance {balance} coins.',
      noStock: 'Your cafe stock is empty. Buy more with .cafe stok~',
      lowEnergy: 'Your energy is {energy}, not enough to serve (needs 10).',
      upgraded: '⬆️ Cafe leveled up to {level}! Capacity and prices increased. Upgrade cost {cost} coins.',
      closedNow: 'Cafe closed for now. Reopen anytime with .cafe buka.',
      renamed: 'Cafe renamed to "{name}"~',
      needName: 'Write the new name please: .cafe ganti <name>',
    },
  },
}

export const test = { input: '.cafe', expect: /kafe|cafe/i }

function cafeOf(profile) {
  if (!profile.cafe) return null
  return profile.cafe
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const raw = (ctx.text || '').trim()
  const sub = raw.split(/\s+/)[0]?.toLowerCase() ?? ''
  const rest = raw.slice(sub.length).trim()
  const cafe = cafeOf(profile)

  if (sub === 'buka' || sub === 'open') {
    if (cafe) {
      if (cafe.open) return ctx.reply(ctx.t('cafe.already', { name: cafe.name, level: cafe.level }))
      cafe.open = true
      await saveProfile(ctx.storage, ctx.senderDigits, profile)
      return ctx.reply(ctx.t('cafe.reopened', { name: cafe.name }))
    }
    profile.cafe = { name: `Kafe ${ctx.pushName || 'KANA'}`, open: true, level: 1, stock: 10, served: 0, earned: 0 }
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.opened', { name: profile.cafe.name }))
  }
  if (!cafe) return ctx.reply(ctx.t('cafe.noCafe', { mood: ctx.say('mikir') }))

  if (sub === 'status' || sub === '') {
    return ctx.reply(ctx.t('cafe.status', {
      name: cafe.name, state: cafe.open ? 'BUKA/OPEN' : 'TUTUP/CLOSED', level: cafe.level,
      stock: cafe.stock, served: cafe.served, earned: cafe.earned,
    }))
  }
  if (sub === 'tutup' || sub === 'close') {
    cafe.open = false
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.closedNow'))
  }
  if (sub === 'ganti' || sub === 'rename') {
    if (!rest) return ctx.reply(ctx.t('cafe.needName'))
    cafe.name = rest.slice(0, 40)
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.renamed', { name: cafe.name }))
  }
  if (!cafe.open) return ctx.reply(ctx.t('cafe.closed'))
  if (sub === 'stok' || sub === 'stock') {
    if ((profile.balance ?? 0) < 50) return ctx.reply(ctx.t('cafe.poor', { need: 50, balance: profile.balance ?? 0 }))
    profile.balance -= 50
    cafe.stock += 10
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.stocked', { stock: cafe.stock, balance: profile.balance }))
  }
  if (sub === 'layani' || sub === 'serve') {
    if (cafe.stock <= 0) return ctx.reply(ctx.t('cafe.noStock'))
    if (!consumeEnergy(profile, 10)) return ctx.reply(ctx.t('cafe.lowEnergy', { energy: energyOf(profile) }))
    const guests = 1 + Math.floor(Math.random() * (2 + cafe.level))
    const sold = Math.min(cafe.stock, guests)
    const dish = MENU[Math.floor(Math.random() * MENU.length)]
    const price = Math.round(dish.price * (1 + (cafe.level - 1) * 0.15))
    const gain = sold * (price - dish.cost) + sold * dish.cost
    cafe.stock -= sold
    cafe.served += sold
    cafe.earned += gain
    profile.balance = (profile.balance ?? 0) + gain
    profile.xp = (profile.xp ?? 0) + 4
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.served', { guests, sold, item: dish.item, gain, stock: cafe.stock, balance: profile.balance }))
  }
  if (sub === 'upgrade') {
    const cost = cafe.level * 400
    if ((profile.balance ?? 0) < cost) return ctx.reply(ctx.t('cafe.poor', { need: cost, balance: profile.balance ?? 0 }))
    profile.balance -= cost
    cafe.level += 1
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('cafe.upgraded', { level: cafe.level, cost }))
  }
  return ctx.reply(ctx.t('cafe.hint'))
}
