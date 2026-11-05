import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPipeline } from '../src/core/pipeline.js'
import { memoryStorage } from './user-service.test.js'
import {
  parseDuration,
  addPremium,
  removePremium,
  listPremium,
  isPremium,
  getPremiumStatus,
  addSewa,
  removeSewa,
  listSewa,
  isGroupRented,
  isJadibotRented,
  checkPremiumAccess,
  JADIBOT_SESSION_NS,
} from '../src/services/premium.js'
import { consumeLimitGroup, peekLimit, getUsage, quotaFor } from '../src/services/limit.js'
import { createBridgeStorage, PREMIUM_NS_SET } from '../src/services/web-bridge.js'
import { formatMenu, formatMenuCategory } from '../src/ui/format.js'

const NOW = Date.UTC(2026, 10, 5, 4, 0, 0) // 2026-11-05 11:00 WIB
const DAY = 24 * 60 * 60 * 1000

test('parseDuration: hari, minggu, tahun, permanen, dan token rusak', () => {
  assert.equal(parseDuration('7d').ms, 7 * DAY)
  assert.equal(parseDuration('30d').ms, 30 * DAY)
  assert.equal(parseDuration('2w').ms, 14 * DAY)
  assert.equal(parseDuration('1y').ms, 365 * DAY)
  assert.equal(parseDuration('30').ms, 30 * DAY)
  assert.equal(parseDuration('permanen').permanent, true)
  assert.equal(parseDuration('0').permanent, true)
  assert.equal(parseDuration('abc'), null)
  assert.equal(parseDuration(''), null)
  assert.equal(parseDuration('-5d'), null)
})

test('premium: tambah, aktif, perpanjangan menumpuk, permanen, cabut', async () => {
  const storage = memoryStorage()
  const rec = await addPremium(storage, '628111', { duration: '30d', addedBy: '628999', now: NOW })
  assert.equal(rec.expiresAt, NOW + 30 * DAY)
  assert.equal(await isPremium(storage, '628111', NOW + DAY), true)
  // Perpanjangan saat masih aktif menumpuk dari sisa lama.
  const rec2 = await addPremium(storage, '628111', { duration: '30d', addedBy: '628999', now: NOW + DAY })
  assert.equal(rec2.expiresAt, NOW + 60 * DAY)
  // Kedaluwarsa: tepat di expiresAt sudah tidak aktif.
  assert.equal(await isPremium(storage, '628111', NOW + 60 * DAY), false)
  const expired = await getPremiumStatus(storage, '628111', NOW + 61 * DAY)
  assert.equal(expired.expired, true)
  // Permanen tidak pernah kedaluwarsa.
  await addPremium(storage, '628222', { duration: 'permanen', addedBy: '628999', now: NOW })
  assert.equal(await isPremium(storage, '628222', NOW + 5000 * DAY), true)
  const list = await listPremium(storage, NOW)
  assert.equal(list.length, 2)
  assert.equal(await removePremium(storage, '628222'), true)
  assert.equal(await removePremium(storage, '628222'), false)
  assert.equal(await isPremium(storage, '628222', NOW), false)
})

test('sewa: grup dan jadibot terpisah, expired malas, cabut', async () => {
  const storage = memoryStorage()
  const jid = '120363111@g.us'
  await addSewa(storage, jid, { type: 'group', duration: '7d', addedBy: '628999', now: NOW })
  await addSewa(storage, '628111', { type: 'jadibot', duration: '7d', addedBy: '628999', now: NOW })
  assert.equal(await isGroupRented(storage, jid, NOW + DAY), true)
  assert.equal(await isGroupRented(storage, jid, NOW + 8 * DAY), false)
  assert.equal(await isJadibotRented(storage, '628111', NOW + DAY), true)
  // Sewa grup tidak terbaca sebagai sewa jadibot dan sebaliknya.
  assert.equal(await isJadibotRented(storage, jid, NOW + DAY), false)
  assert.equal(await isGroupRented(storage, '628111@s.whatsapp.net', NOW + DAY), false)
  const rows = await listSewa(storage, NOW)
  assert.equal(rows.length, 2)
  assert.equal(await removeSewa(storage, jid), true)
  assert.equal(await isGroupRented(storage, jid, NOW), false)
})

