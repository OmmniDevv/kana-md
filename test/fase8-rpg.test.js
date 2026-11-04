import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { getProfile, updateProfile } from '../src/services/user-service.js'
import {
  claim,
  gather,
  craftItem,
  buyItem,
  sellItem,
  bankDeposit,
  bankWithdraw,
  powerOf,
  duel,
  runDungeon,
  petAdopt,
  petFeed,
  createClan,
  joinClan,
  clanPower,
  clanWar,
} from '../src/rpg/engine.js'
import { ITEMS, RECIPES, MONSTERS, JOBS, SHOP } from '../src/rpg/data.js'

// rng deterministik sederhana (LCG) untuk tes yang butuh hasil tetap.
function seeded(seed = 42) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
const alwaysLow = () => 0.01 // tidak pernah gagal gather, roll kecil
const alwaysHigh = () => 0.99

test('data RPG memenuhi hitungan minimum', () => {
  assert.ok(ITEMS.length >= 24, `ITEMS ${ITEMS.length}`)
  assert.ok(RECIPES.length >= 8, `RECIPES ${RECIPES.length}`)
  assert.ok(MONSTERS.length >= 8, `MONSTERS ${MONSTERS.length}`)
  assert.ok(JOBS.length >= 6, `JOBS ${JOBS.length}`)
  assert.ok(SHOP.length >= 5)
  const ids = new Set(ITEMS.map((i) => i.id))
  assert.equal(ids.size, ITEMS.length)
  for (const r of RECIPES) {
    for (const id of [...Object.keys(r.needs), ...Object.keys(r.gives)]) assert.ok(ids.has(id), `resep ${r.id} memakai item tak dikenal ${id}`)
  }
  for (const s of SHOP) assert.ok(ids.has(s.id), `shop item tak dikenal ${s.id}`)
})

test('claim daily memberi koin dan klaim kedua ditolak', async () => {
  const storage = memoryStorage()
  const now = new Date('2026-11-04T05:00:00Z')
  const first = await claim(storage, '628101', 'daily', now)
  assert.equal(first.ok, true)
  assert.equal(first.reward.coins, 500)
  const profile = await getProfile(storage, '628101')
  assert.equal(profile.balance, 500)
  assert.equal(profile.xp, 20)
  const second = await claim(storage, '628101', 'daily', now)
  assert.equal(second.ok, false)
  assert.equal(second.reason, 'cooldown')
  const after = await getProfile(storage, '628101')
  assert.equal(after.balance, 500)
})

test('claim hourly dan weekly mengikuti pola cooldown yang sama', async () => {
  const storage = memoryStorage()
  const now = new Date('2026-11-04T05:00:00Z')
  const h1 = await claim(storage, '628102', 'hourly', now)
  assert.equal(h1.ok, true)
  assert.equal(h1.reward.coins, 100)
  const h2 = await claim(storage, '628102', 'hourly', new Date(now.getTime() + 10 * 60000))
  assert.equal(h2.ok, false)
  const h3 = await claim(storage, '628102', 'hourly', new Date(now.getTime() + 61 * 60000))
  assert.equal(h3.ok, true)
  const w1 = await claim(storage, '628102', 'weekly', now)
  assert.equal(w1.ok, true)
  assert.equal(w1.reward.coins, 3000)
  const w2 = await claim(storage, '628102', 'weekly', new Date(now.getTime() + 24 * 3600000))
  assert.equal(w2.ok, false)
  const w3 = await claim(storage, '628102', 'weekly', new Date(now.getTime() + 8 * 24 * 3600000))
  assert.equal(w3.ok, true)
})

test('gather memberi item dan koin, dan bisa gagal secara wajar', async () => {
  const storage = memoryStorage()
  const ok = await gather(storage, '628103', 'mining', seeded(7))
  assert.equal(ok.failed, false)
  assert.ok(ok.items.length >= 1)
  assert.ok(ok.coins >= 10)
  const profile = await getProfile(storage, '628103')
  const invTotal = Object.values(profile.inventory).reduce((a, b) => a + b, 0)
  assert.equal(invTotal, ok.items.reduce((a, i) => a + i.qty, 0))
  assert.equal(profile.balance, ok.coins)
})

test('gather gagal bila rng di bawah ambang 15 persen', async () => {
  const storage = memoryStorage()
  let calls = 0
  const rng = () => (calls++ === 0 ? 0.05 : 0.5)
  const res = await gather(storage, '628105', 'hunting', rng)
  assert.equal(res.failed, true)
  assert.deepEqual(res.items, [])
  assert.equal(res.coins, 0)
})

test('craft mengurangi bahan dan menambah hasil, tanpa bahan ditolak', async () => {
  const storage = memoryStorage()
  const denied = await craftItem(storage, '628106', 'papan', seeded(1))
  assert.equal(denied.ok, false)
  assert.equal(denied.reason, 'missing_materials')
  await updateProfile(storage, '628106', { inventory: { kayu: 3 } })
  const made = await craftItem(storage, '628106', 'papan', seeded(1))
  assert.equal(made.ok, true)
  const profile = await getProfile(storage, '628106')
  assert.equal(profile.inventory.kayu ?? 0, 0)
  assert.equal(profile.inventory.papan, 2)
})

