import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createGameToken, verifyGameToken, getGameSecret } from '../src/services/game-token.js'
import { startScoreServer, validateScore, maxScoreFor, resetRateLimits } from '../src/services/score-server.js'
import { buildGameHtml } from '../src/ui/htmlgame.js'
import { listGames, getGame } from '../src/services/game-catalog.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { handler as gamesHandler, i18n as gamesI18n } from '../plugins/game/games.js'
import { handler as gameHandler, i18n as gameI18n } from '../plugins/game/game.js'
import { handler as topgameHandler, i18n as topgameI18n } from '../plugins/game/topgame.js'

for (const mod of [gamesI18n, gameI18n, topgameI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}
delete process.env.SCORE_WS_PORT

const SECRET = 'unit-test-secret'

// --- Token HMAC ---

test('token: buat dan verifikasi ok, payload sesuai kontrak', () => {
  const token = createGameToken({ secret: SECRET, uid: '628123', game: 'hello', chat: '628123@s.whatsapp.net' })
  assert.match(token, /^[\w-]+\.[\w-]+$/)
  const res = verifyGameToken(token, { secret: SECRET })
  assert.equal(res.ok, true)
  assert.equal(res.payload.uid, '628123')
  assert.equal(res.payload.game, 'hello')
  assert.equal(res.payload.chat, '628123@s.whatsapp.net')
  assert.ok(res.payload.exp > Date.now())
  assert.ok(res.payload.exp <= Date.now() + 2 * 60 * 60 * 1000 + 1000)
})

test('token: tanda tangan salah ditolak', () => {
  const token = createGameToken({ secret: SECRET, uid: '628123', game: 'hello', chat: 'x' })
  const [payload, sig] = token.split('.')
  const tampered = `${payload}.${sig.startsWith('A') ? 'B' : 'A'}${sig.slice(1)}`
  assert.equal(verifyGameToken(tampered, { secret: SECRET }).ok, false)
  assert.equal(verifyGameToken(token, { secret: 'secret-lain' }).ok, false)
})

test('token: kedaluwarsa ditolak', () => {
  const token = createGameToken({ secret: SECRET, uid: '628123', game: 'hello', chat: 'x', ttlMs: -1000 })
  const res = verifyGameToken(token, { secret: SECRET })
  assert.equal(res.ok, false)
  assert.equal(res.reason, 'expired')
})

test('token: token game lain ditolak bila game diminta spesifik', () => {
  const token = createGameToken({ secret: SECRET, uid: '628123', game: 'hello', chat: 'x' })
  const res = verifyGameToken(token, { secret: SECRET, game: 'tetris' })
  assert.equal(res.ok, false)
  assert.equal(res.reason, 'game')
  assert.equal(verifyGameToken(token, { secret: SECRET, game: 'hello' }).ok, true)
})

test('getGameSecret: eksplisit menang, fallback hash BOT_NUMBER + OWNER_NUMBER', () => {
  assert.equal(getGameSecret({ GAME_TOKEN_SECRET: 'abc', BOT_NUMBER: '1', OWNER_NUMBER: '2' }), 'abc')
  const expected = createHash('sha256').update('12').digest('hex')
  assert.equal(getGameSecret({ BOT_NUMBER: '1', OWNER_NUMBER: '2' }), expected)
})

// --- Validasi skor ---

test('validasi skor: batas default dan per game', () => {
  assert.equal(maxScoreFor('hello'), 1000000)
  assert.equal(maxScoreFor('tetris'), 10000000)
  assert.equal(maxScoreFor('2048'), 100000000)
  assert.equal(validateScore('hello', 0).ok, true)
  assert.equal(validateScore('hello', 1000000).ok, true)
  assert.equal(validateScore('hello', 1000001).ok, false)
  assert.equal(validateScore('tetris', 10000000).ok, true)
  assert.equal(validateScore('tetris', 10000001).ok, false)
  assert.equal(validateScore('2048', 100000000).ok, true)
  assert.equal(validateScore('2048', 100000001).ok, false)
  assert.equal(validateScore('hello', -1).ok, false)
  assert.equal(validateScore('hello', '100').ok, false)
  assert.equal(validateScore('hello', Number.NaN).ok, false)
})

// --- buildGameHtml ---

test('buildGameHtml: placeholder __BOT_VARS_JSON__ diganti JSON vars', () => {
  const html = '<html><body><script>window.__BOT = __BOT_VARS_JSON__</script></body></html>'
  const out = buildGameHtml(html, { sid: 's1', lang: 'id', name: 'Senpai', token: 't', ws: null })
  assert.ok(!out.includes('__BOT_VARS_JSON__'))
  assert.ok(out.includes('"sid":"s1"'))
  assert.ok(out.includes('"token":"t"'))
})

test('buildGameHtml: tanpa placeholder, script disisipkan sebelum </body>', () => {
  const html = '<html><body><div>game</div></body></html>'
  const out = buildGameHtml(html, { sid: 's2', lang: 'en', name: 'A', token: 'x', ws: 'ws://127.0.0.1:9' })
  const scriptIdx = out.indexOf('window.__BOT')
  assert.ok(scriptIdx > out.indexOf('<div>game</div>'))
  assert.ok(scriptIdx < out.indexOf('</body>'))
  assert.ok(out.includes('"ws":"ws://127.0.0.1:9"'))
})

// --- Katalog ---

test('katalog: game hello terbaca dari folder games/', async () => {
  const games = await listGames()
  const hello = games.find((g) => g.id === 'hello')
  assert.ok(hello, 'hello ada di katalog')
  assert.equal(hello.title, 'KANA Hello')
  assert.equal(hello.height, 360)
  assert.ok(hello.htmlPath.endsWith('index.html'))
  assert.equal((await getGame('hello'))?.id, 'hello')
  assert.equal(await getGame('ngawur'), null)
})

// --- Server skor end-to-end ---

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) {
      return map.get(`${ns}:${key}`)
    },
    async set(ns, key, value) {
      map.set(`${ns}:${key}`, value)
    },
    async delete(ns, key) {
      map.delete(`${ns}:${key}`)
    },
    async keys(ns) {
      return [...map.keys()].filter((k) => k.startsWith(`${ns}:`)).map((k) => k.slice(ns.length + 1))
    },
  }
}

