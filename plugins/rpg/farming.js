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
      ok: '╭─❏ 🌾 「 *FARMING* 」\n┊ 🌾 Panen raya! Hasil ladang kamu:\n┊ {items}\n┊ Plus {coins} koin~ 💰\n┊ {mood}\n╰━━━━━━━',
      failed: '╭─❏ ✨ 「 *FARMING* 」\n┊ Yahh, panennya gagal kali ini, hama iseng banget sih 🥺\n╰━━━━━━━',
      btnAgain: 'Panen Lagi',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    farming: {
      ok: '╭─❏ 🌾 「 *FARMING* 」\n┊ 🌾 Big harvest! Your field haul:\n┊ {items}\n┊ Plus {coins} coins~ 💰\n┊ {mood}\n╰━━━━━━━',
      failed: '╭─❏ ✨ 「 *FARMING* 」\n┊ Aww, the harvest failed this time, the pests were so naughty 🥺\n╰━━━━━━━',
      btnAgain: 'Harvest Again',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

export const test = { input: '.farming', expect: /ladang|panen/i }

export async function handler(ctx) {
  const res = await gather(ctx.storage, ctx.senderDigits, 'farming')
  const items = res.items
    .map(({ id, qty }) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? '❔'} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join('\n┊ ')
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
