// Engine RPG KANA: semua logika permainan (klaim, gather, craft, toko, bank,
// duel, dungeon, pet, clan). Plugin hanya membungkus fungsi di sini.
// Semua fungsi menerima rng opsional (default Math.random) agar bisa dites
// deterministik. Profil memakai user-service (balance, inventory, xp).
import { getProfile, updateProfile, addXp, levelFromXp, wibDateString } from '../services/user-service.js'
import {
  ITEM_MAP,
  GATHER_TABLES,
  RECIPE_MAP,
  MONSTERS,
  JOB_MAP,
  SHOP_MAP,
  PET_MAP,
  SHADOW_CLANS,
  POWER_ITEMS,
  CLAIM_REWARDS,
} from './data.js'

const HOUR_MS = 3600_000
const WEEK_MS = 7 * 24 * HOUR_MS
const RARITY_WEIGHT = { common: 10, uncommon: 6, rare: 3, epic: 1 }

function invAdd(profile, itemId, qty) {
  profile.inventory = profile.inventory ?? {}
  profile.inventory[itemId] = (profile.inventory[itemId] ?? 0) + qty
  if (profile.inventory[itemId] <= 0) delete profile.inventory[itemId]
}

function pickWeighted(ids, rng) {
  const weights = ids.map((id) => RARITY_WEIGHT[ITEM_MAP[id]?.rarity] ?? 5)
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (let i = 0; i < ids.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return ids[i]
  }
  return ids[ids.length - 1]
}

