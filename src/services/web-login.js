// Layanan kode login web dashboard (jalur cadangan lewat perintah .webcode).
// Kontrak lengkap ada di docs/WEB.md. Ringkasnya:
// - Namespace 'web_login', key = digit nomor member, value { codeHash, expiresAt }.
// - codeHash adalah sha256 hex dari kode; kode mentah TIDAK PERNAH disimpan
//   dan TIDAK PERNAH ditulis ke log. Kode hanya dikembalikan ke pemanggil
//   supaya bisa dibalas ke user lewat chat (.webcode).
// - Satu kode aktif per user: membuat kode baru menimpa record lama,
//   jadi kode lama langsung hangus.
// - Kode sekali pakai: verifikasi yang cocok menghapus record.
// - Masa berlaku 10 menit sejak dibuat.
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

export const WEB_LOGIN_NS = 'web_login'
export const WEB_CODE_LENGTH = 6
export const WEB_CODE_TTL_MS = 10 * 60 * 1000

// Alfabet kode manual: alfanumerik TANPA karakter ambigu.
// Dibuang: 0 dan O (mirip), 1 dan l dan I (mirip). Sisa 57 karakter.
export const ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZ' + // A-Z tanpa I dan O
  'abcdefghijkmnopqrstuvwxyz' + // a-z tanpa l
  '23456789' // 2-9 tanpa 0 dan 1

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '')

// now bisa berupa angka epoch ms, Date, fungsi penghasil salah satunya,
// atau kosong (dipakai jam asli). Pola yang sama dipakai layanan lain.
function resolveNow(now) {
  const value = typeof now === 'function' ? now() : now
  if (value instanceof Date) return value.getTime()
  const n = Number(value)
  return Number.isFinite(n) && value !== undefined && value !== null ? n : Date.now()
}

// rng bawaan memakai crypto (bukan Math.random) supaya kode sulit ditebak.
// rng suntikan (untuk tes) adalah fungsi penghasil angka [0, 1) seperti
// Math.random, atau bilangan bulat indeks langsung.
function pickIndex(rng) {
  if (typeof rng !== 'function') return randomInt(ALPHABET.length)
  const value = Number(rng())
  if (Number.isInteger(value) && value >= 0) return value % ALPHABET.length
  const frac = Number.isFinite(value) ? value : 0
  const idx = Math.floor(frac * ALPHABET.length)
  return Math.min(ALPHABET.length - 1, Math.max(0, idx))
}

export function generateWebCode(rng) {
  let code = ''
  for (let i = 0; i < WEB_CODE_LENGTH; i += 1) code += ALPHABET[pickIndex(rng)]
  return code
}

// sha256 hex dari kode. Diekspor untuk tes dan untuk pihak web yang
// memverifikasi jalur watcher (mereka menghitung hash yang sama).
export function hashCode(code) {
  return createHash('sha256').update(String(code ?? ''), 'utf8').digest('hex')
}

// Buat kode baru untuk satu nomor dan simpan hashnya.
// Mengembalikan { code, expiresAt }; code hanya untuk dibalas ke user.
export async function createWebCode(storage, digitsInput, { now, rng } = {}) {
  const digits = onlyDigits(digitsInput)
  if (!digits) throw new Error('createWebCode: digits wajib')
  const nowMs = resolveNow(now)
  const code = generateWebCode(rng)
  const expiresAt = nowMs + WEB_CODE_TTL_MS
  // set menimpa record lama: kode sebelumnya hangus seketika.
  await storage.set(WEB_LOGIN_NS, digits, { codeHash: hashCode(code), expiresAt })
  return { code, expiresAt }
}

// Verifikasi kode tebakan user terhadap record tersimpan.
// Hasil: { ok: true } atau { ok: false, reason: 'none' | 'expired' | 'mismatch' }.
// - 'none': tidak ada kode aktif untuk nomor ini.
// - 'expired': masa berlaku habis; record dihapus supaya bersih.
// - 'mismatch': hash beda; record DIPERTAHANKAN supaya user bisa coba lagi
//   sampai kedaluwarsa (kode yang benar tidak ikut hangus).
// Perbandingan hash memakai timingSafeEqual (panjang disamakan dulu).
export async function verifyWebCode(storage, digitsInput, code, { now } = {}) {
  const digits = onlyDigits(digitsInput)
  if (!digits) return { ok: false, reason: 'none' }
  const record = await storage.get(WEB_LOGIN_NS, digits)
  if (!record || typeof record.codeHash !== 'string') return { ok: false, reason: 'none' }
  const nowMs = resolveNow(now)
  if (!Number.isFinite(Number(record.expiresAt)) || nowMs >= Number(record.expiresAt)) {
    await storage.delete(WEB_LOGIN_NS, digits)
    return { ok: false, reason: 'expired' }
  }
  const expected = Buffer.from(record.codeHash, 'utf8')
  const actual = Buffer.from(hashCode(String(code ?? '').trim()), 'utf8')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'mismatch' }
  }
  // Sekali pakai: cocok berarti record langsung dihapus.
  await storage.delete(WEB_LOGIN_NS, digits)
  return { ok: true }
}
