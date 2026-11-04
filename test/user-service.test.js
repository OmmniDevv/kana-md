import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addXp,
  consumeLimit,
  getProfile,
  levelFromXp,
  updateProfile,
  xpForLevel,
  xpLeaderboard,
  DEFAULT_DAILY_LIMIT,
} from '../src/services/user-service.js'

export function memoryStorage() {
  const map = new Map()
  const ns = (n) => {
    if (!map.has(n)) map.set(n, new Map())
    return map.get(n)
  }
  return {
    driver: 'memory',
    async get(n, k) {
      return ns(n).get(k)
    },
    async set(n, k, v) {
      ns(n).set(k, v)
    },
    async delete(n, k) {
      ns(n).delete(k)
    },
    async keys(n) {
      return [...ns(n).keys()]
    },
  }
}

test('levelFromXp dan xpForLevel konsisten', () => {
  assert.equal(levelFromXp(0), 1)
  assert.equal(levelFromXp(49), 1)
  assert.equal(levelFromXp(50), 2)
  assert.equal(levelFromXp(200), 3)
  assert.equal(levelFromXp(450), 4)
  assert.equal(xpForLevel(1), 0)
  assert.equal(xpForLevel(3), 200)
})

test('addXp menambah XP dan mendeteksi naik level', async () => {
  const storage = memoryStorage()
  const first = await addXp(storage, '628111', 40)
  assert.equal(first.leveledUp, false)
  assert.equal(first.profile.xp, 40)
  const second = await addXp(storage, '628111', 15)
  assert.equal(second.leveledUp, true)
  assert.equal(second.level, 2)
})

test('consumeLimit: habis di batas harian, reset keesokan hari', async () => {
  const storage = memoryStorage()
  const digits = '628222'
  const big = await consumeLimit(storage, digits, DEFAULT_DAILY_LIMIT)
  assert.equal(big.ok, true)
  assert.equal(big.left, 0)
  const blocked = await consumeLimit(storage, digits, 1)
  assert.equal(blocked.ok, false)
  // Geser tanggal profil ke kemarin: limit harus reset penuh.
  const profile = await getProfile(storage, digits)
  profile.limitDate = '2000-01-01'
  await updateProfile(storage, digits, { limitDate: '2000-01-01', limitLeft: 0 })
  const again = await consumeLimit(storage, digits, 1)
  assert.equal(again.ok, true)
  assert.equal(again.left, DEFAULT_DAILY_LIMIT - 1)
})

test('xpLeaderboard mengurutkan XP tertinggi dan melewati key non-digit', async () => {
  const storage = memoryStorage()
  await addXp(storage, '628333', 120)
  await addXp(storage, '628444', 500)
  await storage.set('users', '628333:lang', 'id')
  const board = await xpLeaderboard(storage, 10)
  assert.deepEqual(
    board.map((r) => r.digits),
    ['628444', '628333']
  )
  assert.equal(board[0].level, levelFromXp(500))
})
