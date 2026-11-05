// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang toko pet nyata yang terhubung ke
// mesin pet dan toko: katalog pet dari PETS (adopsi lewat petAdopt),
// makanan pet dibeli lewat buyItem dengan harga SHOP, dan status pet
// milikmu ditampilkan.
import { getProfile } from '../../src/services/user-service.js'
import { petAdopt, buyItem } from '../../src/rpg/engine.js'
import { PETS, SHOP_MAP, ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'petshop',
  alias: [],
  category: 'rpg',
  description: { id: 'Toko pet nyata: adopsi pet dan beli makanan pet, terhubung ke profilmu', en: 'A real pet shop: adopt pets and buy pet food, connected to your profile' },
  usage: '.petshop | .petshop adopsi <jenis> | .petshop beli [jumlah]',
  example: '.petshop adopsi kucing',
  cooldown: 5,
}

export const i18n = {
  id: {
    petshop: {
      list: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Pet yang bisa diadopsi (gratis, satu dulu): {pets}\n┊ Makanan pet: *{foodPrice} koin* (stokmu {food})\n┊ Pet kamu: *{mine}*\n┊ Adopsi: .petshop adopsi <jenis> | Beli makanan: .petshop beli [jumlah]\n╰━━━━━━━',
      adopted: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Yayy, kamu adopsi {emoji} *{name}* dari petshop! Rawat pakai .pet makan yaa~\n╰━━━━━━━',
      hasPet: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Kamu sudah punya pet *{name}*, satu dulu yaa~\n╰━━━━━━━',
      unknownKind: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Jenis *{kind}* tidak dijual di sini. Pilihan: {list}\n╰━━━━━━━',
      bought: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Kamu beli *{qty}x Makanan Pet* seharga *{cost} koin*. Stok makanan pet: *{food}*\n┊ Saldo: *{balance} koin*\n╰━━━━━━━',
      poor: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Koin kurang buat beli makanan pet (butuh *{cost} koin*)~\n╰━━━━━━━',
      none: 'belum punya',
    },
  },
  en: {
    petshop: {
      list: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Pets available for adoption (free, one at a time): {pets}\n┊ Pet food: *{foodPrice} coins* (you have {food})\n┊ Your pet: *{mine}*\n┊ Adopt: .petshop adopsi <kind> | Buy food: .petshop beli [qty]\n╰━━━━━━━',
      adopted: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Yayy, you adopted {emoji} *{name}* from the petshop! Feed it with .pet makan~\n╰━━━━━━━',
      hasPet: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ You already have a pet *{name}*, one at a time~\n╰━━━━━━━',
      unknownKind: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Kind *{kind}* is not sold here. Choices: {list}\n╰━━━━━━━',
      bought: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ You bought *{qty}x Pet Food* for *{cost} coins*. Pet food stock: *{food}*\n┊ Balance: *{balance} coins*\n╰━━━━━━━',
      poor: '╭─❏ 🏪 「 *PETSHOP* 」\n┊ Not enough coins to buy pet food (needs *{cost} coins*)~\n╰━━━━━━━',
      none: 'none yet',
    },
  },
}

export const test = { input: '.petshop adopsi kucing', expect: /adopsi|adopted|sudah punya pet|already have a pet/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const [sub, arg] = (ctx.text || '').trim().toLowerCase().split(/\s+/)
  const foodPrice = SHOP_MAP.makananpet?.price ?? ITEM_MAP.makananpet.price
  const food = (profile.inventory ?? {}).makananpet ?? 0
  if (sub === 'adopsi' || sub === 'adopt') {
    const res = await petAdopt(ctx.storage, ctx.senderDigits, arg)
    if (res.ok) {
      const def = PETS.find((p) => p.id === arg)
      return ctx.reply(ctx.t('petshop.adopted', { emoji: def?.emoji ?? '🐾', name: res.pet.name }))
    }
    if (res.reason === 'has_pet') return ctx.reply(ctx.t('petshop.hasPet', { name: profile.pet?.name ?? '-' }))
    const list = PETS.map((p) => p.id).join(', ')
    return ctx.reply(ctx.t('petshop.unknownKind', { kind: arg ?? '-', list }))
  }
  if (sub === 'beli' || sub === 'buy') {
    const qty = Math.max(1, Math.floor(Number(arg) || 1))
    const res = await buyItem(ctx.storage, ctx.senderDigits, 'makananpet', qty)
    if (!res.ok) return ctx.reply(ctx.t('petshop.poor', { cost: foodPrice * qty }))
    const fresh = await getProfile(ctx.storage, ctx.senderDigits)
    return ctx.reply(ctx.t('petshop.bought', {
      qty: res.qty, cost: res.cost, food: (fresh.inventory ?? {}).makananpet ?? 0, balance: res.balance,
    }))
  }
  const pets = PETS.map((p) => p.emoji + ' ' + (ctx.lang === 'en' ? p.name.en : p.name.id) + ' (' + p.id + ')').join(', ')
  return ctx.reply(ctx.t('petshop.list', {
    pets,
    foodPrice,
    food,
    mine: profile.pet ? profile.pet.name + ' lv' + (profile.pet.level ?? 1) : ctx.t('petshop.none'),
  }))
}