test('checkPremiumAccess: matriks gate premium, sewa grup, jadibot', async () => {
  const storage = memoryStorage()
  const jid = '120363222@g.us'
  // Gratis: ditolak di mana pun.
  assert.equal((await checkPremiumAccess(storage, { digits: '628111', chat: '628111@s.whatsapp.net', commandName: 'ai', now: NOW })).allowed, false)
  // Premium personal: lolos.
  await addPremium(storage, '628111', { duration: '30d', addedBy: '628999', now: NOW })
  assert.equal((await checkPremiumAccess(storage, { digits: '628111', chat: '628111@s.whatsapp.net', commandName: 'ai', now: NOW })).via, 'premium')
  // Sewa grup: user lain lolos di grup itu, tidak di DM, tidak di grup lain.
  await addSewa(storage, jid, { type: 'group', duration: '30d', addedBy: '628999', now: NOW })
  const viaGroup = await checkPremiumAccess(storage, { digits: '628333', chat: jid, isGroup: true, commandName: 'ai', now: NOW })
  assert.deepEqual(viaGroup, { allowed: true, via: 'group-rent' })
  assert.equal((await checkPremiumAccess(storage, { digits: '628333', chat: '628333@s.whatsapp.net', commandName: 'ai', now: NOW })).allowed, false)
  assert.equal(
    (await checkPremiumAccess(storage, { digits: '628333', chat: '120363999@g.us', isGroup: true, commandName: 'ai', now: NOW })).allowed,
    false
  )
  // Jadibot: sewa grup TIDAK membuka, sewa jadibot membuka.
  assert.equal(
    (await checkPremiumAccess(storage, { digits: '628333', chat: jid, isGroup: true, commandName: 'jadibot', now: NOW })).allowed,
    false
  )
  await addSewa(storage, '628333', { type: 'jadibot', duration: '30d', addedBy: '628999', now: NOW })
  assert.equal(
    (await checkPremiumAccess(storage, { digits: '628333', chat: '628333@s.whatsapp.net', commandName: 'jadibot', now: NOW })).via,
    'jadibot-rent'
  )
  // Stopjadibot: pemegang sesi aktif lolos walau tanpa premium/sewa.
  await storage.set(JADIBOT_SESSION_NS, 'kana2', { number: '628444', startedBy: '628444', startedAt: NOW })
  assert.equal(
    (await checkPremiumAccess(storage, { digits: '628444', chat: '628444@s.whatsapp.net', commandName: 'stopjadibot', now: NOW })).via,
    'jadibot-session'
  )
  assert.equal(
    (await checkPremiumAccess(storage, { digits: '628555', chat: '628555@s.whatsapp.net', commandName: 'stopjadibot', now: NOW })).allowed,
    false
  )
})

test('limit grup: kuota gratis vs berbayar, tolak tidak menambah, reset tanggal', async () => {
  const storage = memoryStorage()
  assert.equal(quotaFor('download', false), 5)
  assert.equal(quotaFor('download', true), 50)
  assert.equal(quotaFor('upscale', false), 3)
  assert.equal(quotaFor('upscale', true), 20)
  for (let i = 0; i < 5; i++) {
    const r = await consumeLimitGroup(storage, '628111', 'download', { paidTier: false, now: NOW })
    assert.equal(r.ok, true)
  }
  const denied = await consumeLimitGroup(storage, '628111', 'download', { paidTier: false, now: NOW })
  assert.equal(denied.ok, false)
  assert.equal(denied.left, 0)
  // Percobaan ditolak tidak menambah hitungan.
  assert.equal(await getUsage(storage, '628111', 'download', { now: NOW }), 5)
  // Berbayar masih lolos di angka yang sama.
  const paid = await consumeLimitGroup(storage, '628111', 'download', { paidTier: true, now: NOW })
  assert.equal(paid.ok, true)
  assert.equal(paid.quota, 50)
  // Grup upscale terpisah dari download.
  const peek = await peekLimit(storage, '628111', 'upscale', { paidTier: false, now: NOW })
  assert.deepEqual({ used: peek.used, quota: peek.quota, left: peek.left }, { used: 0, quota: 3, left: 3 })
  // Besok WIB: hitungan mulai nol lagi.
  assert.equal(await getUsage(storage, '628111', 'download', { now: NOW + DAY }), 0)
})

// --- Gate pipeline end-to-end dengan registry palsu ---

