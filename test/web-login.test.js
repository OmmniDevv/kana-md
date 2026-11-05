import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { memoryStorage } from './user-service.test.js'
import {
  ALPHABET,
  WEB_CODE_TTL_MS,
  createWebCode,
  hashCode,
  verifyWebCode,
} from '../src/services/web-login.js'
import {
  formatCodeMessage,
  processWebLoginRequests,
  startWebLoginWatcher,
} from '../src/services/web-login-watcher.js'
import { parseExpiresAtMs } from '../src/services/expires-at.js'
import { wibDateString } from '../src/services/user-service.js'

const NOW = Date.parse('2026-11-04T05:00:00Z') // 12:00 WIB
const DIGITS = '6281234567890'

// rng deterministik: mengembalikan indeks alfabet berurutan (bilangan bulat).
function seqRng(start = 0) {
  let i = start
  return () => i++
}

function fakeSession({ fail = false } = {}) {
  const calls = []
  const sock = {
    user: { id: '628999999999@s.whatsapp.net' },
    sendMessage: async (jid, msg) => {
      if (fail) throw new Error('jaringan putus')
      calls.push({ jid, msg })
      return {}
    },
  }
  return { session: { sock }, calls }
}

function pendingRecord(codePlain, overrides = {}) {
  return {
    codeHash: hashCode(codePlain),
    codePlain,
    expiresAt: NOW + WEB_CODE_TTL_MS,
    status: 'pending',
    attempts: 0,
    ...overrides,
  }
}

test('hashCode adalah sha256 hex dan kode hanya memakai alfabet tanpa karakter ambigu', async () => {
  assert.equal(hashCode('ABC234'), createHash('sha256').update('ABC234', 'utf8').digest('hex'))
  assert.equal(ALPHABET.includes('0'), false)
  assert.equal(ALPHABET.includes('O'), false)
  assert.equal(ALPHABET.includes('1'), false)
  assert.equal(ALPHABET.includes('l'), false)
  assert.equal(ALPHABET.includes('I'), false)
  const storage = memoryStorage()
  const { code, expiresAt } = await createWebCode(storage, DIGITS, { now: NOW, rng: seqRng(0) })
  assert.equal(code.length, 6)
  assert.equal(code, 'ABCDEF')
  for (const ch of code) assert.ok(ALPHABET.includes(ch))
  assert.equal(expiresAt, NOW + WEB_CODE_TTL_MS)
})

test('createWebCode menyimpan hash yang cocok dan verifyWebCode menerima kode yang benar sekali saja', async () => {
  const storage = memoryStorage()
  const { code } = await createWebCode(storage, DIGITS, { now: NOW, rng: seqRng(0) })
  const record = await storage.get('web_login', DIGITS)
  assert.equal(record.codeHash, hashCode(code))
  assert.equal(record.expiresAt, NOW + WEB_CODE_TTL_MS)
  assert.equal('code' in record, false)
  const ok = await verifyWebCode(storage, DIGITS, code, { now: NOW + 1000 })
  assert.deepEqual(ok, { ok: true })
  // Sekali pakai: record sudah terhapus, percobaan kedua jadi none.
  assert.equal(await storage.get('web_login', DIGITS), undefined)
  const again = await verifyWebCode(storage, DIGITS, code, { now: NOW + 2000 })
  assert.deepEqual(again, { ok: false, reason: 'none' })
})

test('kode lama hangus saat kode baru dibuat', async () => {
  const storage = memoryStorage()
  const rng = seqRng(0)
  const first = await createWebCode(storage, DIGITS, { now: NOW, rng })
  const second = await createWebCode(storage, DIGITS, { now: NOW + 1000, rng })
  assert.notEqual(first.code, second.code)
  const oldTry = await verifyWebCode(storage, DIGITS, first.code, { now: NOW + 2000 })
  assert.deepEqual(oldTry, { ok: false, reason: 'mismatch' })
  const newTry = await verifyWebCode(storage, DIGITS, second.code, { now: NOW + 2000 })
  assert.deepEqual(newTry, { ok: true })
})

test('verifyWebCode menolak kode kedaluwarsa dan menghapus recordnya', async () => {
  const storage = memoryStorage()
  const { code } = await createWebCode(storage, DIGITS, { now: NOW, rng: seqRng(10) })
  const res = await verifyWebCode(storage, DIGITS, code, { now: NOW + WEB_CODE_TTL_MS + 1 })
  assert.deepEqual(res, { ok: false, reason: 'expired' })
  assert.equal(await storage.get('web_login', DIGITS), undefined)
})

