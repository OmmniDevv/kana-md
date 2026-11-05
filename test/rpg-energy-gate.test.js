import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { crimeHandler } from '../src/rpg/crime-handler.js'
import { handler as cafeHandler } from '../plugins/rpg/cafe.js'
import { getProfile } from '../src/services/user-service.js'

// Regresi sapuan live P9 (2026-11-05): crime-handler dan cafe memanggil
// consumeEnergy (async, tanda tangan storage/digits/amount) TANPA await
// dan dengan argumen tertukar (profil sebagai storage). Janji yang
// menggantung meledak sebagai unhandled rejection dan membunuh proses
// driver di tengah irisan; gerbang energinya pun tidak pernah bekerja.
// Tes ini mengunci perilaku yang benar: gerbang energi membaca profil,
// energi terpotong dan tersimpan, dan tidak ada janji menggantung.

const DIGITS = '628111222333'

function fakeCtx(storage, text = '') {
  const replies = []
  return {
    replies,
    storage,
    senderDigits: DIGITS,
    pushName: 'LiveTest',
    text,
    t: (key, vars = {}) => `${key} ${JSON.stringify(vars)}`,
    say: () => '',
    reply: async (txt) => { replies.push(txt) },
  }
}

test('crime: energi cukup -> aksi jalan dan energi terpotong tersimpan', async () => {
  const storage = memoryStorage()
  await storage.set('users', DIGITS, { energy: 100, balance: 0 })
  const ctx = fakeCtx(storage)
  await crimeHandler('copet')(ctx)
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], /copet\.(success|caught)/)
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.energy, 90)
})

test('crime: energi kurang -> balasan lowEnergy dan energi tidak berubah', async () => {
  const storage = memoryStorage()
  await storage.set('users', DIGITS, { energy: 5, balance: 0 })
  const ctx = fakeCtx(storage)
  await crimeHandler('copet')(ctx)
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], /copet\.lowEnergy/)
  const profile = await getProfile(storage, DIGITS)
  assert.equal(profile.energy, 5)
})

test('cafe layani: energi kurang -> lowEnergy; energi cukup -> terlayani dan terpotong', async () => {
  const lowStorage = memoryStorage()
  await lowStorage.set('users', DIGITS, {
    energy: 5, balance: 100,
    cafe: { name: 'Kafe Uji', open: true, level: 1, stock: 10, served: 0, earned: 0 },
  })
  const lowCtx = fakeCtx(lowStorage, 'layani')
  await cafeHandler(lowCtx)
  assert.match(lowCtx.replies[0], /cafe\.lowEnergy/)
  assert.equal((await getProfile(lowStorage, DIGITS)).energy, 5)

  const okStorage = memoryStorage()
  await okStorage.set('users', DIGITS, {
    energy: 100, balance: 100,
    cafe: { name: 'Kafe Uji', open: true, level: 1, stock: 10, served: 0, earned: 0 },
  })
  const okCtx = fakeCtx(okStorage, 'layani')
  await cafeHandler(okCtx)
  await new Promise((r) => setTimeout(r, 20))
  assert.match(okCtx.replies[0], /cafe\.served/)
  assert.equal((await getProfile(okStorage, DIGITS)).energy, 90)
})
