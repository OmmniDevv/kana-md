import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'inventory',
  alias: ['tas', 'inv'],
  category: 'rpg',
  description: { id: 'Lihat isi tas: item dan jumlahnya, plus harga jualnya', en: 'See your bag contents: items and amounts, plus sell prices' },
  usage: '.inventory',
  example: '.inventory',
  cooldown: 3,
}

export const i18n = {
  id: {
    inventory: {
      body: '🎒 TAS KAMU 🎒\nKoin: {coins} 💰\n\n{list}\n\nJual item: .buy jual <item> [jumlah]',
      line: '{emoji} {name} x{qty} (jual {price} koin)',
      empty: 'Tas kamu masih kosong melompong... ayo .mining atau .fishing dulu~ 🥺',
      btnShop: 'Toko',
      btnCraft: 'Craft',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    inventory: {
      body: '🎒 YOUR BAG 🎒\nCoins: {coins} 💰\n\n{list}\n\nSell items: .buy jual <item> [qty]',
      line: '{emoji} {name} x{qty} (sells for {price} coins)',
      empty: 'Your bag is totally empty... go .mining or .fishing first~ 🥺',
      btnShop: 'Shop',
      btnCraft: 'Craft',
      btnMenu: 'RPG Menu',
    },
  },
}

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const entries = Object.entries(profile.inventory ?? {}).filter(([, qty]) => qty > 0)
  const body = entries.length
    ? ctx.t('inventory.body', {
        coins: profile.balance ?? 0,
        list: entries
          .map(([id, qty]) => {
            const item = ITEM_MAP[id]
            return ctx.t('inventory.line', {
              emoji: item?.emoji ?? '❔',
              name: item ? item.name[ctx.lang] ?? item.name.id : id,
              qty,
              price: item?.price ?? 0,
            })
          })
          .join('\n'),
      })
    : ctx.t('inventory.empty')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('inventory.btnShop'), id: '.shop' },
      { text: ctx.t('inventory.btnCraft'), id: '.craft' },
      { text: ctx.t('inventory.btnMenu'), id: '.menurpg' },
    ],
    textFallback: body,
  })
}
