import { sendButtons } from '../../src/ui/buttons.js'
import { craftItem } from '../../src/rpg/engine.js'
import { RECIPES, ITEM_MAP } from '../../src/rpg/data.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'craft',
  alias: [],
  category: 'rpg',
  description: { id: 'Buat item dari bahan dengan resep, misal .craft pedangbesi', en: 'Craft items from materials with recipes, e.g. .craft pedangbesi' },
  usage: '.craft [id resep]',
  example: '.craft pedangbesi',
  cooldown: 5,
}

export const i18n = {
  id: {
    craft: {
      listTitle: '🔨 Mau bikin apa nih? Ini resep yang bisa kamu buat:\n{list}\nKetik .craft <id> buat mulai, atau pencet tombolnya~',
      listLine: '• {emoji} {name} (.craft {id})',
      ok: '🔨 Tadaa! {name} berhasil dibuat dan masuk tas kamu~\n{mood}',
      saved: '✨ Bonus pengrajin! Bahan {item} nggak berkurang lho, hemat!',
      missing: 'Mouu, bahan buat {name} belum cukup: butuh {needs}. Kamu punya: {have} 🥺',
      unknown: 'Ehh? Resep {id} nggak KANA kenal... cek .recipes dulu yaa',
      btnRecipes: 'Semua Resep',
      btnInventory: 'Tas Aku',
      btnShop: 'Toko',
    },
  },
  en: {
    craft: {
      listTitle: '🔨 What do you want to make? Recipes you can craft:\n{list}\nType .craft <id> to start, or tap a button~',
      listLine: '• {emoji} {name} (.craft {id})',
      ok: '🔨 Tadaa! {name} was crafted and added to your bag~\n{mood}',
      saved: '✨ Crafter bonus! The {item} material was not consumed, nice save!',
      missing: 'Mouu, materials for {name} are not enough: needs {needs}. You have: {have} 🥺',
      unknown: 'Eh? KANA does not know recipe {id}... check .recipes first',
      btnRecipes: 'All Recipes',
      btnInventory: 'My Bag',
      btnShop: 'Shop',
    },
  },
}

function fmtMap(ctx, map) {
  return Object.entries(map)
    .map(([id, qty]) => {
      const item = ITEM_MAP[id]
      return `${item ? item.name[ctx.lang] ?? item.name.id : id} x${qty}`
    })
    .join(', ')
}

export const test = { input: '.craft', expect: /resep/i }

export async function handler(ctx) {
  const id = (ctx.args?.[0] || '').toLowerCase()
  if (!id) {
    const list = RECIPES.map((r) => {
      const givesId = Object.keys(r.gives)[0]
      return ctx.t('craft.listLine', { emoji: ITEM_MAP[givesId]?.emoji ?? '🔨', name: r.name[ctx.lang] ?? r.name.id, id: r.id })
    }).join('\n')
    const body = ctx.t('craft.listTitle', { list })
    const replies = [
      ...RECIPES.slice(0, 4).map((r) => ({ text: (r.name[ctx.lang] ?? r.name.id).slice(0, 25), id: `.craft ${r.id}` })),
      { text: ctx.t('craft.btnRecipes'), id: '.recipes' },
      { text: ctx.t('craft.btnInventory'), id: '.inventory' },
    ]
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  }
  const res = await craftItem(ctx.storage, ctx.senderDigits, id)
  let body
  if (res.ok) {
    body = ctx.t('craft.ok', { name: res.recipe.name[ctx.lang] ?? res.recipe.name.id, mood: ctx.say('senang') })
    if (res.savedItem) {
      const saved = ITEM_MAP[res.savedItem]
      body += '\n' + ctx.t('craft.saved', { item: saved ? saved.name[ctx.lang] ?? saved.name.id : res.savedItem })
    }
  } else if (res.reason === 'missing_materials') {
    const profile = await getProfile(ctx.storage, ctx.senderDigits)
    const have = Object.fromEntries(Object.keys(res.recipe.needs).map((k) => [k, profile.inventory?.[k] ?? 0]))
    body = ctx.t('craft.missing', {
      name: res.recipe.name[ctx.lang] ?? res.recipe.name.id,
      needs: fmtMap(ctx, res.recipe.needs),
      have: fmtMap(ctx, have),
    })
  } else {
    body = ctx.t('craft.unknown', { id })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('craft.btnRecipes'), id: '.recipes' },
      { text: ctx.t('craft.btnInventory'), id: '.inventory' },
      { text: ctx.t('craft.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