function wsRoundTrip(url, message) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const timer = setTimeout(() => {
      ws.close()
      reject(new Error('timeout menunggu ack'))
    }, 5000)
    ws.addEventListener('open', () => ws.send(JSON.stringify(message)))
    ws.addEventListener('message', (ev) => {
      clearTimeout(timer)
      try {
        ws.close()
      } catch {}
      resolve(JSON.parse(String(ev.data)))
    })
    ws.addEventListener('error', (ev) => {
      clearTimeout(timer)
      reject(new Error(`websocket error: ${ev.message ?? 'unknown'}`))
    })
  })
}

test('server skor end-to-end: skor valid tersimpan, token salah ditolak', async () => {
  resetRateLimits()
  const storage = fakeStorage()
  const started = await startScoreServer({ storage, port: 0, secret: SECRET })
  try {
    assert.ok(started.port > 0)
    const url = `ws://127.0.0.1:${started.port}`
    const token = createGameToken({ secret: SECRET, uid: '628123', game: 'hello', chat: '628123@s.whatsapp.net' })

    const ack = await wsRoundTrip(url, { type: 'score', token, score: 500, name: 'Senpai' })
    assert.equal(ack.type, 'ack')
    assert.equal(ack.ok, true)
    assert.equal(ack.rank, 1)
    const board = await storage.get('scores', 'hello')
    assert.equal(board['628123'].score, 500)
    assert.equal(board['628123'].name, 'Senpai')
    assert.ok(board['628123'].updatedAt > 0)

    const badAck = await wsRoundTrip(url, { type: 'score', token: 'token.ngawur', score: 10 })
    assert.equal(badAck.ok, false)
    assert.equal((await storage.get('scores', 'hello'))['628123'].score, 500, 'skor tidak berubah oleh token salah')

    const bigAck = await wsRoundTrip(url, { type: 'score', token, score: 999999999 })
    assert.equal(bigAck.ok, false, 'skor di atas batas ditolak')
  } finally {
    await started.close()
  }
})

test('handleMessage: skor terbaik yang disimpan, bukan skor terakhir', async () => {
  resetRateLimits()
  const storage = fakeStorage()
  const started = await startScoreServer({ storage, port: 0, secret: SECRET })
  try {
    const token = createGameToken({ secret: SECRET, uid: '628999', game: 'hello', chat: 'x' })
    const first = await started.handleMessage(JSON.stringify({ type: 'score', token, score: 700 }))
    assert.equal(first.ok, true)
    const second = await started.handleMessage(JSON.stringify({ type: 'score', token, score: 300 }))
    assert.equal(second.ok, true)
    assert.equal(second.best, 700)
    assert.equal((await storage.get('scores', 'hello'))['628999'].score, 700)
  } finally {
    await started.close()
  }
})