function setupPipeline({ plugins = [], storage = memoryStorage() } = {}) {
  const origGet = storage.get.bind(storage)
  storage.get = async (ns, key) => {
    const value = await origGet(ns, key)
    if (ns === 'users' && ['628123', '628124'].includes(key)) return { registered: true, ...(value ?? {}) }
    return value
  }
  const byName = new Map(plugins.map((p) => [p.config.name, p]))
  const registry = {
    resolve: (c) => byName.get(c),
    list: () => plugins,
    quarantined: [],
    befores: [],
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
  }
  return { pipeline, sock, sent, storage }
}

let rawSeq = 0
const rawText = (text, { group = false, sender = '628123@s.whatsapp.net', chat } = {}) => ({
  key: {
    remoteJid: chat ?? (group ? '120363@g.us' : '628123@s.whatsapp.net'),
    participant: group ? sender : undefined,
    fromMe: false,
    id: `x${++rawSeq}`,
  },
  pushName: 'Senpai',
  message: { conversation: text },
})

const ownerRaw = (text) => {
  const raw = rawText(text)
  raw.key.remoteJid = '628999@s.whatsapp.net'
  return raw
}

test('pipeline premium gate: gratis ditolak, premium dan owner lolos', async () => {
  let handled = 0
  const ai = { config: { name: 'ai', cooldown: 0, premium: true, category: 'ai' }, handler: async () => { handled += 1 } }
  const { pipeline, sock, sent, storage } = setupPipeline({ plugins: [ai] })
  await pipeline.handle(sock, rawText('.ai halo'))
  assert.equal(handled, 0)
  assert.ok(sent.some((s) => /PREMIUM/.test(s.content.text || '') && /💎/.test(s.content.text || '')))
  await addPremium(storage, '628123', { duration: '30d', addedBy: '628999' })
  await pipeline.handle(sock, rawText('.ai halo'))
  assert.equal(handled, 1)
  await pipeline.handle(sock, ownerRaw('.ai halo'))
  assert.equal(handled, 2)
})

test('pipeline premium gate: sewa grup lolos di grup itu saja', async () => {
  let handled = 0
  const ai = { config: { name: 'ai', cooldown: 0, premium: true, category: 'ai' }, handler: async () => { handled += 1 } }
  const { pipeline, sock, storage } = setupPipeline({ plugins: [ai] })
  await addSewa(storage, '120363@g.us', { type: 'group', duration: '30d', addedBy: '628999' })
  await pipeline.handle(sock, rawText('.ai halo', { group: true }))
  assert.equal(handled, 1)
  await pipeline.handle(sock, rawText('.ai halo'))
  assert.equal(handled, 1)
})

test('pipeline premium gate: jadibot tidak dibuka sewa grup, dibuka sewa jadibot', async () => {
  let handled = 0
  const jadibot = { config: { name: 'jadibot', cooldown: 0, premium: true, category: 'user' }, handler: async () => { handled += 1 } }
  const { pipeline, sock, storage } = setupPipeline({ plugins: [jadibot] })
  await addSewa(storage, '120363@g.us', { type: 'group', duration: '30d', addedBy: '628999' })
  await pipeline.handle(sock, rawText('.jadibot kana2 628123', { group: true }))
  assert.equal(handled, 0)
  await addSewa(storage, '628123', { type: 'jadibot', duration: '30d', addedBy: '628999' })
  await pipeline.handle(sock, rawText('.jadibot kana2 628123'))
  assert.equal(handled, 1)
})

test('pipeline limit gate: download gratis berhenti di 5, premium dan owner lolos terus', async () => {
  let handled = 0
  const ytmp4 = { config: { name: 'ytmp4', cooldown: 0, limitGroup: 'download', category: 'download' }, handler: async () => { handled += 1 } }
  const a = setupPipeline({ plugins: [ytmp4] })
  for (let i = 0; i < 5; i++) await a.pipeline.handle(a.sock, rawText('.ytmp4 link'))
  assert.equal(handled, 5)
  await a.pipeline.handle(a.sock, rawText('.ytmp4 link'))
  assert.equal(handled, 5)
  assert.ok(a.sent.some((s) => /LIMIT HARIAN HABIS/.test(s.content.text || '')))
  assert.equal(await getUsage(a.storage, '628123', 'download'), 5)

  const b = setupPipeline({ plugins: [ytmp4] })
  await addPremium(b.storage, '628123', { duration: '30d', addedBy: '628999' })
  for (let i = 0; i < 8; i++) await b.pipeline.handle(b.sock, rawText('.ytmp4 link'))
  assert.equal(handled, 13)

  const c = setupPipeline({ plugins: [ytmp4] })
  for (let i = 0; i < 8; i++) await c.pipeline.handle(c.sock, ownerRaw('.ytmp4 link'))
  assert.equal(handled, 21)
})

