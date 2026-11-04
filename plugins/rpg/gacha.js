import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'gacha',
  alias: [],
  category: 'rpg',
  description: { id: 'Putar gacha 100 koin untuk dapat item acak', en: 'Spin the 100 coin gacha for a random item' },
  usage: '.gacha',
  example: '.gacha',
  cooldown: 3,
}

export const GACHA_COST = 100

// Pool bawaan dipakai bila src/rpg/data.js belum tersedia atau impornya
// gagal. Nama item yang masuk inventory adalah id item.
export const FALLBACK_POOL = [
  { id: 'potion-kecil', name: 'Potion Kecil', emoji: '🧪', rarity: 'common' },
  { id: 'roti-tawar', name: 'Roti Tawar', emoji: '🍞', rarity: 'common' },
  { id: 'batu-sungai', name: 'Batu Sungai', emoji: '🪨', rarity: 'common' },
  { id: 'perisai-kayu', name: 'Perisai Kayu', emoji: '🛡️', rarity: 'uncommon' },
  { id: 'pedang-latihan', name: 'Pedang Latihan', emoji: '🗡️', rarity: 'uncommon' },
  { id: 'jubah-penjelajah', name: 'Jubah Penjelajah', emoji: '🧥', rarity: 'rare' },
  { id: 'kalung-bulan', name: 'Kalung Bulan', emoji: '📿', rarity: 'rare' },
  { id: 'sayap-pegasus', name: 'Sayap Pegasus', emoji: '🪽', rarity: 'epic' },
  { id: 'mahkota-bintang', name: 'Mahkota Bintang', emoji: '👑', rarity: 'epic' },
  { id: 'telur-naga', name: 'Telur Naga', emoji: '🥚', rarity: 'legendary' },
]

const RARITY_WEIGHTS = { common: 50, uncommon: 25, rare: 15, epic: 7, legendary: 3 }
export const RARITY_EMOJI = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' }

export function pickWeighted(pool, rng = Math.random) {
  const entries = (pool ?? []).filter((item) => item && (item.id || item.name))
  if (!entries.length) return null
  const weights = entries.map((item) => RARITY_WEIGHTS[String(item.rarity || 'common').toLowerCase()] ?? 10)
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (let i = 0; i < entries.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return entries[i]
  }
  return entries[entries.length - 1]
}

async function loadPool() {
  try {
    const mod = await import('../../src/rpg/data.js')
    const raw = mod.ITEMS ?? mod.items ?? mod.default?.ITEMS
    const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : null
    if (list && list.length) return list
  } catch {
    // data RPG belum ada: pakai pool bawaan.
  }
  return FALLBACK_POOL
}

export const i18n = {
  id: {
    gacha: {
      title: 'Gacha KANA 🎁',
      noBalance: 'Mouu, gacha butuh {cost} koin, saldo kamu cuma {balance} koin (╥﹏╥) Ambil jatah harianmu dulu yaa~',
      result: 'Putar putar putar... 🎁\nKamu dapat: {emoji} {name}\nRarity: {rarityEmoji} {rarity}\nBiaya {cost} koin, saldo sekarang {balance} koin.\n\n{mood}',
      btnAgain: 'Gacha Lagi',
      btnInventory: 'Inventory',
      btnShop: 'Shop',
      btnDaily: 'Ambil Daily',
    },
  },
  en: {
    gacha: {
      title: 'KANA Gacha 🎁',
      noBalance: 'Mouu, gacha costs {cost} coins, your balance is only {balance} coins (╥﹏╥) Claim your daily first~',
      result: 'Spinning spinning... 🎁\nYou got: {emoji} {name}\nRarity: {rarityEmoji} {rarity}\nCost {cost} coins, balance now {balance} coins.\n\n{mood}',
      btnAgain: 'Spin Again',
      btnInventory: 'Inventory',
      btnShop: 'Shop',
      btnDaily: 'Claim Daily',
    },
  },
}

export const test = { input: '.gacha', expect: /gacha/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance || 0
  if (balance < GACHA_COST) {
    const body = ctx.t('gacha.noBalance', { cost: GACHA_COST, balance })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('gacha.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('gacha.btnDaily'), id: '.daily' }],
      textFallback: body,
    })
  }
  const pool = await loadPool()
  const item = pickWeighted(pool)
  const itemId = String(item.id ?? item.name)
  const inventory = profile.inventory && typeof profile.inventory === 'object' ? { ...profile.inventory } : {}
  if (Array.isArray(inventory)) inventory.push(itemId)
  else inventory[itemId] = (Number(inventory[itemId]) || 0) + 1
  const updated = await updateProfile(ctx.storage, ctx.senderDigits, {
    balance: balance - GACHA_COST,
    inventory,
  })
  const rarity = String(item.rarity || 'common')
  const body = ctx.t('gacha.result', {
    emoji: item.emoji || RARITY_EMOJI[rarity.toLowerCase()] || '🎁',
    name: item.name || itemId,
    rarityEmoji: RARITY_EMOJI[rarity.toLowerCase()] || '⚪',
    rarity,
    cost: GACHA_COST,
    balance: updated.balance,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gacha.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('gacha.btnAgain'), id: '.gacha' },
      { text: ctx.t('gacha.btnInventory'), id: '.inventory' },
      { text: ctx.t('gacha.btnShop'), id: '.shop' },
    ],
    textFallback: body,
  })
}
