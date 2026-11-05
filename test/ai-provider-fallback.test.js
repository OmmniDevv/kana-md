// Tes rantai fallback ai-provider (insiden 2026-11-05): satu sumber
// AI mati tidak boleh mematikan semua plugin AI. Semua tes di sini
// memakai sumber stub dan fetchImpl suntikan, tanpa jaringan asli.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createFallbackProvider,
  createPollinationsOpenAiProvider,
  getAiProvider,
  resetAiProviderForTest,
  sanitizeMessages,
} from '../src/services/ai-provider.js'

const MESSAGES = [
  { role: 'system', content: 'Kamu KANA' },
  { role: 'user', content: 'halo' },
]

test('fallback: sumber pertama gagal, sumber kedua menjawab', async () => {
  const calls = []
  const provider = createFallbackProvider([
    {
      name: 'pertama',
      chat: async () => {
        calls.push('pertama')
        throw new Error('Sumber pertama sedang tidak tersedia (circuit breaker terbuka)')
      },
    },
    {
      name: 'kedua',
      chat: async () => {
        calls.push('kedua')
        return 'Jawaban dari sumber kedua.'
      },
    },
  ])
  const reply = await provider.chat(MESSAGES)
  assert.equal(reply, 'Jawaban dari sumber kedua.')
  assert.deepEqual(calls, ['pertama', 'kedua'])
})

test('fallback: balasan kosong dari sumber pertama dianggap gagal', async () => {
  const provider = createFallbackProvider([
    { name: 'kosong', chat: async () => '   ' },
    { name: 'isi', chat: async () => 'Ada isinya.' },
  ])
  assert.equal(await provider.chat(MESSAGES), 'Ada isinya.')
})

test('fallback: semua sumber gagal menghasilkan error jujur gabungan', async () => {
  const provider = createFallbackProvider([
    {
      name: 'satu',
      chat: async () => {
        throw new Error('Timeout')
      },
    },
    {
      name: 'dua',
      chat: async () => {
        throw new Error('POST gagal: HTTP 503')
      },
    },
  ])
  await assert.rejects(
    () => provider.chat(MESSAGES),
    (err) => {
      assert.equal(err.code, 'ALL_SOURCES_DOWN')
      assert.match(err.message, /Semua sumber AI gagal menjawab/)
      assert.match(err.message, /satu: Timeout/)
      assert.match(err.message, /dua: POST gagal: HTTP 503/)
      assert.equal(err.failures.length, 2)
      return true
    }
  )
})

test('fallback: prompt kosong ditolak sebelum sumber mana pun dipanggil', async () => {
  let called = false
  const provider = createFallbackProvider([
    {
      name: 'stub',
      chat: async () => {
        called = true
        return 'tidak boleh sampai sini'
      },
    },
  ])
  await assert.rejects(() => provider.chat([{ role: 'user', content: '  ' }]), /Prompt kosong/)
  assert.equal(called, false)
})

test('sanitizeMessages membuang konten kosong dan menormalkan peran', () => {
  assert.deepEqual(
    sanitizeMessages([
      { role: 'system', content: ' konteks ' },
      { role: 'aneh', content: 'halo' },
      { role: 'assistant', content: '' },
      { role: 'assistant', content: 'hai' },
    ]),
    [
      { role: 'system', content: 'konteks' },
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'hai' },
    ]
  )
})

test('pollinations-openai: parse jawaban format OpenAI lewat fetch suntikan', async () => {
  const seen = []
  const fetchImpl = async (url, opts) => {
    seen.push({ url, opts })
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Halo juga dari OpenAI lane.' } }] }),
    }
  }
  const provider = createPollinationsOpenAiProvider({ fetchImpl })
  const reply = await provider.chat(MESSAGES)
  assert.equal(reply, 'Halo juga dari OpenAI lane.')
  assert.equal(seen.length, 1)
  assert.equal(seen[0].url, 'https://text.pollinations.ai/openai')
  const body = JSON.parse(seen[0].opts.body)
  assert.equal(body.model, 'openai')
  assert.deepEqual(body.messages, MESSAGES)
})

test('pollinations-openai: HTTP error dari upstream dilempar apa adanya', async () => {
  const fetchImpl = async () => ({ ok: false, status: 503, json: async () => ({}) })
  const provider = createPollinationsOpenAiProvider({ fetchImpl })
  await assert.rejects(() => provider.chat(MESSAGES), /POST gagal: HTTP 503/)
})

test('getAiProvider bawaan adalah rantai pollinations dua sumber', () => {
  resetAiProviderForTest()
  const provider = getAiProvider()
  assert.equal(provider.name, 'pollinations')
  assert.deepEqual(
    provider.sources.map((s) => s.name),
    ['pollinations-openai', 'pollinations']
  )
  resetAiProviderForTest()
})
