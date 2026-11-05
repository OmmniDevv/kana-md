import { sendButtons } from '../../src/ui/buttons.js'
import { buyItem, sellItem } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'buy',
  alias: [],
  category: 'rpg',
  description: { id: 'Beli item di toko, atau jual item dari tas: .buy jual <item>', en: 'Buy items at the shop, or sell items from your bag: .buy jual <item>' },
  usage: '.buy <item> [jumlah] | .buy jual <item> [jumlah]',
  example: '.buy makananpet 2',
  cooldown: 3,
}

export const i18n = {
  id: {
    buy: {
      usage: '╭─❏ ✨ 「 *BUY* 」\n┊ Mau beli apa nih? Ketik .buy <item> [jumlah], contoh .buy makananpet 2~\n┊ Jual item: .buy jual <item> [jumlah]. Daftar barang ada di .shop yaa ✨\n╰━━━━━━━',
      bought: '╭─❏ 🛍️ 「 *BUY* 」\n┊ 🛍️ Berhasil beli {name} x{qty} seharga {cost} koin!\n┊ Saldo sekarang: {balance} koin 💰\n┊ {mood}\n╰━━━━━━━',
      sold: '╭─❏ 💰 「 *BUY* 」\n┊ 💰 {name} x{qty} terjual! Kamu dapat {gain} koin~\n┊ Saldo sekarang: {balance} koin\n┊ {mood}\n╰━━━━━━━',
      noCoins: '╭─❏ ✨ 「 *BUY* 」\n┊ Mouu, koin kamu kurang buat beli itu (butuh {cost} koin)... kerja dulu di .mining yaa 🥺\n╰━━━━━━━',
      notSold: '╭─❏ ✨ 「 *BUY* 」\n┊ Ehh? Item {id} nggak dijual di toko KANA... cek .shop dulu yaa\n╰━━━━━━━',
      noItem: '╭─❏ ✨ 「 *BUY* 」\n┊ Mouu, kamu nggak punya {name} sebanyak itu di tas 🥺\n╰━━━━━━━',
      unknownItem: 'Ehh? Item {id} nggak KANA kenal...',
      btnShop: 'Toko',
      btnInventory: 'Tas Aku',
      btnMining: 'Tambang',
    },
  },
  en: {
    buy: {
      usage: '╭─❏ ✨ 「 *BUY* 」\n┊ What do you want to buy? Type .buy <item> [qty], e.g. .buy makananpet 2~\n┊ Sell items: .buy jual <item> [qty]. The item list is in .shop ✨\n╰━━━━━━━',
      bought: '╭─❏ 🛍️ 「 *BUY* 」\n┊ 🛍️ Bought {name} x{qty} for {cost} coins!\n┊ Balance now: {balance} coins 💰\n┊ {mood}\n╰━━━━━━━',
      sold: '╭─❏ 💰 「 *BUY* 」\n┊ 💰 Sold {name} x{qty}! You got {gain} coins~\n┊ Balance now: {balance} coins\n┊ {mood}\n╰━━━━━━━',
      noCoins: '╭─❏ ✨ 「 *BUY* 」\n┊ Mouu, you do not have enough coins for that (needs {cost} coins)... work a bit in .mining first 🥺\n╰━━━━━━━',
      notSold: '╭─❏ ✨ 「 *BUY* 」\n┊ Eh? Item {id} is not sold at KANA shop... check .shop first\n╰━━━━━━━',
      noItem: '╭─❏ ✨ 「 *BUY* 」\n┊ Mouu, you do not have that many {name} in your bag 🥺\n╰━━━━━━━',
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

export const test = { input: '.buy 1', expect: /.+/ }

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
