// Server skor game HTML: WebSocket minimal RFC 6455 di atas node:http +
// node:crypto, tanpa dependensi baru (paket ws di node_modules adalah
// dependensi library, bukan milik proyek, jadi tidak dipakai langsung).
//
// Protokol skor: klien game membuka koneksi WebSocket, mengirim SATU pesan
// JSON { type: 'score', token, score, name? }, server membalas satu pesan
// JSON { type: 'ack', ok, rank?, reason? } lalu MENUTUP koneksi. Satu
// koneksi untuk satu skor, sederhana dan gampang diaudit.
//
// Validasi sebelum skor disimpan (server tidak percaya skor mentah):
// 1. token HMAC valid, belum kedaluwarsa, dan game-nya cocok,
// 2. rate limit per uid: maks 10 skor per menit (in-memory),
// 3. skor angka 0 sampai batas per game (lihat MAX_SCORE).
// Yang disimpan hanya skor TERBAIK per pemain per game di namespace
// 'scores': key = id game, value = map digit -> { name, score, updatedAt }.
//
// Server hanya jalan bila env SCORE_WS_PORT terisi (lihat
// ensureScoreServer). Host yang diberikan ke game diambil dari env
// SCORE_WS_HOST, bawaan 127.0.0.1. Catatan deployment: 127.0.0.1 hanya
// bisa dijangkau dari mesin yang sama. Supaya HP pemain nyata bisa
// mengirim skor, owner perlu mengisi SCORE_WS_HOST dengan host publik
// atau tunnel yang mengarah ke port ini. Itu keputusan deployment owner,
// bukan sesuatu yang ditebak kode ini.
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { getGameSecret, verifyGameToken } from './game-token.js'
import { logger } from './logger.js'

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

export const MAX_SCORE = {
  default: 1000000,
  '2048': 100000000,
  tetris: 10000000,
}

export function maxScoreFor(game) {
  return MAX_SCORE[game] ?? MAX_SCORE.default
}

// Validasi batas skor per game. Mengembalikan { ok, reason? }.
export function validateScore(game, score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return { ok: false, reason: 'score-not-number' }
  if (score < 0) return { ok: false, reason: 'score-negative' }
  if (score > maxScoreFor(game)) return { ok: false, reason: 'score-too-big' }
  return { ok: true }
}

// Rate limit in-memory: jendela geser 60 detik per uid.
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const rateBuckets = new Map()

export function checkRateLimit(uid, now = Date.now()) {
  const key = String(uid)
  const hits = (rateBuckets.get(key) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(key, hits)
    return false
  }
  hits.push(now)
  rateBuckets.set(key, hits)
  return true
}

export function resetRateLimits() {
  rateBuckets.clear()
}

// Tangani satu pesan skor (string JSON, Buffer, atau objek yang sudah
// terparse). Dipakai jalur WebSocket dan langsung oleh tes. Selalu
// mengembalikan objek ack, tidak pernah melempar.
export function createScoreHandler({ storage, secret } = {}) {
  if (!storage) throw new Error('createScoreHandler: storage wajib')
  const key = secret ?? getGameSecret()
  return async function handleMessage(input) {
    let msg = input
    if (Buffer.isBuffer(msg)) msg = msg.toString('utf8')
    if (typeof msg === 'string') {
      try {
        msg = JSON.parse(msg)
      } catch {
        return { type: 'ack', ok: false, reason: 'bad-json' }
      }
    }
    if (!msg || typeof msg !== 'object' || msg.type !== 'score') {
      return { type: 'ack', ok: false, reason: 'bad-type' }
    }
    const verified = verifyGameToken(msg.token, { secret: key })
    if (!verified.ok) return { type: 'ack', ok: false, reason: verified.reason }
    const { uid, game } = verified.payload
    const scoreCheck = validateScore(game, msg.score)
    if (!scoreCheck.ok) return { type: 'ack', ok: false, reason: scoreCheck.reason }
    if (!checkRateLimit(uid)) return { type: 'ack', ok: false, reason: 'rate-limit' }
    try {
      const board = (await storage.get('scores', game)) ?? {}
      const prev = board[uid]
      const best = prev ? Math.max(prev.score, msg.score) : msg.score
      const name =
        typeof msg.name === 'string' && msg.name.trim() ? msg.name.trim().slice(0, 40) : prev?.name || String(uid)
      board[uid] = { name, score: best, updatedAt: Date.now() }
      await storage.set('scores', game, board)
      const rank = Object.values(board).filter((e) => e.score > best).length + 1
      return { type: 'ack', ok: true, rank, best }
    } catch (err) {
      logger.warn({ err: err.message, game }, 'simpan skor gagal')
      return { type: 'ack', ok: false, reason: 'storage' }
    }
  }
}

// --- WebSocket minimal (RFC 6455) ---

function acceptKey(key) {
  return createHash('sha1').update(key + WS_GUID).digest('base64')
}