test('verifyWebCode mismatch tidak menghanguskan kode yang benar', async () => {
  const storage = memoryStorage()
  const { code } = await createWebCode(storage, DIGITS, { now: NOW, rng: seqRng(20) })
  const wrong = await verifyWebCode(storage, DIGITS, 'ZZZZZZ', { now: NOW + 1000 })
  assert.deepEqual(wrong, { ok: false, reason: 'mismatch' })
  const right = await verifyWebCode(storage, DIGITS, code, { now: NOW + 1000 })
  assert.deepEqual(right, { ok: true })
})

test('watcher mengirim record pending tepat satu kali, status jadi sent dan codePlain terhapus', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', DIGITS, pendingRecord('K7X9Q2'))
  const { session, calls } = fakeSession()
  const first = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(first.sent, 1)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].jid, `${DIGITS}@s.whatsapp.net`)
  assert.ok(calls[0].msg.text.includes('K7X9Q2'))
  const record = await storage.get('web_login_requests', DIGITS)
  assert.equal(record.status, 'sent')
  assert.equal('codePlain' in record, false)
  assert.equal(record.codePlain, undefined)
  assert.equal(record.attempts, 1)
  const limits = await storage.get('web_login_limits', DIGITS)
  assert.equal(limits.count, 1)
  assert.equal(limits.lastSentAt, NOW)
  assert.equal(limits.day, wibDateString(new Date(NOW)))
  // Putaran kedua tidak mengirim ulang record yang sudah sent.
  const second = await processWebLoginRequests({ session, storage, now: NOW + 30000 })
  assert.equal(second.sent, 0)
  assert.equal(calls.length, 1)
})

test('watcher melewati record kedaluwarsa dan menghapusnya tanpa mengirim', async () => {
  const storage = memoryStorage()
  await storage.set(
    'web_login_requests',
    DIGITS,
    pendingRecord('OLD123', { expiresAt: NOW - 1000 })
  )
  const { session, calls } = fakeSession()
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.sent, 0)
  assert.equal(summary.expired, 1)
  assert.equal(calls.length, 0)
  assert.equal(await storage.get('web_login_requests', DIGITS), undefined)
})

test('watcher menghormati jeda 2 menit per nomor', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', DIGITS, pendingRecord('AAAA22'))
  const { session, calls } = fakeSession()
  await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(calls.length, 1)
  // Web membuat request baru 1 menit kemudian: belum boleh dikirim.
  await storage.set(
    'web_login_requests',
    DIGITS,
    pendingRecord('BBBB33', { expiresAt: NOW + 60000 + WEB_CODE_TTL_MS })
  )
  const blocked = await processWebLoginRequests({ session, storage, now: NOW + 60000 })
  assert.equal(blocked.sent, 0)
  assert.equal(calls.length, 1)
  const record = await storage.get('web_login_requests', DIGITS)
  assert.equal(record.status, 'pending')
  // Lewat 2 menit: request yang sama akhirnya terkirim.
  const allowed = await processWebLoginRequests({ session, storage, now: NOW + 121000 })
  assert.equal(allowed.sent, 1)
  assert.equal(calls.length, 2)
  assert.ok(calls[1].msg.text.includes('BBBB33'))
})

test('watcher menghormati batas 5 kode per nomor per hari', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', DIGITS, pendingRecord('CCCC44'))
  await storage.set('web_login_limits', DIGITS, {
    lastSentAt: NOW - 3 * 60 * 1000,
    day: wibDateString(new Date(NOW)),
    count: 5,
  })
  const { session, calls } = fakeSession()
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.sent, 0)
  assert.equal(calls.length, 0)
  const record = await storage.get('web_login_requests', DIGITS)
  assert.equal(record.status, 'pending')
})

test('watcher melewati nomor tidak valid tanpa mengirim apa pun', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', '123', pendingRecord('DDDD55'))
  await storage.set('web_login_requests', 'halo-bukan-nomor', pendingRecord('EEEE66'))
  const { session, calls } = fakeSession()
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.sent, 0)
  assert.equal(calls.length, 0)
})

