// Token skor game HTML: HMAC-SHA256 di atas payload base64url.
// Format token: <payloadB64>.<sigB64>
// payload: { uid, game, chat, exp } dengan exp epoch ms, umur bawaan 2 jam.
// Token ini yang membuktikan skor datang dari sesi game yang bot kirim,
// bukan dikarang pemain. Rahasia tidak pernah ditulis ke log atau HTML
// selain token turunannya sendiri.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const GAME_TOKEN_TTL_MS = 2 * 60 * 60 * 1000

// Resolusi rahasia: env GAME_TOKEN_SECRET bila terisi, selain itu hash
// sha256 dari gabungan BOT_NUMBER + OWNER_NUMBER (keduanya dari env).
// Bot yang sudah pairing selalu punya dua nomor itu, jadi token tetap
// bisa dibuat tanpa konfigurasi tambahan.
export function getGameSecret(env = process.env) {
  const explicit = String(env.GAME_TOKEN_SECRET ?? '').trim()
  if (explicit) return explicit
  const seed = `${env.BOT_NUMBER ?? ''}${env.OWNER_NUMBER ?? ''}`
  return createHash('sha256').update(seed).digest('hex')
}

function b64urlEncode(text) {
  return Buffer.from(text, 'utf8').toString('base64url')
}

function sign(payloadB64, secret) {
  return createHmac('sha256', String(secret)).update(payloadB64).digest('base64url')
}

// Buat token untuk satu pemain, satu game, satu chat.
export function createGameToken({ secret, uid, game, chat, ttlMs = GAME_TOKEN_TTL_MS, now = Date.now() } = {}) {
  if (!uid) throw new Error('createGameToken: uid wajib')
  if (!game) throw new Error('createGameToken: game wajib')
  const key = secret ?? getGameSecret()
  const payload = { uid: String(uid), game: String(game), chat: String(chat ?? ''), exp: now + ttlMs }
  const payloadB64 = b64urlEncode(JSON.stringify(payload))
  return `${payloadB64}.${sign(payloadB64, key)}`
}

// Verifikasi token. Opsi game: bila terisi, token untuk game lain ditolak.
// Mengembalikan { ok, payload? , reason? } dan tidak pernah melempar.
export function verifyGameToken(token, { secret, game, now = Date.now() } = {}) {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, reason: 'format' }
  const [payloadB64, sigB64, ...rest] = token.split('.')
  if (!payloadB64 || !sigB64 || rest.length) return { ok: false, reason: 'format' }
  const key = secret ?? getGameSecret()
  const expected = sign(payloadB64, key)
  const got = Buffer.from(sigB64)
  const want = Buffer.from(expected)
  if (got.length !== want.length || !timingSafeEqual(got, want)) return { ok: false, reason: 'signature' }
  let payload
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return { ok: false, reason: 'format' }
  }
  if (!payload || typeof payload !== 'object' || !payload.uid || !payload.game) {
    return { ok: false, reason: 'format' }
  }
  if (typeof payload.exp !== 'number' || now > payload.exp) return { ok: false, reason: 'expired' }
  if (game && payload.game !== game) return { ok: false, reason: 'game' }
  return { ok: true, payload }
}
