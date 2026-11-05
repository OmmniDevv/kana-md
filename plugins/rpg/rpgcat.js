// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang katalog RPG nyata dari data.js:
// semua item beserta rarity dan harga, jumlah resep, monster, dan pet.
import { ITEMS, RECIPES, MONSTERS, PETS } from '../../src/rpg/data.js'

export const config = {
  name: 'rpgcat',
  alias: [],
  category: 'rpg',
  description: { id: 'Katalog RPG lengkap: semua item, harga, dan rarity dari data game', en: 'Full RPG catalog: every item, price, and rarity from the game data' },
  usage: '.rpgcat',
  example: '.rpgcat',
  cooldown: 5,
}

export const i18n = {
  id: {
    rpgcat: {
      body: '╭─❏ 📚 「 *KATALOG RPG* 」\n┊ {list}\n┊ Total: *{items} item*, *{recipes} resep*, *{monsters} monster*, *{pets} pet*\n┊ Beli yang dijual toko pakai .shop\n╰━━━━━━━',
    },
  },
  en: {
    rpgcat: {
      body: '╭─❏ 📚 「 *RPG CATALOG* 」\n┊ {list}\n┊ Total: *{items} items*, *{recipes} recipes*, *{monsters} monsters*, *{pets} pets*\n┊ Buy shop items with .shop\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.rpgcat', expect: /katalog rpg|rpg catalog/i }

export async function handler(ctx) {
  const list = ITEMS.map((it) => {
    const nm = ctx.lang === 'en' ? it.name.en : it.name.id
    return it.emoji + ' ' + nm + ' (' + it.id + ') ' + it.price + ' koin [' + it.rarity + ']'
  }).join('\n┊ ')
  return ctx.reply(ctx.t('rpgcat.body', {
    list,
    items: ITEMS.length,
    recipes: RECIPES.length,
    monsters: MONSTERS.length,
    pets: PETS.length,
  }))
}
