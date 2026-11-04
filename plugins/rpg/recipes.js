import { sendButtons } from '../../src/ui/buttons.js'
import { RECIPES, ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'recipes',
  alias: ['masak', 'cook'],
  category: 'rpg',
  description: { id: 'Daftar lengkap resep craft dan bahannya', en: 'Full list of crafting recipes and their materials' },
  usage: '.recipes',
  example: '.recipes',
  cooldown: 3,
}

export const i18n = {
  id: {
    recipes: {
      body: '╭─❏ 📖 「 *RECIPES* 」\n┊ 📖 BUKU RESEP KANA 📖\n\n┊ {list}\n\n┊ Ketik .craft <id> buat bikin yaa~\n╰━━━━━━━',
      line: '┊ {emoji} {name} (.craft {id})\n┊ ʙᴀʜᴀɴ: {needs}\n┊ ʜᴀꜱɪʟ: {gives}',
      btnCraft: 'Mulai Craft',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    recipes: {
      body: '╭─❏ 📖 「 *RECIPES* 」\n┊ 📖 KANA RECIPE BOOK 📖\n\n┊ {list}\n\n┊ Type .craft <id> to make one~\n╰━━━━━━━',
      line: '┊ {emoji} {name} (.craft {id})\n┊ ɴᴇᴇᴅꜱ: {needs}\n┊ ɢɪᴠᴇꜱ: {gives}',
      btnCraft: 'Start Crafting',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

function fmtMap(ctx, map) {
  return Object.entries(map)
    .map(([id, qty]) => {
      const item = ITEM_MAP[id]
      return `${item?.emoji ?? ''} ${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join(', ')
}

export const test = { input: '.recipes', expect: /resep/i }

export async function handler(ctx) {
  const list = RECIPES.map((r) => {
    const givesId = Object.keys(r.gives)[0]
    return ctx.t('recipes.line', {
      emoji: ITEM_MAP[givesId]?.emoji ?? '🔨',
      name: r.name[ctx.lang] ?? r.name.id,
      id: r.id,
      needs: fmtMap(ctx, r.needs),
      gives: fmtMap(ctx, r.gives),
    })
  }).join('\n\n')
  const body = ctx.t('recipes.body', { list })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('recipes.btnCraft'), id: '.craft' },
      { text: ctx.t('recipes.btnInventory'), id: '.inventory' },
      { text: ctx.t('recipes.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
