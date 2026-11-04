import { sendButtons } from '../../src/ui/buttons.js'
import { gather } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'hunting',
  alias: ['buru'],
  category: 'rpg',
  description: { id: 'Berburu daging, kulit, dan tanduk di hutan', en: 'Hunt meat, leather, and horns in the forest' },
  usage: '.hunting',
  example: '.hunting',
  cooldown: 60,
}

export const i18n = {
  id: {
    hunting: {
      ok: '🏹 Kena! Hasil buruan kamu:\n{items}\nPlus {coins} koin~ 💰\n{mood}',
      failed: 'Mouu, buruannya lari duluan... jejaknya hilang di semak 🥺',
      btnAgain: 'Buru Lagi',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    hunting: {
      ok: '🏹 Got it! Your hunt haul:\n{items}\nPlus {coins} coins~ 💰\n{mood}',
      failed: 'Mouu, the prey ran away first... its tracks vanished in the bushes 🥺',
      btnAgain: 'Hunt Again',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export async function handler(ctx) {
  const res = await gather(ctx.storage, ctx.senderDigits, 'hunting')
  const items = res.items
    .map(({ id, qty }) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? '❔'} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join('\n')
  const body = res.failed
    ? ctx.t('hunting.failed')
    : ctx.t('hunting.ok', { items, coins: res.coins, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('hunting.btnAgain'), id: '.hunting' },
      { text: ctx.t('hunting.btnInventory'), id: '.inventory' },
      { text: ctx.t('hunting.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
