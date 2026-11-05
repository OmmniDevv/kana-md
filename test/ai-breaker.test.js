// Tes breaker khusus AI dan perlindungan Pollinations (insiden
// 2026-11-05 sore): HTTP 402 batas laju tier anonim men-trip breaker
// generik lama (ambang 3, cooldown 5 menit, tanpa half-open) sampai
// semua perintah AI teks terkunci massal padahal sumbernya hidup.
// Semua tes di sini tanpa jaringan: fungsi upstream berupa stub,
// jam dan tidur disuntik.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createAiBreaker,
  httpStatusOf,
  isRateLimitError,
  withPollinationsGate,
  withRateLimitRetry,
} from '../src/services/ai-provider.js'

function jamPalsu(mulai = 1_000_000) {
  let t = mulai
  return {
    now: () => t,
    maju: (ms) => {
      t += ms
    },
  }
}

const gagalNyata = async () => {
  const err = new Error('POST gagal: HTTP 503')
  err.status = 503
  throw err
}

test('breaker AI: empat gagal beruntun belum membuka, sukses mereset hitungan', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-ambang', { now: jam.now })
  for (let i = 0; i < 4; i++) await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  assert.equal(breaker.state().failures, 4)
  assert.equal(breaker.state().openUntil, 0)
  assert.equal(await breaker.call(async () => 'pulih'), 'pulih')
  assert.equal(breaker.state().failures, 0)
})

test('breaker AI: membuka sesudah 5 gagal beruntun dan menolak tanpa menjalankan fungsi', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-buka', { now: jam.now })
  for (let i = 0; i < 5; i++) await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  assert.ok(breaker.state().openUntil > jam.now())
  let dijalankan = false
  await assert.rejects(
    () =>
      breaker.call(async () => {
        dijalankan = true
        return 'tidak boleh sampai sini'
      }),
    (err) => err.code === 'SOURCE_DOWN' && /circuit breaker terbuka/.test(err.message)
  )
  assert.equal(dijalankan, false)
})

test('breaker AI: cooldown 30 detik lalu half-open satu percobaan, sukses menutup penuh', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-half-open', { now: jam.now })
  for (let i = 0; i < 5; i++) await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  jam.maju(29_000)
  await assert.rejects(() => breaker.call(async () => 'terlalu cepat'), (err) => err.code === 'SOURCE_DOWN')
  jam.maju(1_001)
  assert.equal(await breaker.call(async () => 'jawaban percobaan'), 'jawaban percobaan')
  assert.deepEqual(breaker.state(), { failures: 0, openUntil: 0, trialInFlight: false })
  assert.equal(await breaker.call(async () => 'lancar lagi'), 'lancar lagi')
})

test('breaker AI: percobaan half-open yang gagal membuka lagi satu cooldown, lalu pulih sendiri', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-percobaan-gagal', { now: jam.now })
  for (let i = 0; i < 5; i++) await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  jam.maju(30_001)
  await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  assert.ok(breaker.state().openUntil > jam.now())
  await assert.rejects(() => breaker.call(async () => 'masih terkunci'), (err) => err.code === 'SOURCE_DOWN')
  jam.maju(30_001)
  assert.equal(await breaker.call(async () => 'akhirnya pulih'), 'akhirnya pulih')
  assert.equal(breaker.state().failures, 0)
})

test('breaker AI: selama percobaan half-open berjalan, panggilan lain ditolak cepat', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-percobaan-bersamaan', { now: jam.now })
  for (let i = 0; i < 5; i++) await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  jam.maju(30_001)
  let lepas
  const percobaan = breaker.call(
    () =>
      new Promise((resolve) => {
        lepas = () => resolve('percobaan selesai')
      })
  )
  await assert.rejects(() => breaker.call(async () => 'menyelinap'), (err) => err.code === 'SOURCE_DOWN')
  lepas()
  assert.equal(await percobaan, 'percobaan selesai')
  assert.equal(breaker.state().openUntil, 0)
})

