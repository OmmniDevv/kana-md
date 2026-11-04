import { sendButtons } from '../../src/ui/buttons.js'
import { SHOP, ITEM_MAP } from '../../src/rpg/data.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'shop',
  alias: ['toko', 'buyattack', 'buydefense', 'buyspeed', 'buystrenght'],
  category: 'rpg',
  description: { id: 'Lihat barang yang dijual toko RPG dan harganya', en: 'See what the RPG shop sells and its prices' },
  usage: '.shop',
  example: '.shop',
  cooldown: 3,
}

export const i18n = {
  id: {
    shop: {
      body: '╭─❏ 🛒 「 *SHOP* 」\n┊ 🛒 TOKO KANA 🛒\n┊ Koin kamu: {coins} 💰\n\n┊ {list}\n\n┊ Beli: .buy <item> [jumlah]\n┊ Jual: .buy jual <item> [jumlah] (harga jual ada di .inventory)\n╰━━━━━━━',
      line: '┊ {emoji} {name} ({id}): *{price} koin*',
      btnInventory: 'Tas Aku',
      btnCraft: 'Craft',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    shop: {
      body: '╭─❏ 🛒 「 *SHOP* 」\n┊ 🛒 KANA SHOP 🛒\n┊ Your coins: {coins} 💰\n\n┊ {list}\n\n┊ Buy: .buy <item> [qty]\n┊ Sell: .buy jual <item> [qty] (sell prices are in .inventory)\n╰━━━━━━━',
      line: '┊ {emoji} {name} ({id}): *{price} coins*',
      btnInventory: 'My Bag',
      btnCraft: 'Craft',
      btnProfile: 'RPG Profile',
    },
  },
}

export const test = { input: '.shop', expect: /toko/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const list = SHOP.map((s) => {
    const item = ITEM_MAP[s.id]
    return ctx.t('shop.line', { emoji: item?.emoji ?? '❔', name: item ? item.name[ctx.lang] ?? item.name.id : s.id, id: s.id, price: s.price })
  }).join('\n')
  const body = ctx.t('shop.body', { coins: profile.balance ?? 0, list })
  const replies = [
    ...SHOP.slice(0, 5).map((s) => {
      const item = ITEM_MAP[s.id]
      return { text: `${item?.emoji ?? ''} ${(item ? item.name[ctx.lang] ?? item.name.id : s.id)}`.slice(0, 25), id: `.buy ${s.id}` }
    }),
    { text: ctx.t('shop.btnInventory'), id: '.inventory' },
    { text: ctx.t('shop.btnCraft'), id: '.craft' },
    { text: ctx.t('shop.btnProfile'), id: '.rpg' },
  ]
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
}