test('watcher gagal kirim menaikkan attempts, status tetap pending dan codePlain dipertahankan', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', DIGITS, pendingRecord('FFFF77'))
  const { session } = fakeSession({ fail: true })
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.failed, 1)
  const record = await storage.get('web_login_requests', DIGITS)
  assert.equal(record.status, 'pending')
  assert.equal(record.attempts, 1)
  assert.equal(record.codePlain, 'FFFF77')
})

test('startWebLoginWatcher mengekspor stop dan tick yang bekerja', async () => {
  const storage = memoryStorage()
  await storage.set('web_login_requests', DIGITS, pendingRecord('GGGG88'))
  const { session, calls } = fakeSession()
  const watcher = startWebLoginWatcher({ session, storage, intervalMs: 60000 })
  assert.equal(typeof watcher.stop, 'function')
  assert.equal(typeof watcher.tick, 'function')
  await watcher.tick(NOW)
  watcher.stop()
  assert.equal(calls.length, 1)
})

test('parseExpiresAtMs menerima epoch ms dan string ISO', () => {
  const ms = NOW + WEB_CODE_TTL_MS
  assert.equal(parseExpiresAtMs(ms), ms)
  assert.equal(parseExpiresAtMs(String(ms)), ms)
  assert.equal(parseExpiresAtMs(new Date(ms).toISOString()), ms)
  assert.equal(parseExpiresAtMs(new Date(ms)), ms)
  assert.ok(Number.isNaN(parseExpiresAtMs('bukan-tanggal')))
  assert.ok(Number.isNaN(parseExpiresAtMs(undefined)))
})

test('watcher mengirim record pending dengan expiresAt ISO yang belum kedaluwarsa', async () => {
  const storage = memoryStorage()
  await storage.set(
    'web_login_requests',
    DIGITS,
    pendingRecord('ISO123', { expiresAt: new Date(NOW + WEB_CODE_TTL_MS).toISOString() })
  )
  const { session, calls } = fakeSession()
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.sent, 1)
  assert.equal(summary.expired, 0)
  assert.equal(calls.length, 1)
  assert.ok(calls[0].msg.text.includes('ISO123'))
  const record = await storage.get('web_login_requests', DIGITS)
  assert.equal(record.status, 'sent')
  assert.equal('codePlain' in record, false)
})

test('watcher menghapus record dengan expiresAt ISO yang sudah kedaluwarsa tanpa mengirim', async () => {
  const storage = memoryStorage()
  await storage.set(
    'web_login_requests',
    DIGITS,
    pendingRecord('ISOOLD', { expiresAt: new Date(NOW - 1000).toISOString() })
  )
  const { session, calls } = fakeSession()
  const summary = await processWebLoginRequests({ session, storage, now: NOW })
  assert.equal(summary.sent, 0)
  assert.equal(summary.expired, 1)
  assert.equal(calls.length, 0)
  assert.equal(await storage.get('web_login_requests', DIGITS), undefined)
})

test('verifyWebCode menerima record dengan expiresAt ISO dan menolak yang ISO kedaluwarsa', async () => {
  const storage = memoryStorage()
  const code = 'ISO456'
  await storage.set('web_login', DIGITS, {
    codeHash: hashCode(code),
    expiresAt: new Date(NOW + WEB_CODE_TTL_MS).toISOString(),
  })
  const ok = await verifyWebCode(storage, DIGITS, code, { now: NOW + 1000 })
  assert.deepEqual(ok, { ok: true })

  const storage2 = memoryStorage()
  await storage2.set('web_login', DIGITS, {
    codeHash: hashCode(code),
    expiresAt: new Date(NOW - 1000).toISOString(),
  })
  const expired = await verifyWebCode(storage2, DIGITS, code, { now: NOW })
  assert.deepEqual(expired, { ok: false, reason: 'expired' })
  assert.equal(await storage2.get('web_login', DIGITS), undefined)
})

test('formatCodeMessage berisi kode dalam dua bahasa dan tanpa em dash', () => {
  const idMsg = formatCodeMessage('K7X9Q2', 'id')
  const enMsg = formatCodeMessage('K7X9Q2', 'en')
  assert.ok(idMsg.includes('K7X9Q2'))
  assert.ok(enMsg.includes('K7X9Q2'))
  assert.equal(idMsg.includes('\u2014'), false)
  assert.equal(enMsg.includes('\u2014'), false)
  // Karakter yang dicek ditulis sebagai escape supaya file ini sendiri
  // tetap bebas em dash sesuai aturan repo.
  assert.equal(formatCodeMessage('K7X9Q2').includes('K7X9Q2'), true)
})