function encodeFrame(opcode, payload) {
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload))
  let header
  if (data.length < 126) {
    header = Buffer.from([0x80 | opcode, data.length])
  } else if (data.length < 65536) {
    header = Buffer.alloc(4)
    header[0] = 0x80 | opcode
    header[1] = 126
    header.writeUInt16BE(data.length, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x80 | opcode
    header[1] = 127
    header.writeBigUInt64BE(BigInt(data.length), 2)
  }
  return Buffer.concat([header, data])
}

// Parser frame inkremental: menangani frame teks terfragmentasi
// (continuation), ping, dan close. Frame dari klien wajib bermasker.
function attachWebSocket(socket, onText) {
  let buffer = Buffer.alloc(0)
  let fragments = []
  let closed = false
  const send = (opcode, payload) => {
    if (!closed) {
      try {
        socket.write(encodeFrame(opcode, payload))
      } catch {}
    }
  }
  const close = () => {
    if (closed) return
    closed = true
    try {
      socket.write(encodeFrame(0x8, Buffer.alloc(0)))
    } catch {}
    socket.end()
  }
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    for (;;) {
      if (buffer.length < 2) return
      const fin = (buffer[0] & 0x80) !== 0
      const opcode = buffer[0] & 0x0f
      const masked = (buffer[1] & 0x80) !== 0
      let len = buffer[1] & 0x7f
      let offset = 2
      if (len === 126) {
        if (buffer.length < offset + 2) return
        len = buffer.readUInt16BE(offset)
        offset += 2
      } else if (len === 127) {
        if (buffer.length < offset + 8) return
        len = Number(buffer.readBigUInt64BE(offset))
        offset += 8
      }
      let maskKey = null
      if (masked) {
        if (buffer.length < offset + 4) return
        maskKey = buffer.subarray(offset, offset + 4)
        offset += 4
      }
      if (buffer.length < offset + len) return
      let payload = buffer.subarray(offset, offset + len)
      buffer = buffer.subarray(offset + len)
      if (maskKey) {
        const unmasked = Buffer.alloc(payload.length)
        for (let i = 0; i < payload.length; i++) unmasked[i] = payload[i] ^ maskKey[i % 4]
        payload = unmasked
      }
      if (opcode === 0x8) return close()
      if (opcode === 0x9) {
        send(0xa, payload)
        continue
      }
      if (opcode === 0xa) continue
      if (opcode === 0x1 || opcode === 0x2 || opcode === 0x0) {
        fragments.push(payload)
        if (fin) {
          const full = Buffer.concat(fragments).toString('utf8')
          fragments = []
          Promise.resolve()
            .then(() => onText(full))
            .then((ack) => {
              if (ack !== undefined) send(0x1, JSON.stringify(ack))
              close()
            })
            .catch(() => close())
        }
        continue
      }
      return close()
    }
  })
  socket.on('error', () => {})
  socket.on('close', () => {
    closed = true
  })
}

// Jalankan server skor. port 0 berarti port ephemeral dari OS (dipakai tes);
// port aktual yang terikat dikembalikan di hasil.
export function startScoreServer({ storage, port = 0, secret, host = '127.0.0.1' } = {}) {
  const handleMessage = createScoreHandler({ storage, secret })
  const server = createServer((req, res) => {
    res.writeHead(426, { 'content-type': 'text/plain' })
    res.end('websocket only')
  })
  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key']
    if (!key) {
      socket.destroy()
      return
    }
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${acceptKey(key)}\r\n` +
        '\r\n'
    )
    attachWebSocket(socket, handleMessage)
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => {
      const actualPort = server.address().port
      resolve({
        server,
        port: actualPort,
        handleMessage,
        close: () =>
          new Promise((done) => {
            server.close(() => done())
            server.closeAllConnections?.()
          }),
      })
    })
  })
}

// --- Singleton lazy untuk plugin ---

let singleton = null
let singletonPromise = null

export function getScoreServerState(env = process.env) {
  if (!singleton) return { running: false, port: null, wsUrl: null }
  const host = env.SCORE_WS_HOST || '127.0.0.1'
  return { running: true, port: singleton.port, wsUrl: `ws://${host}:${singleton.port}` }
}

// Mulai server skor sekali saja (lazy singleton), dan hanya bila env
// SCORE_WS_PORT terisi. Selain itu mengembalikan state nonaktif dan
// plugin mengirim game dengan ws = null (game tetap jalan, skor lokal).
export async function ensureScoreServer(storage, env = process.env) {
  if (singleton) return getScoreServerState(env)
  const port = Number(env.SCORE_WS_PORT || 0)
  if (!port) return getScoreServerState(env)
  if (!singletonPromise) {
    singletonPromise = startScoreServer({ storage, port, secret: getGameSecret(env) })
      .then((started) => {
        singleton = started
        logger.info({ port: started.port }, 'server skor game aktif')
        return started
      })
      .catch((err) => {
        logger.warn({ err: err.message }, 'server skor game gagal dimulai')
        return null
      })
      .finally(() => {
        singletonPromise = null
      })
  }
  await singletonPromise
  return getScoreServerState(env)
}

// Hentikan singleton (dipakai tes dan shutdown rapi).
export async function stopScoreServer() {
  if (singleton) {
    const current = singleton
    singleton = null
    await current.close()
  }
}