// --- Handler plugin dengan sock palsu ---

function fakeSock() {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
    relayMessage: async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    },
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock, { args = [], storage } = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    sender: '628123@s.whatsapp.net',
    senderDigits: '628123',
    pushName: 'Senpai',
    isGroup: false,
    isOwner: false,
    args,
    text: args.join(' '),
    command: '',
    lang: 'id',
    raw: { pushName: 'Senpai' },
    t: (k, vars) => translate('id', k, vars),
    say: (mood) => say('id', mood),
    reply: async (txt) => {
      replies.push(txt)
    },
    storage: storage ?? fakeStorage(),
    registry: { list: () => [], resolve: () => undefined, quarantined: [] },
  }
  return { ctx, replies }
}

function decodedHtmlPayload(relayed) {
  for (const r of relayed) {
    const data = r.message?.botForwardedMessage?.message?.richResponseMessage?.unifiedResponse?.data
    if (typeof data === 'string') {
      const text = Buffer.from(data, 'base64').toString('utf8')
      if (text.includes('<html') || text.includes('window.__BOT')) return text
    }
  }
  return ''
}

test('handler .games: daftar terkirim sebagai tombol .game <id> dan .topgame', async () => {
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await gamesHandler(ctx)
  assert.equal(relayed.length, 1)
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('.game hello'), 'ada tombol .game hello')
  assert.ok(payload.includes('.topgame'), 'ada tombol .topgame')
  assert.ok(payload.includes('KANA Hello'), 'judul game tampil')
})

test('handler .game hello: HTML game ter-relay dengan vars tersuntik, lalu tombol susulan', async () => {
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['hello'] })
  await gameHandler(ctx)
  assert.ok(relayed.length >= 2, `minimal 2 relay (game + tombol), dapat ${relayed.length}`)
  const html = decodedHtmlPayload(relayed).replace(/\\"/g, '"')
  assert.ok(html.includes('window.__BOT'), 'vars __BOT tersuntik ke HTML')
  assert.ok(html.includes('"lang":"id"'))
  assert.ok(html.includes('"name":"Senpai"'))
  assert.ok(html.includes('"ws":null'), 'ws null karena SCORE_WS_PORT kosong')
  const buttonsPayload = JSON.stringify(relayed[relayed.length - 1].message)
  assert.ok(buttonsPayload.includes('.game hello'), 'ada tombol main lagi')
  assert.ok(buttonsPayload.includes('.topgame hello'), 'ada tombol leaderboard')
  assert.ok(buttonsPayload.includes('.games'), 'ada tombol daftar game')
})

test('handler .game tanpa id dan id tak dikenal: balasan berisi daftar id', async () => {
  const { sock } = fakeSock()
  const a = fakeCtx(sock, { args: [] })
  await gameHandler(a.ctx)
  assert.match(a.replies[0], /hello/)
  const b = fakeCtx(sock, { args: ['ngawur'] })
  await gameHandler(b.ctx)
  assert.match(b.replies[0], /ngawur/)
  assert.match(b.replies[0], /hello/)
})

test('handler .topgame: ringkasan dan papan top 10 dari storage', async () => {
  const storage = fakeStorage()
  await storage.set('scores', 'hello', {
    628111: { name: 'Juara', score: 900, updatedAt: 1 },
    628123: { name: 'Senpai', score: 500, updatedAt: 2 },
  })
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['hello'], storage })
  await topgameHandler(ctx)
  assert.equal(relayed.length, 1)
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('Juara'), 'nama juara tampil')
  assert.ok(payload.includes('900'), 'skor juara tampil')
  assert.ok(payload.indexOf('Juara') < payload.indexOf('Senpai'), 'urut desc')

  const before = relayed.length
  const empty = fakeCtx(sock, { args: [], storage: fakeStorage() })
  await topgameHandler(empty.ctx)
  assert.equal(relayed.length, before + 1, 'ringkasan kosong tetap terkirim dengan tombol')
  const emptyPayload = JSON.stringify(relayed[relayed.length - 1].message)
  assert.ok(emptyPayload.includes('.games'), 'ada tombol daftar game')
})
