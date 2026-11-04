import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  getMemory,
  appendTurn,
  clearMemory,
  aiMemoryKey,
  AI_MEMORY_MAX_MESSAGES,
} from '../src/services/ai-memory.js'
import {
  getAiProvider,
  messagesToPrompt,
  setAiProviderForTest,
  resetAiProviderForTest,
} from '../src/services/ai-provider.js'
import {
  createJadibotManager,
  setJadibotManager,
  getJadibotManager,
  listJadibotSessions,
  validateJadibotName,
  pairingCodeFor,
  MAX_SESSIONS,
} from '../src/services/jadibot.js'
import { handler as aiHandler, i18n as aiI18n } from '../plugins/ai/ai.js'
import { chunkTtsText } from '../plugins/ai/tts.js'
import { extractArticleText } from '../plugins/ai/ringkas.js'

function memoryStorage() {
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

function makeT(dict) {
  return (key, vars = {}) => {
    const parts = key.split('.')
    let cur = dict
    for (const p of parts) cur = cur?.[p]
    if (typeof cur !== 'string') return key
    return cur.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m))
  }
}

// --- ai-memory ---

test('ai-memory: kosong di awal, appendTurn menyimpan satu pasang', async () => {
  const storage = memoryStorage()
  assert.deepEqual(await getMemory(storage, '628111'), [])
  const saved = await appendTurn(storage, '628111', 'halo', 'halo juga')
  assert.deepEqual(saved, [
    { role: 'user', content: 'halo' },
    { role: 'assistant', content: 'halo juga' },
  ])
  assert.deepEqual(await getMemory(storage, '628111'), saved)
  assert.equal(aiMemoryKey('628111'), 'aimem:628111')
  // Namespace dan key sesuai kontrak.
  assert.deepEqual(await storage.keys('kv'), ['aimem:628111'])
})

test('ai-memory: terpotong ke 6 pasang terakhir (12 pesan)', async () => {
  const storage = memoryStorage()
  for (let i = 1; i <= 8; i++) {
    await appendTurn(storage, '628222', `tanya ${i}`, `jawab ${i}`)
  }
  const mem = await getMemory(storage, '628222')
  assert.equal(mem.length, AI_MEMORY_MAX_MESSAGES)
  assert.equal(mem.length, 12)
  // Pasang tertua yang tersisa adalah pasang ke-3.
  assert.deepEqual(mem[0], { role: 'user', content: 'tanya 3' })
  assert.deepEqual(mem[11], { role: 'assistant', content: 'jawab 8' })
})

test('ai-memory: clearMemory mengosongkan dan memori per pengguna terpisah', async () => {
  const storage = memoryStorage()
  await appendTurn(storage, '628333', 'a', 'b')
  await appendTurn(storage, '628444', 'c', 'd')
  await clearMemory(storage, '628333')
  assert.deepEqual(await getMemory(storage, '628333'), [])
  assert.equal((await getMemory(storage, '628444')).length, 2)
})

test('ai-memory: data rusak di storage dianggap kosong', async () => {
  const storage = memoryStorage()
  await storage.set('kv', 'aimem:628555', 'bukan array')
  assert.deepEqual(await getMemory(storage, '628555'), [])
  await storage.set('kv', 'aimem:628555', [{ role: 'aneh', content: 'x' }, { role: 'user', content: 'ok' }])
  assert.deepEqual(await getMemory(storage, '628555'), [{ role: 'user', content: 'ok' }])
})

// --- ai-provider ---

test('messagesToPrompt merangkai system, user, assistant dan memotong 4000', () => {
  const prompt = messagesToPrompt([
    { role: 'system', content: 'Kamu KANA' },
    { role: 'user', content: 'halo' },
    { role: 'assistant', content: 'hai' },
    { role: 'user', content: 'apa kabar' },
  ])
  assert.equal(prompt, 'Kamu KANA\nUser: halo\nAssistant: hai\nUser: apa kabar')
  const long = messagesToPrompt([{ role: 'user', content: 'x'.repeat(5000) }])
  assert.equal(long.length, 4000)
  assert.equal(messagesToPrompt([]), '')
})

test('getAiProvider: tanpa rudder jatuh ke pollinations, override tes dihormati', () => {
  resetAiProviderForTest()
  // Env rudder tidak diisi di lingkungan tes, jadi fallback publik.
  const provider = getAiProvider()
  assert.ok(provider)
  assert.equal(provider.name, 'pollinations')
  assert.equal(typeof provider.chat, 'function')
  const stub = { name: 'stub', chat: async () => 'ok' }
  setAiProviderForTest(stub)
  assert.equal(getAiProvider(), stub)
  setAiProviderForTest(null)
  assert.equal(getAiProvider(), null)
  resetAiProviderForTest()
})