test('pipeline limit gate: upscale terpisah dari download, berhenti di 3', async () => {
  let handled = 0
  const hd = { config: { name: 'hd', cooldown: 0, limitGroup: 'upscale', category: 'maker' }, handler: async () => { handled += 1 } }
  const { pipeline, sock, storage } = setupPipeline({ plugins: [hd] })
  for (let i = 0; i < 3; i++) await pipeline.handle(sock, rawText('.hd'))
  assert.equal(handled, 3)
  await pipeline.handle(sock, rawText('.hd'))
  assert.equal(handled, 3)
  assert.equal(await getUsage(storage, '628123', 'upscale'), 3)
  assert.equal(await getUsage(storage, '628123', 'download'), 0)
})

test('menu marking: premium 💎, limit ⏳, polos tanpa tanda, legenda muncul', () => {
  const labels = {
    footer: 'KANA, bot WhatsApp moe',
    subHint: 'sub',
    premiumLegend: '💎 = fitur premium',
    limitLegend: '⏳ = ada limit harian',
    greeting: 'Haii',
    runtime: 'Runtime',
    mode: 'Mode',
    plugins: 'Plugin',
    commands: 'perintah',
    date: 'Tanggal',
    hint: 'hint',
    closing: 'closing',
    legendTitle: 'KETERANGAN',
  }
  const category = {
    key: 'download',
    icon: '📥',
    title: 'DOWNLOADER',
    commands: [
      { name: 'ai', premium: true, limitGroup: null },
      { name: 'ytmp4', premium: false, limitGroup: 'download' },
      { name: 'ping', premium: false, limitGroup: null },
    ],
  }
  const catOut = formatMenuCategory({ category, labels })
  assert.ok(catOut.includes('│ ◦ .ai 💎'))
  assert.ok(catOut.includes('│ ◦ .ytmp4 ⏳'))
  assert.ok(catOut.includes('│ ◦ .ping'))
  assert.ok(!catOut.includes('.ping 💎') && !catOut.includes('.ping ⏳'))
  assert.ok(catOut.includes('💎 = fitur premium'))
  assert.ok(catOut.includes('⏳ = ada limit harian'))

  const allOut = formatMenu({
    botName: 'KANA',
    runtimeMs: 60000,
    mode: 'Publik',
    pluginCount: 3,
    commandCount: 3,
    dateTime: 'Rabu, 5 November 2026',
    categories: [category],
    labels,
  })
  assert.ok(allOut.includes('│ ◦ .ai 💎'))
  assert.ok(allOut.includes('KETERANGAN'))
  assert.ok(allOut.includes('💎 = fitur premium'))
})

test('web bridge: namespace premium, sewa, dan limit dirutekan ke REST', async () => {
  assert.ok(PREMIUM_NS_SET.has('premium') && PREMIUM_NS_SET.has('sewa_bot') && PREMIUM_NS_SET.has('usage_limits'))
  const store = new Map()
  const id = (ns, key) => `${ns}:${key}`
  const rest = {
    async kvGet(ns, key) {
      return store.get(id(ns, key)) ?? null
    },
    async kvSet(ns, key, value) {
      store.set(id(ns, key), value)
    },
    async kvDelete(ns, key) {
      store.delete(id(ns, key))
    },
    async kvList(ns) {
      return [...store.keys()]
        .filter((k) => k.startsWith(`${ns}:`))
        .map((k) => ({ ns, key: k.slice(ns.length + 1), value: store.get(k), expires_at: null }))
    },
  }
  const base = memoryStorage()
  const bridge = createBridgeStorage(base, rest, {})
  await bridge.set('premium', '628111', { expiresAt: null })
  assert.equal(await base.get('premium', '628111'), undefined)
  assert.deepEqual(await bridge.get('premium', '628111'), { expiresAt: null })
  assert.deepEqual(await bridge.keys('premium'), ['628111'])
  await bridge.set('usage_limits', '628111:download:2026-11-05', { count: 2 })
  assert.equal(await base.get('usage_limits', '628111:download:2026-11-05'), undefined)
  // Namespace lain tetap storage utama.
  await bridge.set('users', '628111', { xp: 1 })
  assert.deepEqual(await base.get('users', '628111'), { xp: 1 })
})
