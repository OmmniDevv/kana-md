import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handler } from '../plugins/islamic/jadwalsholat.js'

// Regresi sapuan live P7 (2026-11-05): handler lama memanggil
// getPrayerInfo tanpa tanggal wajib sehingga selalu null, lalu
// Object.entries(null) meledak "Cannot convert undefined or null to
// object" dan bot membalas GAGAL. Tes ini mengunci kontrak barunya:
// tanggal dikirim, bentuk { city, times, extra } diformat, dan null
// menjadi pesan gagal yang jujur.

const INFO = {
  city: { id: '1301', name: 'KOTA JAKARTA' },
  times: { imsak: '03:58', subuh: '04:08', dzuhur: '11:40', ashar: '14:57', maghrib: '17:50', isya: '19:02' },
  extra: { terbit: '05:23', dhuha: '05:51', dateLabel: 'Kamis, 05/11/2026' },
}

function fakeCtx(text = '') {
  const replies = []
  return {
    replies,
    text,
    args: [],
    lang: 'id',
    t: (key, vars = {}) => {
      if (key === 'jadwalsholat.body') return `BODY:${vars.text}`
      if (key === 'jadwalsholat.fail') return `FAIL:${vars.error}`
      return key
    },
    reply: async (txt) => { replies.push(txt) },
  }
}

test('jadwalsholat: mengirim tanggal hari ini dan memformat jadwal asli', async () => {
  const calls = []
  const ctx = fakeCtx('')
  await handler(ctx, { fetchInfo: async (city, dateStr) => { calls.push([city, dateStr]); return INFO } })
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'Jakarta')
  assert.match(calls[0][1], /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(ctx.replies.length, 1)
  const body = ctx.replies[0]
  assert.match(body, /^BODY:Jadwal sholat \*KOTA JAKARTA\*/)
  assert.match(body, /Imsak: 03:58/)
  assert.match(body, /Maghrib: 17:50/)
  assert.match(body, /Kamis, 05\/11\/2026/)
})

test('jadwalsholat: kota dari teks user diteruskan ke sumber', async () => {
  const calls = []
  const ctx = fakeCtx('Bandung')
  await handler(ctx, { fetchInfo: async (city, dateStr) => { calls.push([city, dateStr]); return INFO } })
  assert.equal(calls[0][0], 'Bandung')
})

test('jadwalsholat: sumber null menjadi pesan gagal jujur, bukan TypeError', async () => {
  const ctx = fakeCtx('')
  await handler(ctx, { fetchInfo: async () => null })
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], /^FAIL:jadwal tidak ditemukan/)
})
