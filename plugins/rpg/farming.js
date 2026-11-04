import { sendButtons } from '../../src/ui/buttons.js'
import { gather } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'farming',
  alias: ['tani'],
  category: 'rpg',
  description: { id: 'Panen padi, sayur, buah, dan bunga di ladang', en: 'Harvest rice, vegetables, fruit, and flowers in the field' },
  usage: '.farming',
  example: '.farming',
  cooldown: 60,
}

export const i18n = {
  id: {
    farming: {
      ok: '🌾 Panen raya! Hasil ladang kamu:\n{items}\nPlus {coins} koin~ 💰\n{mood}',
      failed: 'Yahh, panennya gagal kali ini, hama iseng banget sih 🥺',
      btnAgain: 'Panen Lagi',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    farming: {
      ok: '🌾 Big harvest! Your field haul:\n{items}\nPlus {coins} coins~ 💰\n{mood}',
      failed: 'Aww, the harvest failed this time, the pests were so naughty 🥺',
      btnAgain: 'Harvest Again',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export async function handler(ctx) {
  const res = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const items = res.items
    .map(({ id, qty }) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? '❔'} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join('\n')
  const body = res.failed
    ? ctx.t('farming.failed')
    : ctx.t('farming.ok', { items, coins: res.coins, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('farming.btnAgain'), id: '.farming' },
      { text: ctx.t('farming.btnInventory'), id: '.inventory' },
      { text: ctx.t('farming.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
