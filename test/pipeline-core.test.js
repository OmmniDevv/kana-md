import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPipeline } from '../src/core/pipeline.js'
import { memoryStorage } from './user-service.test.js'

function setup({ plugins = [], befores = [], storage = memoryStorage(), sockExtra = {} } = {}) {
  // Sejak gate daftar wajib (2026-11-04), user uji 628123 dianggap sudah
  // terdaftar supaya tes gates lain (limit, admin, XP) tetap terisolasi.
  const origGet = storage.get.bind(storage)
  storage.get = async (ns, key) => {
    const value = await origGet(ns, key)
    if (ns === 'users' && key === '628123') return { registered: true, ...(value ?? {}) }
    return value
  }
  const byName = new Map(plugins.map((p) => [p.config.name, p]))
  const registry = {
    resolve: (c) => byName.get(c),
    list: () => plugins,
    quarantined: [],
    befores,
    participantHandlers: [],
  }
  const pipeline = createPipeline({ registry, storage, owners: ['628999'], defaultLang: 'id' })
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content) => {
      sent.push({ jid, content })
      return {}
    },
    ...sockExtra,
  }
  return { pipeline, sock, sent, storage }
}

let rawSeq = 0
const rawText = (text, { group = false, sender = '628123@s.whatsapp.net', id = null } = {}) => ({
  key: {
    remoteJid: group ? '120363@g.us' : '628123@s.whatsapp.net',
    participant: group ? sender : undefined,
    fromMe: false,
    id: id ?? `x${++rawSeq}`,
  },
  pushName: 'Senpai',
  message: { conversation: text },
})

test('before hook jalan untuk pesan tanpa prefix dan bisa menghentikan perintah', async () => {
  const seen = []
  const stopper = {
    config: { name: 'stopper', priority: 1 },
    before: async (ctx) => {
      seen.push(ctx.text)
      if (ctx.text.includes('blokir')) return false
      return undefined
    },
  }
  let handled = 0
  const ping = { config: { name: 'ping', cooldown: 0 }, handler: async () => { handled += 1 } }
  const { pipeline, sock } = setup({ plugins: [ping], befores: [stopper] })
  await pipeline.handle(sock, rawText('halo biasa'))
  await pipeline.handle(sock, rawText('.ping blokir dong'))
  await pipeline.handle(sock, rawText('.ping'))
  assert.deepEqual(seen, ['halo biasa', '.ping blokir dong', '.ping'])
  assert.equal(handled, 1)
})

test('limit gate: perintah berbiaya ditolak saat limit habis', async () => {
  let handled = 0
  const play = { config: { name: 'play', cooldown: 0, limit: 30 }, handler: async () => { handled += 1 } }
  const { pipeline, sock, sent } = setup({ plugins: [play] })
  await pipeline.handle(sock, rawText('.play lagu'))
  await pipeline.handle(sock, rawText('.play lagu'))
  assert.equal(handled, 1)
  assert.ok(sent.some((s) => /Limit harian/.test(s.content.text || '')))
})

test('admin gate: non-admin ditolak, admin lolos', async () => {
  let handled = 0
  const kick = { config: { name: 'kick', cooldown: 0, isGroup: true, isAdmin: true }, handler: async () => { handled += 1 } }
  const metadata = {
    participants: [
      { id: '628123@s.whatsapp.net', admin: null },
      { id: '6285187605007@s.whatsapp.net', admin: 'admin' },
    ],
  }
  const { pipeline, sock, sent } = setup({ plugins: [kick], sockExtra: { groupMetadata: async () => metadata } })
  await pipeline.handle(sock, rawText('.kick', { group: true }))
  assert.equal(handled, 0)
  assert.ok(sent.some((s) => /khusus admin grup/.test(s.content.text || '')))
  metadata.participants[0].admin = 'admin'
  await pipeline.handle(sock, rawText('.kick', { group: true }))
  assert.equal(handled, 1)
})

test('pengguna terbanned diam tanpa balasan, mode self diam untuk non-owner', async () => {
  let handled = 0
  const ping = { config: { name: 'ping', cooldown: 0 }, handler: async () => { handled += 1 } }
  const storage = memoryStorage()
  await storage.set('users', '628123', { banned: true })
  const a = setup({ plugins: [ping], storage })
  await a.pipeline.handle(a.sock, rawText('.ping'))
  assert.equal(handled, 0)
  assert.equal(a.sent.length, 0)

  const storage2 = memoryStorage()
  await storage2.set('settings', 'bot', { mode: 'self' })
  const b = setup({ plugins: [ping], storage: storage2 })
  await b.pipeline.handle(b.sock, rawText('.ping'))
  assert.equal(handled, 0)
  // Owner tetap dilayani di mode self.
  const ownerRaw = rawText('.ping')
  ownerRaw.key.remoteJid = '628999@s.whatsapp.net'
  await b.pipeline.handle(b.sock, ownerRaw)
  assert.equal(handled, 1)
})

test('dedupe: pesan dengan id sama hanya diproses sekali, termasuk lintas instance', async () => {
  let handled = 0
  const ping = { config: { name: 'ping', cooldown: 0 }, handler: async () => { handled += 1 } }
  const storage = memoryStorage()
  const a = setup({ plugins: [ping], storage })
  const raw = rawText('.ping', { id: 'dup-1' })
  await a.pipeline.handle(a.sock, raw)
  await a.pipeline.handle(a.sock, raw)
  assert.equal(handled, 1)
  // Instance kedua (mis. service produksi sesudah harness) memakai storage
  // yang sama: pengiriman ulang pesan yang sama harus ditahan juga.
  const b = setup({ plugins: [ping], storage })
  await b.pipeline.handle(b.sock, raw)
  assert.equal(handled, 1)
  // Id berbeda tetap diproses normal.
  await b.pipeline.handle(b.sock, rawText('.ping', { id: 'dup-2' }))
  assert.equal(handled, 2)
})

test('perintah sukses memberi XP ke profil pengguna', async () => {
  const ping = { config: { name: 'ping', cooldown: 0, category: 'main' }, handler: async () => {} }
  const { pipeline, sock, storage } = setup({ plugins: [ping] })
  await pipeline.handle(sock, rawText('.ping'))
  const profile = await storage.get('users', '628123')
  assert.equal(profile.xp, 3)
})
