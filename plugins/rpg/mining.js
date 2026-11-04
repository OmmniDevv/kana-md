import { sendButtons } from '../../src/ui/buttons.js'
import { gather } from '../../src/rpg/engine.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'mining',
  alias: ['tambang'],
  category: 'rpg',
  description: { id: 'Menambang batu, besi, emas, sampai berlian', en: 'Mine stone, iron, gold, up to diamonds' },
  usage: '.mining',
  example: '.mining',
  cooldown: 60,
}

export const i18n = {
  id: {
    mining: {
      ok: '⛏️ Clang clang! Hasil tambang kamu:\n{items}\nPlus {coins} koin~ 💰\n{mood}',
      failed: 'Mouu, beliungnya mental dan nggak dapet apa apa kali ini... coba lagi yaa 🥺',
      btnAgain: 'Tambang Lagi',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    mining: {
      ok: '⛏️ Clang clang! Your mining haul:\n{items}\nPlus {coins} coins~ 💰\n{mood}',
      failed: 'Mouu, the pickaxe bounced off and you got nothing this time... try again 🥺',
      btnAgain: 'Mine Again',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export const test = { input: '.mining', expect: /tambang|beliung/i }

export async function handler(ctx) {
  const res = await gather(ctx.storage, ctx.senderDigits, 'mining')
  const items = res.items
    .map(({ id, qty }) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? '❔'} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join('\n')
  const body = res.failed
    ? ctx.t('mining.failed')
    : ctx.t('mining.ok', { items, coins: res.coins, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('mining.btnAgain'), id: '.mining' },
      { text: ctx.t('mining.btnInventory'), id: '.inventory' },
      { text: ctx.t('mining.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
