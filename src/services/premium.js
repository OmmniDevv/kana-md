// Layanan premium dan sewa bot (keputusan owner 2026-11-05).
// Premium adalah status manual yang diaktivasi owner lewat .addprem,
// tanpa payment gateway dan tanpa bukti bayar buatan. Sewa ada dua rasa:
// sewa grup (key = JID grup, membuka fitur premium di grup itu saja) dan
// sewa jadibot personal (key = digit nomor, hanya membuka .jadibot).
//
// Penyimpanan mengikuti pola storage bot:
// - namespace 'premium', key = digit nomor,
//   value { expiresAt: epoch ms | null (permanen), addedBy, addedAt, note }
// - namespace 'sewa_bot', key = JID grup atau digit nomor,
//   value { expiresAt, addedBy, addedAt, type: 'group' | 'jadibot', note }
// - namespace 'jadibot_sessions', key = nama sesi kecil,
//   value { number, startedBy, startedAt } ditulis plugin jadibot supaya
//   gate tahu siapa pemegang sesi aktif (pengecualian .stopjadibot).
import { parseExpiresAtMs } from './expires-at.js'

export const PREMIUM_NS = 'premium'
export const SEWA_NS = 'sewa_bot'
export const JADIBOT_SESSION_NS = 'jadibot_sessions'

export const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '')

const DAY_MS = 24 * 60 * 60 * 1000
const UNIT_MS = { d: DAY_MS, w: 7 * DAY_MS, y: 365 * DAY_MS }

// Urai token durasi owner: '7d', '30d', '2w', '1y', angka polos (hari),
// 'permanen'/'permanent'/'0' (tanpa kedaluwarsa). Mengembalikan
// { permanent: boolean, ms: number } atau null bila token tidak dikenal.
export function parseDuration(token) {
  const raw = String(token ?? '').trim().toLowerCase()
  if (!raw) return null
  if (raw === 'permanen' || raw === 'permanent' || raw === '0') return { permanent: true, ms: 0 }
  const m = raw.match(/^(\d+)(d|w|y)?$/)
  if (!m) return null
  const amount = Number(m[1])
  if (!Number.isFinite(amount) || amount <= 0) return null
  return { permanent: false, ms: amount * (UNIT_MS[m[2] ?? 'd'] ?? DAY_MS) }
}

export function isDurationToken(token) {
  return parseDuration(token) !== null
}

// Kedaluwarsa dari record premium/sewa: expiresAt null berarti permanen.
// Nilai rusak dianggap kedaluwarsa (gagal aman, sama seperti helper login).
export function recordStatus(record, nowMs = Date.now()) {
  if (!record) return { exists: false, active: false, expired: false, permanent: false, expiresAt: null }
  const raw = record.expiresAt
  if (raw === null || raw === undefined) {
    return { exists: true, active: true, expired: false, permanent: true, expiresAt: null }
  }
  const expiresAt = parseExpiresAtMs(raw)
  if (!Number.isFinite(expiresAt)) {
    return { exists: true, active: false, expired: true, permanent: false, expiresAt: null }
  }
  const active = nowMs < expiresAt
  return { exists: true, active, expired: !active, permanent: false, expiresAt }
}

// Sisa waktu manusiawi untuk pesan status. lang 'en' memakai label Inggris.
export function remainingText(ms, lang = 'id') {
  const n = Math.max(0, Math.floor(Number(ms) || 0))
  const en = lang === 'en'
  if (n <= 0) return en ? 'less than a minute' : 'kurang dari semenit'
  const days = Math.floor(n / DAY_MS)
  const hours = Math.floor((n % DAY_MS) / (60 * 60 * 1000))
  const minutes = Math.floor((n % (60 * 60 * 1000)) / (60 * 1000))
  const parts = []
  if (days) parts.push(en ? `${days} day${days > 1 ? 's' : ''}` : `${days} hari`)
  if (hours) parts.push(en ? `${hours} hour${hours > 1 ? 's' : ''}` : `${hours} jam`)
  if (!days && minutes) parts.push(en ? `${minutes} minute${minutes > 1 ? 's' : ''}` : `${minutes} menit`)
  return parts.join(' ') || (en ? 'less than a minute' : 'kurang dari semenit')
}