function coinsInRange([min, max], rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

// Klaim berkala: daily (tanggal WIB), hourly (1 jam), weekly (7 hari).
export async function claim(storage, digits, kind, now = new Date()) {
  const reward = CLAIM_REWARDS[kind]
  if (!reward) return { ok: false, reason: 'unknown_kind' }
  const profile = await getProfile(storage, digits)
  const nowMs = now.getTime()
  if (kind === 'daily') {
    const today = wibDateString(now)
    if (profile.lastDaily === today) {
      const next = new Date(nowMs + 24 * HOUR_MS)
      return { ok: false, reason: 'cooldown', waitMs: 24 * HOUR_MS }
    }
    await updateProfile(storage, digits, { balance: (profile.balance ?? 0) + reward.coins, lastDaily: today })
  } else if (kind === 'hourly') {
    const last = Number(profile.lastHourly) || 0
    if (nowMs - last < HOUR_MS) return { ok: false, reason: 'cooldown', waitMs: HOUR_MS - (nowMs - last) }
    await updateProfile(storage, digits, { balance: (profile.balance ?? 0) + reward.coins, lastHourly: nowMs })
  } else if (kind === 'weekly') {
    const last = Date.parse(profile.lastWeekly || '') || 0
    if (nowMs - last < WEEK_MS) return { ok: false, reason: 'cooldown', waitMs: WEEK_MS - (nowMs - last) }
    await updateProfile(storage, digits, {
      balance: (profile.balance ?? 0) + reward.coins,
      lastWeekly: new Date(nowMs).toISOString(),
    })
  }
  const xp = await addXp(storage, digits, reward.xp)
  return { ok: true, reward, balance: xp.profile.balance ?? 0 }
}

// Aktivitas mengumpulkan: mining, fishing, hunting, farming.
export async function gather(storage, digits, activity, rng = Math.random) {
  const table = GATHER_TABLES[activity]
  if (!table) return { items: [], coins: 0, failed: true }
  if (rng() < 0.15) return { items: [], coins: 0, failed: true }
  const profile = await getProfile(storage, digits)
  const picks = 1 + Math.floor(rng() * 3)
  const found = new Map()
  for (let i = 0; i < picks; i++) {
    const id = pickWeighted(table, rng)
    found.set(id, (found.get(id) ?? 0) + 1)
  }
  // Bonus job yang cocok: peluang hasil tambahan satu item.
  const job = JOB_MAP[profile.job]
  if (job && job.bonus.activity === activity && rng() < 0.5) {
    const id = pickWeighted(table, rng)
    found.set(id, (found.get(id) ?? 0) + 1)
  }
  const coins = 10 + Math.floor(rng() * 41)
  for (const [id, qty] of found) invAdd(profile, id, qty)
  profile.balance = (profile.balance ?? 0) + coins
  await updateProfile(storage, digits, { inventory: profile.inventory, balance: profile.balance })
  await addXp(storage, digits, 5)
  return { items: [...found.entries()].map(([id, qty]) => ({ id, qty })), coins, failed: false }
}

export async function craftItem(storage, digits, recipeId, rng = Math.random) {
  const recipe = RECIPE_MAP[recipeId]
  if (!recipe) return { ok: false, reason: 'unknown_recipe' }
  const profile = await getProfile(storage, digits)
  profile.inventory = profile.inventory ?? {}
  const needs = { ...recipe.needs }
  // Job pengrajin: 20 persen peluang satu bahan acak tidak berkurang.
  let savedItem = null
  const job = JOB_MAP[profile.job]
  if (job && job.bonus.activity === 'craft' && rng() < job.bonus.percent / 100) {
    const keys = Object.keys(needs)
    savedItem = keys[Math.floor(rng() * keys.length)]
    needs[savedItem] = Math.max(0, needs[savedItem] - 1)
  }
  for (const [id, qty] of Object.entries(needs)) {
    if ((profile.inventory[id] ?? 0) < qty) return { ok: false, reason: 'missing_materials', recipe, needs }
  }
  for (const [id, qty] of Object.entries(needs)) invAdd(profile, id, -qty)
  for (const [id, qty] of Object.entries(recipe.gives)) invAdd(profile, id, qty)
  await updateProfile(storage, digits, { inventory: profile.inventory })
  await addXp(storage, digits, 8)
  return { ok: true, recipe, savedItem }
}

export async function buyItem(storage, digits, itemId, qty = 1) {
  const entry = SHOP_MAP[itemId]
  if (!entry) return { ok: false, reason: 'not_sold' }
  const n = Math.max(1, Math.floor(Number(qty) || 1))
  const profile = await getProfile(storage, digits)
  const cost = entry.price * n
  if ((profile.balance ?? 0) < cost) return { ok: false, reason: 'no_coins', cost }
  invAdd(profile, itemId, n)
  profile.balance = (profile.balance ?? 0) - cost
  await updateProfile(storage, digits, { inventory: profile.inventory, balance: profile.balance })
  return { ok: true, itemId, qty: n, cost, balance: profile.balance }
}

export async function sellItem(storage, digits, itemId, qty = 1) {
  const item = ITEM_MAP[itemId]
  if (!item) return { ok: false, reason: 'unknown_item' }
  const n = Math.max(1, Math.floor(Number(qty) || 1))
  const profile = await getProfile(storage, digits)
  profile.inventory = profile.inventory ?? {}
  if ((profile.inventory[itemId] ?? 0) < n) return { ok: false, reason: 'no_item' }
  let unit = item.price
  const job = JOB_MAP[profile.job]
  if (job && job.bonus.activity === 'sell') unit = Math.floor(unit * (1 + job.bonus.percent / 100))
  const gain = unit * n
  invAdd(profile, itemId, -n)
  profile.balance = (profile.balance ?? 0) + gain
  await updateProfile(storage, digits, { inventory: profile.inventory, balance: profile.balance })
  return { ok: true, itemId, qty: n, gain, balance: profile.balance }
}

export async function bankDeposit(storage, digits, amount) {
  const profile = await getProfile(storage, digits)
  const bank = profile.bank ?? 0
  const n = amount === 'all' ? (profile.balance ?? 0) : Math.floor(Number(amount) || 0)
  if (n <= 0) return { ok: false, reason: 'invalid_amount' }
  if ((profile.balance ?? 0) < n) return { ok: false, reason: 'no_coins' }
  await updateProfile(storage, digits, { balance: (profile.balance ?? 0) - n, bank: bank + n })
  return { ok: true, amount: n, balance: (profile.balance ?? 0) - n, bank: bank + n }
}

export async function bankWithdraw(storage, digits, amount) {
  const profile = await getProfile(storage, digits)
  const bank = profile.bank ?? 0
  const n = amount === 'all' ? bank : Math.floor(Number(amount) || 0)
  if (n <= 0) return { ok: false, reason: 'invalid_amount' }
  if (bank < n) return { ok: false, reason: 'no_bank' }
  await updateProfile(storage, digits, { balance: (profile.balance ?? 0) + n, bank: bank - n })
  return { ok: true, amount: n, balance: (profile.balance ?? 0) + n, bank: bank - n }
}

// Power tempur: level, alat yang dimiliki, level pet, dan stat yang dibeli
// (profile.stats dari src/rpg/stats.js: attack/strength berbobot 2,
// defense/speed berbobot 1).
export function powerOf(profile) {
  let power = levelFromXp(profile.xp ?? 0) * 5
  const inv = profile.inventory ?? {}
  for (const [id, bonus] of Object.entries(POWER_ITEMS)) {
    if ((inv[id] ?? 0) > 0) power += bonus
  }
  if (profile.pet) power += (profile.pet.level ?? 1) * 3
  const stats = profile.stats ?? {}
  power += (Number(stats.attack) || 0) * 2
  power += (Number(stats.strength) || 0) * 2
  power += (Number(stats.defense) || 0)
  power += (Number(stats.speed) || 0)
  return power
}

export async function duel(storage, digitsA, digitsB, rng = Math.random) {
  const a = await getProfile(storage, digitsA)
  const b = await getProfile(storage, digitsB)
  const powerA = powerOf(a) + Math.floor(rng() * 21)
  const powerB = powerOf(b) + Math.floor(rng() * 21)
  const aWins = powerA >= powerB
  const winnerDigits = aWins ? digitsA : digitsB
  const loserDigits = aWins ? digitsB : digitsA
  const winner = aWins ? a : b
  const loser = aWins ? b : a
  const coins = Math.min(100, loser.balance ?? 0)
  await updateProfile(storage, loserDigits, { balance: (loser.balance ?? 0) - coins })
  await updateProfile(storage, winnerDigits, { balance: (winner.balance ?? 0) + coins })
  await addXp(storage, winnerDigits, 15)
  return { winner: winnerDigits, loser: loserDigits, powerA, powerB, coins }
}

// Dungeon: 3 gelombang monster bertingkat; berhenti di gelombang yang kalah.
export async function runDungeon(storage, digits, rng = Math.random) {
  const profile = await getProfile(storage, digits)
  const basePower = powerOf(profile)
  const sorted = [...MONSTERS].sort((x, y) => x.power - y.power)
  const rewards = []
  let totalCoins = 0
  const gained = {}
  for (let wave = 0; wave < 3; wave++) {
    const idx = Math.min(sorted.length - 1, wave * 2 + Math.floor(rng() * 2))
    const monster = sorted[idx]
    const roll = basePower + Math.floor(rng() * 21)
    if (roll < monster.power) break
    const coins = coinsInRange(monster.reward.coins, rng)
    totalCoins += coins
    const entry = { monster: monster.id, coins }
    if (monster.reward.item && rng() < 0.6) {
      entry.item = monster.reward.item
      gained[monster.reward.item] = (gained[monster.reward.item] ?? 0) + 1
    }
    rewards.push(entry)
  }
  const cleared = rewards.length
  if (cleared > 0) {
    const fresh = await getProfile(storage, digits)
    for (const [id, qty] of Object.entries(gained)) invAdd(fresh, id, qty)
    await updateProfile(storage, digits, {
      inventory: fresh.inventory,
      balance: (fresh.balance ?? 0) + totalCoins,
    })
    await addXp(storage, digits, cleared * 10)
  }
  return { cleared, rewards, totalCoins, power: basePower }
}

export async function petAdopt(storage, digits, kind) {
  const petDef = PET_MAP[kind]
  if (!petDef) return { ok: false, reason: 'unknown_kind' }
  const profile = await getProfile(storage, digits)
  if (profile.pet) return { ok: false, reason: 'has_pet' }
  const pet = { kind, name: petDef.name.id, level: 1, xp: 0, fedAt: null }
  await updateProfile(storage, digits, { pet })
  return { ok: true, pet }
}

export async function petFeed(storage, digits) {
  const profile = await getProfile(storage, digits)
  if (!profile.pet) return { ok: false, reason: 'no_pet' }
  profile.inventory = profile.inventory ?? {}
  if ((profile.inventory.makananpet ?? 0) < 1) return { ok: false, reason: 'no_food' }
  invAdd(profile, 'makananpet', -1)
  const pet = { ...profile.pet }
  pet.xp = (pet.xp ?? 0) + 25
  pet.level = 1 + Math.floor(pet.xp / 100)
  pet.fedAt = new Date().toISOString()
  await updateProfile(storage, digits, { inventory: profile.inventory, pet })
  return { ok: true, pet }
}

export function slugify(name) {
  return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function createClan(storage, digits, name) {
  const id = slugify(name)
  if (!id) return { ok: false, reason: 'invalid_name' }
  const profile = await getProfile(storage, digits)
  if (profile.clanId) return { ok: false, reason: 'already_in_clan' }
  const existing = await storage.get('clans', id)
  if (existing) return { ok: false, reason: 'name_taken' }
  const clan = { id, name: String(name).trim(), owner: digits, members: [digits], power: 0, bank: 0, lastWar: '' }
  await storage.set('clans', id, clan)
  await updateProfile(storage, digits, { clanId: id })
  return { ok: true, clan }
}

export async function joinClan(storage, digits, clanId) {
  const clan = await storage.get('clans', clanId)
  if (!clan) return { ok: false, reason: 'not_found' }
  const profile = await getProfile(storage, digits)
  if (profile.clanId) return { ok: false, reason: 'already_in_clan' }
  clan.members = [...new Set([...(clan.members ?? []), digits])]
  await storage.set('clans', clan.id, clan)
  await updateProfile(storage, digits, { clanId: clan.id })
  return { ok: true, clan }
}

export async function getClan(storage, clanId) {
  if (!clanId) return null
  return (await storage.get('clans', clanId)) ?? null
}

export async function clanPower(storage, clan) {
  let total = 0
  const members = (clan.members ?? []).slice(0, 20)
  for (const member of members) {
    const profile = await getProfile(storage, member)
    total += powerOf(profile)
  }
  return total
}

export async function clanWar(storage, digits, rng = Math.random, now = new Date()) {
  const profile = await getProfile(storage, digits)
  if (!profile.clanId) return { ok: false, reason: 'no_clan' }
  const clan = await getClan(storage, profile.clanId)
  if (!clan) return { ok: false, reason: 'no_clan' }
  const today = wibDateString(now)
  if (clan.lastWar === today) return { ok: false, reason: 'cooldown' }
  const myPower = (await clanPower(storage, clan)) + Math.floor(rng() * 21)
  // Lawan: clan lain yang terdaftar, atau clan bayangan bila tidak ada.
  let oppName = ''
  let oppPower = 0
  let oppClan = null
  const keys = typeof storage.keys === 'function' ? await storage.keys('clans') : []
  const others = keys.filter((k) => k !== clan.id)
  if (others.length) {
    const pick = others[Math.floor(rng() * others.length)]
    oppClan = await getClan(storage, pick)
    oppName = oppClan.name
    oppPower = (await clanPower(storage, oppClan)) + Math.floor(rng() * 21)
  } else {
    const shadow = SHADOW_CLANS[Math.floor(rng() * SHADOW_CLANS.length)]
    oppName = shadow.name
    oppPower = shadow.power[0] + Math.floor(rng() * (shadow.power[1] - shadow.power[0] + 1))
  }
  const win = myPower >= oppPower
  const reward = win ? 500 : 100
  clan.bank = (clan.bank ?? 0) + reward
  clan.lastWar = today
  clan.power = await clanPower(storage, clan)
  await storage.set('clans', clan.id, clan)
  if (oppClan) {
    oppClan.lastWar = today
    await storage.set('clans', oppClan.id, oppClan)
  }
  if (win) await addXp(storage, digits, 30)
  return { ok: true, win, myClan: clan.name, oppName, myPower, oppPower, reward, clanBank: clan.bank }
}