test('buy mengurangi saldo dan saldo kurang ditolak, sell menambah saldo', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, '628107', { balance: 150 })
  const poor = await buyItem(storage, '628107', 'pedangbesi', 1)
  assert.equal(poor.ok, false)
  assert.equal(poor.reason, 'no_coins')
  const bought = await buyItem(storage, '628107', 'makananpet', 1)
  assert.equal(bought.ok, true)
  assert.equal(bought.cost, 100)
  let profile = await getProfile(storage, '628107')
  assert.equal(profile.balance, 50)
  assert.equal(profile.inventory.makananpet, 1)
  const sold = await sellItem(storage, '628107', 'makananpet', 1)
  assert.equal(sold.ok, true)
  assert.equal(sold.gain, 60)
  profile = await getProfile(storage, '628107')
  assert.equal(profile.balance, 110)
})

test('bank simpan dan ambil tidak bisa negatif', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, '628108', { balance: 300 })
  const dep = await bankDeposit(storage, '628108', 200)
  assert.equal(dep.ok, true)
  assert.equal(dep.balance, 100)
  assert.equal(dep.bank, 200)
  const tooMuch = await bankWithdraw(storage, '628108', 500)
  assert.equal(tooMuch.ok, false)
  const depTooMuch = await bankDeposit(storage, '628108', 999)
  assert.equal(depTooMuch.ok, false)
  const wd = await bankWithdraw(storage, '628108', 'all')
  assert.equal(wd.ok, true)
  assert.equal(wd.bank, 0)
  assert.equal(wd.balance, 300)
  const profile = await getProfile(storage, '628108')
  assert.equal(profile.bank, 0)
  assert.equal(profile.balance, 300)
})

test('duel deterministik dengan rng tetap dan koin berpindah', async () => {
  const run = async () => {
    const storage = memoryStorage()
    await updateProfile(storage, '628109', { balance: 50, xp: 200, inventory: { pedangbesi: 1 } })
    await updateProfile(storage, '628110', { balance: 500, xp: 0 })
    return { storage, res: await duel(storage, '628109', '628110', seeded(99)) }
  }
  const a = await run()
  const b = await run()
  assert.deepEqual(a.res, b.res)
  assert.equal(a.res.winner, '628109')
  assert.equal(a.res.coins, 100)
  const winner = await getProfile(a.storage, '628109')
  const loser = await getProfile(a.storage, '628110')
  assert.equal(winner.balance, 150)
  assert.equal(loser.balance, 400)
  assert.ok(winner.xp > 200)
  assert.ok(powerOf(winner) >= 5)
})

test('dungeon memberi hadiah saat menang gelombang', async () => {
  const storage = memoryStorage()
  // Power besar: level tinggi plus pedang besi dan perisai.
  await updateProfile(storage, '628111', { xp: 5000, inventory: { pedangbesi: 1, perisai: 1 } })
  const res = await runDungeon(storage, '628111', alwaysLow)
  assert.ok(res.cleared >= 1, `cleared ${res.cleared}`)
  assert.ok(res.totalCoins > 0)
  const profile = await getProfile(storage, '628111')
  assert.equal(profile.balance, res.totalCoins)
  // Pemain lemah: rng urutan membuat gelombang pertama goblin dan roll 0, pasti kalah.
  const seq = [0.99, 0]
  let i = 0
  const weak = await runDungeon(storage, '628112', () => seq[i++] ?? 0.5)
  assert.equal(weak.cleared, 0)
  assert.equal(weak.totalCoins, 0)
})

test('pet adopsi lalu makan menaikkan level pet', async () => {
  const storage = memoryStorage()
  const noPet = await petFeed(storage, '628113')
  assert.equal(noPet.ok, false)
  const adopted = await petAdopt(storage, '628113', 'kucing')
  assert.equal(adopted.ok, true)
  assert.equal(adopted.pet.level, 1)
  const again = await petAdopt(storage, '628113', 'anjing')
  assert.equal(again.ok, false)
  assert.equal(again.reason, 'has_pet')
  const noFood = await petFeed(storage, '628113')
  assert.equal(noFood.ok, false)
  assert.equal(noFood.reason, 'no_food')
  await updateProfile(storage, '628113', { inventory: { makananpet: 4 } })
  let last
  for (let i = 0; i < 4; i++) last = await petFeed(storage, '628113')
  assert.equal(last.ok, true)
  assert.equal(last.pet.xp, 100)
  assert.equal(last.pet.level, 2)
  const profile = await getProfile(storage, '628113')
  assert.equal(profile.inventory.makananpet ?? 0, 0)
})

test('clan buat dan gabung, clanwar memakai power clan', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, '628114', { xp: 5000, inventory: { pedangbesi: 1 } })
  const created = await createClan(storage, '628114', 'Naga Moe')
  assert.equal(created.ok, true)
  assert.equal(created.clan.id, 'naga-moe')
  const dup = await createClan(storage, '628115', 'Naga Moe')
  assert.equal(dup.ok, false)
  const joined = await joinClan(storage, '628115', 'naga-moe')
  assert.equal(joined.ok, true)
  assert.equal(joined.clan.members.length, 2)
  const power = await clanPower(storage, joined.clan)
  assert.ok(power > 0)
  const war = await clanWar(storage, '628114', seeded(3), new Date('2026-11-04T05:00:00Z'))
  assert.equal(war.ok, true)
  assert.ok(war.myPower >= power)
  assert.ok(['boolean'].includes(typeof war.win))
  assert.ok(war.reward >= 100)
  const again = await clanWar(storage, '628114', seeded(3), new Date('2026-11-04T06:00:00Z'))
  assert.equal(again.ok, false)
  assert.equal(again.reason, 'cooldown')
  const noClan = await clanWar(storage, '628199', seeded(3))
  assert.equal(noClan.ok, false)
  assert.equal(noClan.reason, 'no_clan')
})