test('breaker AI: cooldown dan ambang bisa diatur per breaker', async () => {
  const jam = jamPalsu()
  const breaker = createAiBreaker('uji-atur', { now: jam.now, threshold: 2, cooldownMs: 5_000 })
  await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  await assert.rejects(() => breaker.call(gagalNyata), /HTTP 503/)
  assert.equal(breaker.state().openUntil, jam.now() + 5_000)
  jam.maju(5_001)
  assert.equal(await breaker.call(async () => 'pulih cepat'), 'pulih cepat')
})

test('httpStatusOf dan isRateLimitError mengenali 402 dan 429 dari field maupun pesan', () => {
  const dariField = new Error('apapun')
  dariField.status = 402
  assert.equal(httpStatusOf(dariField), 402)
  assert.equal(isRateLimitError(dariField), true)
  assert.equal(isRateLimitError(new Error('Unduh gagal: HTTP 402')), true)
  assert.equal(isRateLimitError(new Error('POST gagal: HTTP 429')), true)
  assert.equal(httpStatusOf(new Error('POST gagal: HTTP 503')), 503)
  assert.equal(isRateLimitError(new Error('POST gagal: HTTP 503')), false)
  assert.equal(isRateLimitError(new Error('Timeout')), false)
  assert.equal(httpStatusOf(new Error('Timeout')), 0)
})

test('retry batas laju: 402 dua kali lalu sukses, backoff berjenjang tercatat', async () => {
  const tidur = []
  let panggilan = 0
  const hasil = await withRateLimitRetry(
    async () => {
      panggilan += 1
      if (panggilan <= 2) {
        const err = new Error('POST gagal: HTTP 402')
        err.status = 402
        throw err
      }
      return 'jawaban sesudah menunggu'
    },
    { sleepImpl: async (ms) => tidur.push(ms) }
  )
  assert.equal(hasil, 'jawaban sesudah menunggu')
  assert.equal(panggilan, 3)
  assert.deepEqual(tidur, [2_000, 4_000])
})

test('retry batas laju: 402 terus menerus menyerah sesudah 3 retry dan melempar error asli', async () => {
  let panggilan = 0
  await assert.rejects(
    () =>
      withRateLimitRetry(
        async () => {
          panggilan += 1
          const err = new Error('Unduh gagal: HTTP 402')
          throw err
        },
        { sleepImpl: async () => {} }
      ),
    /HTTP 402/
  )
  assert.equal(panggilan, 4)
})

test('retry batas laju: error nyata selain batas laju tidak dicoba ulang', async () => {
  let panggilan = 0
  await assert.rejects(
    () =>
      withRateLimitRetry(
        async () => {
          panggilan += 1
          throw new Error('POST gagal: HTTP 503')
        },
        { sleepImpl: async () => {} }
      ),
    /HTTP 503/
  )
  assert.equal(panggilan, 1)
})

test('gerbang Pollinations: panggilan bersamaan berjalan satu per satu', async () => {
  let aktif = 0
  let maksAktif = 0
  const pekerjaan = (nama) =>
    withPollinationsGate(async () => {
      aktif += 1
      maksAktif = Math.max(maksAktif, aktif)
      await new Promise((resolve) => setTimeout(resolve, 15))
      aktif -= 1
      return nama
    })
  const hasil = await Promise.all([pekerjaan('a'), pekerjaan('b'), pekerjaan('c')])
  assert.deepEqual(hasil, ['a', 'b', 'c'])
  assert.equal(maksAktif, 1)
})

test('gerbang Pollinations: kegagalan satu panggilan tidak memutus antrean berikutnya', async () => {
  await assert.rejects(
    () =>
      withPollinationsGate(async () => {
        throw new Error('gagal di gerbang')
      }),
    /gagal di gerbang/
  )
  assert.equal(await withPollinationsGate(async () => 'antrean tetap jalan'), 'antrean tetap jalan')
})
