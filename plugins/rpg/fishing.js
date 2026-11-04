import { sendButtons } from '../../src/ui/buttons.js'
import { gather } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'fishing',
  alias: ['mancing'],
  category: 'rpg',
  description: { id: 'Memancing ikan, udang, kepiting, siapa tahu ikan legendaris', en: 'Fish for fish, shrimp, crabs, maybe a legendary fish' },
  usage: '.fishing',
  example: '.fishing',
  cooldown: 60,
}

export const i18n = {
  id: {
    fishing: {
      ok: '🎣 Tarikk! Hasil pancingan kamu:\n{items}\nPlus {coins} koin~ 💰\n{mood}',
      failed: 'Yahh, ikannya kabur semua... umpannya dimakan tok, mouu 🥺',
      btnAgain: 'Mancing Lagi',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    fishing: {
      ok: '🎣 Reel it in! Your catch:\n{items}\nPlus {coins} coins~ 💰\n{mood}',
      failed: 'Aww, all the fish escaped... they only ate the bait, mouu 🥺',
      btnAgain: 'Fish Again',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export async function handler(ctx) {
  const res = await gather(ctx.storage, ctx.senderDigits, 'fishing')
  const items = res.items
    .map(({ id, qty }) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? '❔'} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join('\n')
  const body = res.failed
    ? ctx.t('fishing.failed')
    : ctx.t('fishing.ok', { items, coins: res.coins, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('fishing.btnAgain'), id: '.fishing' },
      { text: ctx.t('fishing.btnInventory'), id: '.inventory' },
      { text: ctx.t('fishing.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