// --- handler .ai ---

function fakeAiCtx(storage, { text = 'halo ai', lang = 'id' } = {}) {
  const replies = []
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
  }
  const ctx = {
    sock,
    chat: '628111@s.whatsapp.net',
    sender: '628111@s.whatsapp.net',
    senderDigits: '628111',
    pushName: 'Senpai',
    isGroup: false,
    isOwner: false,
    args: text.split(/\s+/).filter(Boolean),
    text,
    command: 'ai',
    lang,
    t: makeT(aiI18n[lang]),
    say: () => 'mood~',
    reply: async (txt) => {
      replies.push(txt)
    },
    storage,
    registry: { list: () => [], resolve: () => null },
    raw: { pushName: 'Senpai' },
    quoted: null,
    mentionedJids: [],
  }
  return { ctx, replies, sent }
}

test('handler .ai memakai memori saat provider stub tersedia', async () => {
  const storage = memoryStorage()
  const seenMessages = []
  setAiProviderForTest({
    name: 'stub',
    chat: async (messages) => {
      seenMessages.push(structuredClone(messages))
      return 'Halo juga! Ini jawaban stub.'
    },
  })
  try {
    const first = fakeAiCtx(storage, { text: 'halo ai' })
    await aiHandler(first.ctx)
    // Balasan stub terkirim (lewat reply thinking + tombol fallback teks).
    const allText = [...first.replies, ...first.sent.map((s) => s.content.text || '')].join('\n')
    assert.match(allText, /jawaban stub/)
    // Turn tersimpan di memori.
    const mem = await getMemory(storage, '628111')
    assert.deepEqual(mem, [
      { role: 'user', content: 'halo ai' },
      { role: 'assistant', content: 'Halo juga! Ini jawaban stub.' },
    ])
    // Provider menerima system + pesan baru pada panggilan pertama.
    assert.equal(seenMessages[0][0].role, 'system')
    assert.deepEqual(seenMessages[0].at(-1), { role: 'user', content: 'halo ai' })

    // Panggilan kedua: riwayat ikut terkirim ke provider.
    const second = fakeAiCtx(storage, { text: 'lanjut dong' })
    await aiHandler(second.ctx)
    const secondMessages = seenMessages[1]
    assert.ok(secondMessages.some((m) => m.role === 'assistant' && m.content.includes('jawaban stub')))
    assert.deepEqual(secondMessages.at(-1), { role: 'user', content: 'lanjut dong' })
    assert.equal((await getMemory(storage, '628111')).length, 4)
  } finally {
    resetAiProviderForTest()
  }
})

test('handler .ai dengan provider null membalas belum terkonfigurasi', async () => {
  const storage = memoryStorage()
  setAiProviderForTest(null)
  try {
    const { ctx, replies } = fakeAiCtx(storage, { text: 'halo' })
    await aiHandler(ctx)
    assert.equal(replies.length, 1)
    assert.match(replies[0], /belum dikonfigurasi/)
    assert.deepEqual(await getMemory(storage, '628111'), [])
  } finally {
    resetAiProviderForTest()
  }
})

test('handler .ai tanpa teks membalas petunjuk', async () => {
  const storage = memoryStorage()
  setAiProviderForTest({ name: 'stub', chat: async () => 'x' })
  try {
    const { ctx, replies } = fakeAiCtx(storage, { text: '' })
    ctx.args = []
    await aiHandler(ctx)
    assert.equal(replies.length, 1)
    assert.match(replies[0], /Ketik pesannya dulu/)
  } finally {
    resetAiProviderForTest()
  }
})

// --- jadibot manager ---

function fakeRegistry() {
  return { list: () => [], resolve: () => null, quarantined: [], befores: [], participantHandlers: [] }
}

test('validateJadibotName dan pairingCodeFor', () => {
  assert.equal(validateJadibotName('kana2'), 'kana2')
  assert.equal(validateJadibotName('ab'), null)
  assert.equal(validateJadibotName('nama spasi'), null)
  assert.equal(validateJadibotName('a'.repeat(17)), null)
  assert.equal(pairingCodeFor('kana2'), 'KANA2KAN')
  assert.equal(pairingCodeFor('ab'), 'ABKANAKA')
  assert.equal(pairingCodeFor('kana2').length, 8)
})