// Hitung expiresAt baru untuk add: perpanjangan menumpuk dari sisa aktif
// yang lama (owner-friendly), permanen di salah satu sisi jadi permanen.
export function nextExpiresAt(existingRecord, duration, nowMs = Date.now()) {
  if (!duration || duration.permanent) return null
  const status = recordStatus(existingRecord, nowMs)
  if (status.permanent) return null
  const base = status.active && status.expiresAt ? status.expiresAt : nowMs
  return base + duration.ms
}

export async function getPremiumRecord(storage, digits) {
  if (!storage || !digits) return null
  return (await storage.get(PREMIUM_NS, onlyDigits(digits))) ?? null
}

export async function getPremiumStatus(storage, digits, nowMs = Date.now()) {
  const record = await getPremiumRecord(storage, digits)
  return { record, ...recordStatus(record, nowMs) }
}

export async function isPremium(storage, digits, nowMs = Date.now()) {
  const status = await getPremiumStatus(storage, digits, nowMs)
  return status.active
}

export async function addPremium(storage, digits, { duration, addedBy = '', note = '', now } = {}) {
  const key = onlyDigits(digits)
  const parsed = typeof duration === 'string' || duration === undefined ? parseDuration(duration ?? '30d') : duration
  if (!parsed) throw new Error('Durasi premium tidak valid')
  const nowMs = Number.isFinite(Number(now)) && now !== undefined ? Number(now) : Date.now()
  const existing = await getPremiumRecord(storage, key)
  const record = {
    expiresAt: nextExpiresAt(existing, parsed, nowMs),
    addedBy: onlyDigits(addedBy) || String(addedBy ?? ''),
    addedAt: nowMs,
    note: String(note ?? ''),
  }
  await storage.set(PREMIUM_NS, key, record)
  return record
}

export async function removePremium(storage, digits) {
  const key = onlyDigits(digits)
  const existing = await getPremiumRecord(storage, key)
  if (!existing) return false
  await storage.delete(PREMIUM_NS, key)
  return true
}

export async function listPremium(storage, nowMs = Date.now()) {
  if (!storage) return []
  let keys = []
  try {
    keys = await storage.keys(PREMIUM_NS)
  } catch {
    return []
  }
  const rows = []
  for (const key of keys) {
    const record = await storage.get(PREMIUM_NS, key)
    if (!record) continue
    rows.push({ digits: key, record, ...recordStatus(record, nowMs) })
  }
  rows.sort((a, b) => a.digits.localeCompare(b.digits))
  return rows
}

export async function getSewaRecord(storage, key) {
  if (!storage || !key) return null
  return (await storage.get(SEWA_NS, String(key))) ?? null
}

export async function getSewaStatus(storage, key, nowMs = Date.now()) {
  const record = await getSewaRecord(storage, key)
  return { record, ...recordStatus(record, nowMs) }
}

export async function addSewa(storage, key, { type = 'group', duration, addedBy = '', note = '', now } = {}) {
  const parsed = typeof duration === 'string' || duration === undefined ? parseDuration(duration ?? '30d') : duration
  if (!parsed) throw new Error('Durasi sewa tidak valid')
  const nowMs = Number.isFinite(Number(now)) && now !== undefined ? Number(now) : Date.now()
  const existing = await getSewaRecord(storage, key)
  const record = {
    expiresAt: nextExpiresAt(existing, parsed, nowMs),
    addedBy: onlyDigits(addedBy) || String(addedBy ?? ''),
    addedAt: nowMs,
    type: type === 'jadibot' ? 'jadibot' : 'group',
    note: String(note ?? ''),
  }
  await storage.set(SEWA_NS, String(key), record)
  return record
}

