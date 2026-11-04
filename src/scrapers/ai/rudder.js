// AI chat lewat rudder.chat (Token Harbor, model th-rudder:free).
// Kredit: snippet "rudder.chat, Token Harbor AI Chat Unlimited",
// developer t.me/hazeloffc, kiriman user 2026-11-04. Logika inti
// dipertahankan, dikonversi dari CommonJS ke ESM.
// OPT-IN (aturan spesifikasi 1.3): fitur ini butuh cookie sesi dan USER_ID
// dari browser owner, diisi manual lewat .env:
//   RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO
// Tidak ada nilai kredensial apa pun yang hardcoded di repo. Bila env belum
// lengkap, isRudderConfigured() false dan plugin membalas belum dikonfigurasi.
import { createHmac } from 'node:crypto'
import https from 'node:https'

const BASE_URL = 'https://rudder.chat'
const MODEL = 'th-rudder:free'
const TZ = 'Asia/Jakarta'
const UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'

function credentials() {
  return {
    userId: process.env.RUDDER_USER_ID || '',
    c0: process.env.RUDDER_COOKIE_C0 || '',
    c1: process.env.RUDDER_COOKIE_C1 || '',
    thWho: process.env.RUDDER_TH_WHO || '',
  }
}

export function isRudderConfigured() {
  const c = credentials()
  return Boolean(c.userId && c.c0 && c.c1 && c.thWho)
}

function buildCookie() {
  const c = credentials()
  return `th_cookie_consent=essential; sb-auth-auth-token.0=${c.c0}; sb-auth-auth-token.1=${c.c1}; th_geo=1; th_who=${c.thWho}`
}

function httpRequest(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path)
    const payload = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method,
        headers: {
          'User-Agent': UA,
          Cookie: buildCookie(),
          ...headers,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
        timeout: 60000,
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => (raw += chunk.toString()))
        res.on('end', () => resolve({ status: res.statusCode, raw }))
      }
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
    if (payload) req.write(payload)
    req.end()
  })
}

let attestCache = null

async function getAttest() {
  if (attestCache && Date.now() - attestCache.t < 25 * 60 * 1000) return attestCache.d
  const r = await httpRequest('GET', '/api/chat/attest', {})
  if (r.status !== 200) throw new Error(`attest HTTP ${r.status}`)
  const d = JSON.parse(r.raw)
  attestCache = { d, t: Date.now() }
  return d
}

export function attestMessage(scheme, epoch, userId) {
  const n = String(epoch)
  switch (((scheme % 6) + 6) % 6) {
    case 0:
      return `${userId}:${n}`
    case 1:
      return `${n}|${userId}|th`
    case 2:
      return `th.${userId}.${n}.c`
    case 3:
      return `${n}~${userId.slice(0, 8)}~${userId}`
    case 4:
      return `rc/${userId}/${n}/rc`
    default:
      return `${userId.split('-').join('')}#${n}`
  }
}

async function attestHeader() {
  const a = await getAttest()
  if (!a || 'off' in a) return null
  const h = createHmac('sha256', a.key).update(attestMessage(a.scheme, a.epoch, credentials().userId)).digest('hex')
  return JSON.stringify({ s: a.scheme, e: a.epoch, h })
}

async function newSession() {
  const r = await httpRequest(
    'POST',
    '/api/direct-chat/sessions',
    { 'Content-Type': 'application/json', Accept: '*/*', Origin: BASE_URL },
    { model: MODEL, temporary: false }
  )
  if (r.status !== 200) throw new Error(`sessions HTTP ${r.status}: ${r.raw}`)
  return JSON.parse(r.raw).session
}

function sseRequest(headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + '/api/direct-chat/stream')
    const payload = JSON.stringify(body)
    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: { 'User-Agent': UA, Cookie: buildCookie(), ...headers, 'Content-Length': Buffer.byteLength(payload) },
        timeout: 120000,
      },
      (res) => {
        let buffer = ''
        const events = []
        const flushBlock = (block) => {
          let ev = 'message'
          let data = ''
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim()
            else if (line.startsWith('data:')) data += line.slice(5).trim()
          }
          if (data) events.push({ ev, data })
        }
        res.on('data', (chunk) => {
          buffer += chunk.toString()
          let idx
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            flushBlock(buffer.slice(0, idx))
            buffer = buffer.slice(idx + 2)
          }
        })
        res.on('end', () => {
          if (buffer.trim()) flushBlock(buffer)
          resolve({ status: res.statusCode, events })
        })
      }
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
    req.write(payload)
    req.end()
  })
}

// Kirim satu pesan chat ke rudder.chat. Mengembalikan
// { status, success, reply, sessionId } atau { status:false, error }.
export async function rudderChat(message, { sessionId = null } = {}) {
  const text = String(message || '').trim()
  if (!text) return { status: false, success: false, error: 'Pesan wajib diisi' }
  if (!isRudderConfigured()) return { status: false, success: false, error: 'NOT_CONFIGURED' }
  try {
    let sid = sessionId
    if (!sid) {
      const s = await newSession()
      sid = s.id
    }
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: BASE_URL,
      Referer: `${BASE_URL}/chat/${sid}`,
    }
    const at = await attestHeader()
    if (at) headers['x-th-ca'] = at

    const { status, events } = await sseRequest(headers, {
      sessionId: sid,
      content: text,
      model: MODEL,
      webSearch: 'auto',
      tz: TZ,
    })
    if (status !== 200) return { status: false, success: false, error: `HTTP ${status}` }

    let reply = ''
    let meta = null
    for (const { ev, data } of events) {
      let p
      try {
        p = JSON.parse(data)
      } catch {
        p = { raw: data }
      }
      if (ev === 'chunk' && typeof p.delta === 'string') reply += p.delta
      else if (ev === 'done') meta = p
      else if (ev === 'error') {
        return { status: false, success: false, error: p.message || p.code || 'stream error' }
      }
    }
    return { status: true, success: true, message: text, sessionId: sid, reply, meta }
  } catch (error) {
    return { status: false, success: false, error: error.message }
  }
}

export default rudderChat
