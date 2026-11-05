import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'harta',
  alias: ['gali'],
  category: 'rpg',
  description: { id: 'Ekspedisi harta karun: bayar 100 koin, gali, dan lihat apa yang kamu dapat', en: 'Treasure expedition: pay 100 coins, dig, and see what you get' },
  usage: '.harta',
  example: '.harta',
  cooldown: 60,
}

export const COST = 100

export const i18n = {
  id: {
    harta: {
      jackpot: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ JACKPOT! Galianmu menemukan peti harta karun berisi *{coins} koin*! Untung bersih {profit} koin {mood}\n╰━━━━━━━',
      coins: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ Kamu menggali dan menemukan kantong koin berisi *{coins} koin*. Lumayan~ {mood}\n╰━━━━━━━',
      item: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ Galianmu menemukan *{item}* yang masih bagus. Masuk tas yaa~ {mood}\n╰━━━━━━━',
      empty: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ Sudah menggali jauh, yang ketemu cuma sepatu tua sebelah. Harta karunnya belum jodoh hari ini {mood}\n╰━━━━━━━',
      poor: '╭─❏ ✨ 「 *HARTA* 」\n┊ Ekspedisi harta butuh biaya {cost} koin, koinmu baru {coins}. Kumpulkan dulu lewat .kerja atau .daily yaa~ {mood}\n╰━━━━━━━',
    },
  },
  en: {
    harta: {
      jackpot: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ JACKPOT! Your digging found a treasure chest with *{coins} coins*! Net profit {profit} coins {mood}\n╰━━━━━━━',
      coins: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ You dug and found a coin pouch with *{coins} coins*. Not bad~ {mood}\n╰━━━━━━━',
      item: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ Your digging found a still good *{item}*. Into the bag it goes~ {mood}\n╰━━━━━━━',
      empty: '╭─❏ 🗺️ 「 *HARTA* 」\n┊ 🗺️ You dug deep and only found one old shoe. The treasure is not meant to be today {mood}\n╰━━━━━━━',
      poor: '╭─❏ ✨ 「 *HARTA* 」\n┊ A treasure expedition costs {cost} coins, you only have {coins}. Earn some first with .kerja or .daily~ {mood}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.harta', expect: /harta|treasure/i }

const LOOT_ITEMS = ['kristal', 'besi', 'tanduk', 'telurmisterius']

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if ((profile.balance ?? 0) < COST) {
    return ctx.reply(ctx.t('harta.poor', { cost: COST, coins: profile.balance ?? 0, mood: ctx.say('gagal') }))
  }
  let balance = (profile.balance ?? 0) - COST
  const roll = Math.random()
  if (roll < 0.12) {
    const coins = 500 + Math.floor(Math.random() * 600)
    balance += coins
    await updateProfile(ctx.storage, ctx.senderDigits, { balance })
    await addXp(ctx.storage, ctx.senderDigits, 15)
    return ctx.reply(ctx.t('harta.jackpot', { coins, profit: coins - COST, mood: ctx.say('sukses') }))
  }
  if (roll < 0.5) {
    const coins = 60 + Math.floor(Math.random() * 180)
    balance += coins
    await updateProfile(ctx.storage, ctx.senderDigits, { balance })
    await addXp(ctx.storage, ctx.senderDigits, 8)
    return ctx.reply(ctx.t('harta.coins', { coins, mood: ctx.say('senang') }))
  }
  if (roll < 0.72) {
    const itemId = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)]
    const inventory = { ...(profile.inventory ?? {}) }
    inventory[itemId] = (inventory[itemId] ?? 0) + 1
    await updateProfile(ctx.storage, ctx.senderDigits, { balance, inventory })
    await addXp(ctx.storage, ctx.senderDigits, 8)
    const item = ITEM_MAP[itemId]
    return ctx.reply(ctx.t('harta.item', { item: item ? (ctx.lang === 'en' ? item.name?.en ?? itemId : item.name?.id ?? itemId) : itemId, mood: ctx.say('senang') }))
  }
  await updateProfile(ctx.storage, ctx.senderDigits, { balance })
  await addXp(ctx.storage, ctx.senderDigits, 3)
  return ctx.reply(ctx.t('harta.empty', { mood: ctx.say('gagal') }))
}
