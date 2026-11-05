// Stat tempur RPG yang bisa dibeli: attack, defense, speed, strength.
// Tersimpan di profile.stats dan dibaca powerOf (src/rpg/engine.js),
// jadi efeknya nyata di duel, dungeon, arena, dan battle lain.
// Biaya naik per poin yang sudah dimiliki supaya tidak bisa ditimbun murah.
import { getProfile, updateProfile } from '../services/user-service.js'

export const STAT_KEYS = ['attack', 'defense', 'speed', 'strength']

export const STAT_DEFS = {
  attack: { emoji: '⚔️', name: { id: 'Attack', en: 'Attack' }, base: 150, step: 75 },
  defense: { emoji: '🛡️', name: { id: 'Defense', en: 'Defense' }, base: 150, step: 75 },
  speed: { emoji: '💨', name: { id: 'Speed', en: 'Speed' }, base: 120, step: 60 },
  strength: { emoji: '💪', name: { id: 'Strength', en: 'Strength' }, base: 180, step: 90 },
}

export function statsOf(profile) {
  const raw = profile?.stats ?? {}
  const out = {}
  for (const key of STAT_KEYS) out[key] = Math.max(0, Math.floor(Number(raw[key]) || 0))
  return out
}

export function statCost(key, current, qty = 1) {
  const def = STAT_DEFS[key]
  if (!def) return 0
  let total = 0
  for (let i = 0; i < qty; i++) total += def.base + (current + i) * def.step
  return total
}

// Beli qty poin stat. Mengembalikan { ok, reason?, cost?, value?, balance? }.
export async function buyStat(storage, digits, key, qty = 1) {
  const def = STAT_DEFS[key]
  if (!def) return { ok: false, reason: 'unknown_stat' }
  const n = Math.max(1, Math.min(20, Math.floor(Number(qty) || 1)))
  const profile = await getProfile(storage, digits)
  const stats = statsOf(profile)
  const cost = statCost(key, stats[key], n)
  if ((profile.balance ?? 0) < cost) return { ok: false, reason: 'no_coins', cost, value: stats[key] }
  stats[key] += n
  const balance = (profile.balance ?? 0) - cost
  await updateProfile(storage, digits, { stats, balance })
  return { ok: true, key, qty: n, cost, value: stats[key], balance }
}