test('jadibot manager dengan konektor palsu: start, list, stop, notif', async () => {
  const storage = memoryStorage()
  const calls = []
  const stopped = []
  const notices = []
  const manager = createJadibotManager({
    storage,
    registry: fakeRegistry(),
    owners: ['628999'],
    defaultLang: 'id',
    notify: async (n) => notices.push(n),
    startConnectionFn: async ({ name, number, onMessage }) => {
      calls.push({ name, number, hasOnMessage: typeof onMessage === 'function' })
      return { stop: async () => stopped.push(name) }
    },
  })
  const notifySock = {
    sendMessage: async () => ({}),
  }
  const record = await manager.start('kana2', '6281234567890', { sock: notifySock, chat: '628999@s.whatsapp.net' })
  assert.equal(record.name, 'kana2')
  assert.equal(record.number, '6281234567890')
  assert.ok(record.startedAt)
  assert.equal(record.pairingCode, 'KANA2KAN')
  assert.deepEqual(calls, [{ name: 'kana2', number: '6281234567890', hasOnMessage: true }])
  assert.equal(notices.length, 1)
  assert.match(notices[0].text, /KANA2KAN/)
  assert.deepEqual(manager.list(), [{ name: 'kana2', number: '6281234567890', startedAt: record.startedAt }])

  // Nama duplikat dan nama/nomor tidak valid ditolak.
  await assert.rejects(() => manager.start('kana2', '6281234567890'), (e) => e.code === 'DUPLICATE')
  await assert.rejects(() => manager.start('x', '6281234567890'), (e) => e.code === 'INVALID_NAME')
  await assert.rejects(() => manager.start('kana3', '123'), (e) => e.code === 'INVALID_NUMBER')

  assert.equal(await manager.stop('kana2'), true)
  assert.deepEqual(stopped, ['kana2'])
  assert.deepEqual(manager.list(), [])
  assert.equal(await manager.stop('kana2'), false)
})

test('jadibot manager: batas MAX_SESSIONS ditegakkan', async () => {
  const storage = memoryStorage()
  const manager = createJadibotManager({
    storage,
    registry: fakeRegistry(),
    owners: ['628999'],
    startConnectionFn: async () => ({ stop: async () => {} }),
  })
  assert.equal(MAX_SESSIONS, 3)
  await manager.start('satu', '6281111111111')
  await manager.start('dua', '6282222222222')
  await manager.start('tiga', '6283333333333')
  assert.equal(manager.list().length, 3)
  await assert.rejects(() => manager.start('empat', '6284444444444'), (e) => e.code === 'MAX_SESSIONS')
  await manager.stop('dua')
  const ok = await manager.start('empat', '6284444444444')
  assert.equal(ok.name, 'empat')
})

test('jadibot singleton: listJadibotSessions mengikuti manager aktif', async () => {
  const storage = memoryStorage()
  const manager = createJadibotManager({
    storage,
    registry: fakeRegistry(),
    owners: ['628999'],
    startConnectionFn: async () => ({ stop: async () => {} }),
  })
  setJadibotManager(manager)
  try {
    assert.equal(getJadibotManager(), manager)
    assert.deepEqual(listJadibotSessions(), [])
    await manager.start('solo', '6285555555555')
    const list = listJadibotSessions()
    assert.equal(list.length, 1)
    assert.equal(list[0].name, 'solo')
    assert.equal(list[0].number, '6285555555555')
    assert.ok(list[0].startedAt)
  } finally {
    await manager.stop('solo')
    setJadibotManager(null)
  }
  assert.deepEqual(listJadibotSessions(), [])
})

// --- helper plugin lain ---

test('chunkTtsText memotong di batas kata, maksimal 200 per potongan', () => {
  assert.deepEqual(chunkTtsText('halo dunia'), ['halo dunia'])
  const long = Array.from({ length: 60 }, (_, i) => `kata${i}`).join(' ')
  const chunks = chunkTtsText(long, 200)
  assert.ok(chunks.length >= 2)
  for (const c of chunks) assert.ok(c.length <= 200)
  assert.equal(chunks.join(' '), long)
  assert.deepEqual(chunkTtsText(''), [])
})

test('extractArticleText mengambil h1 h2 p dan membuang sisanya', () => {
  const html =
    '<html><body><h1>Judul Besar</h1><p>Isi pertama yang panjang.</p><div>abaikan ini</div><h2>Sub Judul</h2><p>Isi kedua.</p><script>var x=1</script></body></html>'
  const text = extractArticleText(html)
  assert.match(text, /Judul Besar/)
  assert.match(text, /Isi pertama/)
  assert.match(text, /Sub Judul/)
  assert.ok(!text.includes('abaikan ini'))
  assert.equal(extractArticleText(''), '')
})
