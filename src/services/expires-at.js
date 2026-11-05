// Parser expiresAt untuk record login web.
// Web menulis expiresAt sebagai string ISO, bot lama menulis epoch ms.
// Keduanya harus diterima: angka epoch ms dipakai apa adanya, string
// angka dianggap epoch ms, string lain diurai dengan Date.parse.
// Nilai tidak valid menghasilkan NaN supaya pemanggil menganggapnya
// kedaluwarsa, sama seperti perilaku lama.
export function parseExpiresAtMs(value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return NaN
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
    return Date.parse(trimmed)
  }
  if (value !== undefined && value !== null) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return NaN
}

export function isExpiredExpiresAt(value, nowMs) {
  const expiresMs = parseExpiresAtMs(value)
  return !Number.isFinite(expiresMs) || nowMs >= expiresMs
}
