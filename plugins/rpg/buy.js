import { sendButtons } from '../../src/ui/buttons.js'
import { buyItem, sellItem } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'buy',
  alias: ['beli'],
  category: 'rpg',
  description: { id: 'Beli item di toko, atau jual item dari tas: .buy jual <item>', en: 'Buy items at the shop, or sell items from your bag: .buy jual <item>' },
  usage: '.buy <item> [jumlah] | .buy jual <item> [jumlah]',
  example: '.buy makananpet 2',
  cooldown: 3,
}

export const i18n = {
  id: {
    buy: {
      usage: 'Mau beli apa nih? Ketik .buy <item> [jumlah], contoh .buy makananpet 2~\nJual item: .buy jual <item> [jumlah]. Daftar barang ada di .shop yaa ✨',
      bought: '🛍️ Berhasil beli {name} x{qty} seharga {cost} koin!\nSaldo sekarang: {balance} koin 💰\n{mood}',
      sold: '💰 {name} x{qty} terjual! Kamu dapat {gain} koin~\nSaldo sekarang: {balance} koin\n{mood}',
      noCoins: 'Mouu, koin kamu kurang buat beli itu (butuh {cost} koin)... kerja dulu di .mining yaa 🥺',
      notSold: 'Ehh? Item {id} nggak dijual di toko KANA... cek .shop dulu yaa',
      noItem: 'Mouu, kamu nggak punya {name} sebanyak itu di tas 🥺',
      unknownItem: 'Ehh? Item {id} nggak KANA kenal...',
      btnShop: 'Toko',
      btnInventory: 'Tas Aku',
      btnMining: 'Tambang',
    },
  },
  en: {
    buy: {
      usage: 'What do you want to buy? Type .buy <item> [qty], e.g. .buy makananpet 2~\nSell items: .buy jual <item> [qty]. The item list is in .shop ✨',
      bought: '🛍️ Bought {name} x{qty} for {cost} coins!\nBalance now: {balance} coins 💰\n{mood}',
      sold: '💰 Sold {name} x{qty}! You got {gain} coins~\nBalance now: {balance} coins\n{mood}',
      noCoins: 'Mouu, you do not have enough coins for that (needs {cost} coins)... work a bit in .mining first 🥺',
      notSold: 'Eh? Item {id} is not sold at KANA shop... check .shop first',
      noItem: 'Mouu, you do not have that many {name} in your bag 🥺',
      unknownItem: 'Eh? KANA does not know item {id}...',
      btnShop: 'Shop',
      btnInventory: 'My Bag',
      btnMining: 'Mining',
    },
  },
}

function itemName(ctx, id) {
  const item = ITEM_MAP[id]
  return item ? item.name[ctx.lang] ?? item.name.id : id
}

export async function handler(ctx) {
  const args = ctx.args ?? []
  const replies = [
    { text: ctx.t('buy.btnShop'), id: '.shop' },
    { text: ctx.t('buy.btnInventory'), id: '.inventory' },
    { text: ctx.t('buy.btnMining'), id: '.mining' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  if (!args.length) return send(ctx.t('buy.usage'))
  const isSell = ['jual', 'sell'].includes((args[0] || '').toLowerCase())
  const itemId = (isSell ? args[1] : args[0] || '').toLowerCase()
  const qty = Math.max(1, parseInt(isSell ? args[2] : args[1], 10) || 1)
  if (!itemId) return send(ctx.t('buy.usage'))
  if (isSell) {
    const res = await sellItem(ctx.storage, ctx.senderDigits, itemId, qty)
    if (res.ok) return send(ctx.t('buy.sold', { name: itemName(ctx, itemId), qty: res.qty, gain: res.gain, balance: res.balance, mood: ctx.say('senang') }))
    if (res.reason === 'no_item') return send(ctx.t('buy.noItem', { name: itemName(ctx, itemId) }))
    return send(ctx.t('buy.unknownItem', { id: itemId }))
  }
  const res = await buyItem(ctx.storage, ctx.senderDigits, itemId, qty)
  if (res.ok) return send(ctx.t('buy.bought', { name: itemName(ctx, itemId), qty: res.qty, cost: res.cost, balance: res.balance, mood: ctx.say('senang') }))
  if (res.reason === 'no_coins') return send(ctx.t('buy.noCoins', { cost: res.cost }))
  return send(ctx.t('buy.notSold', { id: itemId }))
}
