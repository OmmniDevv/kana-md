import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSupabaseRest } from '../src/services/supabase-rest.js'

const BASE = 'https://qvyvllvlvrlnzipjmplc.supabase.co'
const KEY = 'test-service-role-key'

function mockFetch(handler) {
  const calls = []
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options })
    return handler(url, options, calls.length)
  }
  return { calls, fetchImpl }
}

function okJson(rows, status = 200) {
  return {
    ok: true,
    status,
    json: async () => rows,
    text: async () => JSON.stringify(rows),
  }
}

test('kvList membentuk URL tabel kv dengan filter ns dan header profil bot', async () => {
  const rows = [
    { ns: 'web_login_requests', key: '628123', value: { status: 'pending' }, expires_at: null },
  ]
  const { calls, fetchImpl } = mockFetch(async () => okJson(rows))
  const rest = createSupabaseRest({ url: BASE, key: KEY, fetchImpl })
  const result = await rest.kvList('web_login_requests')
  assert.deepEqual(result, rows)
  assert.equal(calls.length, 1)
  const { url, options } = calls[0]
  assert.ok(url.startsWith(`${BASE}/rest/v1/kv?`))
  assert.ok(url.includes('ns=eq.web_login_requests'))
  assert.equal(options.method, 'GET')
  assert.equal(options.headers.apikey, KEY)
  assert.equal(options.headers.Authorization, `Bearer ${KEY}`)
  assert.equal(options.headers['Accept-Profile'], 'bot')
  assert.equal(options.headers['Content-Profile'], undefined)
  assert.ok(options.signal instanceof AbortSignal)
})

test('kvGet mengembalikan value baris dan null saat array kosong', async () => {
  const { calls, fetchImpl } = mockFetch(async (url) =>
    url.includes('key=eq.ada')
      ? okJson([{ ns: 'kv', key: 'ada', value: { totalCommands: 3 }, expires_at: null }])
      : okJson([])
  )
  const rest = createSupabaseRest({ url: `${BASE}/rest/v1`, key: KEY, fetchImpl })
  assert.deepEqual(await rest.kvGet('kv', 'ada'), { totalCommands: 3 })
  assert.equal(await rest.kvGet('kv', 'kosong'), null)
  assert.ok(calls[0].url.includes('key=eq.ada'))
  assert.equal(calls[0].options.headers['Accept-Profile'], 'bot')
})

test('kvSet memakai on_conflict ns,key, Content-Profile bot dan Prefer merge-duplicates', async () => {
  const { calls, fetchImpl } = mockFetch(async () => ({
    ok: true,
    status: 201,
    json: async () => [],
    text: async () => '',
  }))
  const rest = createSupabaseRest({ url: BASE, key: KEY, fetchImpl })
  await rest.kvSet('web_login_requests', '628123', { status: 'sent', attempts: 1 })
  await rest.kvSet('kv', 'bot_stats', { totalCommands: 1 }, '2026-11-04T10:00:00.000Z')
  assert.equal(calls.length, 2)
  const first = calls[0]
  assert.equal(first.url, `${BASE}/rest/v1/kv?on_conflict=ns,key`)
  assert.equal(first.options.method, 'POST')
  assert.equal(first.options.headers.apikey, KEY)
  assert.equal(first.options.headers.Authorization, `Bearer ${KEY}`)
  assert.equal(first.options.headers['Content-Profile'], 'bot')
  assert.equal(first.options.headers['Accept-Profile'], undefined)
  assert.match(first.options.headers.Prefer, /resolution=merge-duplicates/)
  assert.match(first.options.headers.Prefer, /return=minimal/)
  assert.deepEqual(JSON.parse(first.options.body), {
    ns: 'web_login_requests',
    key: '628123',
    value: { status: 'sent', attempts: 1 },
    expires_at: null,
  })
  assert.equal(JSON.parse(calls[1].options.body).expires_at, '2026-11-04T10:00:00.000Z')
})

test('kvDelete memakai method DELETE dengan header tulis profil bot', async () => {
  const { calls, fetchImpl } = mockFetch(async () => ({
    ok: true,
    status: 200,
    json: async () => [],
    text: async () => '',
  }))
  const rest = createSupabaseRest({ url: BASE, key: KEY, fetchImpl })
  await rest.kvDelete('web_login_requests', '628123')
  assert.equal(calls[0].options.method, 'DELETE')
  assert.ok(calls[0].url.includes('ns=eq.web_login_requests'))
  assert.ok(calls[0].url.includes('key=eq.628123'))
  assert.equal(calls[0].options.headers['Content-Profile'], 'bot')
})

test('error HTTP melempar Error yang membawa status', async () => {
  const { fetchImpl } = mockFetch(async () => ({
    ok: false,
    status: 503,
    json: async () => ({}),
    text: async () => 'service unavailable',
  }))
  const rest = createSupabaseRest({ url: BASE, key: KEY, fetchImpl })
  await assert.rejects(
    () => rest.kvList('web_login_requests'),
    (err) => {
      assert.equal(err.status, 503)
      assert.match(err.message, /HTTP 503/)
      return true
    }
  )
  await assert.rejects(() => rest.kvGet('kv', 'bot_stats'), /HTTP 503/)
})