export async function removeSewa(storage, key) {
  const existing = await getSewaRecord(storage, key)
  if (!existing) return false
  await storage.delete(SEWA_NS, String(key))
  return true
}

export async function listSewa(storage, nowMs = Date.now()) {
  if (!storage) return []
  let keys = []
  try {
    keys = await storage.keys(SEWA_NS)
  } catch {
    return []
  }
  const rows = []
  for (const key of keys) {
    const record = await storage.get(SEWA_NS, key)
    if (!record) continue
    rows.push({ key, record, ...recordStatus(record, nowMs) })
  }
  rows.sort((a, b) => a.key.localeCompare(b.key))
  return rows
}

export async function isGroupRented(storage, chatJid, nowMs = Date.now()) {
  if (!chatJid || !String(chatJid).endsWith('@g.us')) return false
  const status = await getSewaStatus(storage, String(chatJid), nowMs)
  return status.active && status.record?.type !== 'jadibot'
}

export async function isJadibotRented(storage, digits, nowMs = Date.now()) {
  const status = await getSewaStatus(storage, onlyDigits(digits), nowMs)
  return status.active && status.record?.type === 'jadibot'
}

// Apakah nomor ini pemegang sesi jadibot yang masih tercatat aktif.
// Dipakai pengecualian .stopjadibot: sesi harus tetap bisa dihentikan
// walau premium pemiliknya baru saja berakhir.
export async function hasJadibotSession(storage, digits, nowMs = Date.now()) {
  if (!storage) return false
  const key = onlyDigits(digits)
  if (!key) return false
  let keys = []
  try {
    keys = await storage.keys(JADIBOT_SESSION_NS)
  } catch {
    return false
  }
  for (const name of keys) {
    const record = await storage.get(JADIBOT_SESSION_NS, name)
    if (!record) continue
    if (onlyDigits(record.startedBy) === key || onlyDigits(record.number) === key) return true
  }
  return false
}

// Keputusan gate terpusat untuk satu perintah premium.
// Mengembalikan { allowed, via } dengan via salah satu dari:
// 'premium' | 'group-rent' | 'jadibot-rent' | 'jadibot-session' | null.
export async function checkPremiumAccess(storage, { digits, chat, isGroup = false, commandName = '', now } = {}) {
  const nowMs = Number.isFinite(Number(now)) && now !== undefined ? Number(now) : Date.now()
  const name = String(commandName ?? '').toLowerCase()
  if (await isPremium(storage, digits, nowMs)) return { allowed: true, via: 'premium' }
  if (name === 'jadibot') {
    if (await isJadibotRented(storage, digits, nowMs)) return { allowed: true, via: 'jadibot-rent' }
    return { allowed: false, via: null }
  }
  if (name === 'stopjadibot') {
    if (await isJadibotRented(storage, digits, nowMs)) return { allowed: true, via: 'jadibot-rent' }
    if (await hasJadibotSession(storage, digits, nowMs)) return { allowed: true, via: 'jadibot-session' }
    return { allowed: false, via: null }
  }
  if (isGroup && chat && (await isGroupRented(storage, chat, nowMs))) {
    return { allowed: true, via: 'group-rent' }
  }
  return { allowed: false, via: null }
}

// Tingkat berbayar untuk kuota limit grup: premium personal, atau di
// dalam grup yang sewa grupnya aktif. Sewa jadibot tidak ikut menaikkan
// kuota unduhan/upscale.
export async function hasPaidTier(storage, { digits, chat, isGroup = false, now } = {}) {
  const nowMs = Number.isFinite(Number(now)) && now !== undefined ? Number(now) : Date.now()
  if (await isPremium(storage, digits, nowMs)) return true
  if (isGroup && chat) return isGroupRented(storage, chat, nowMs)
  return false
}
