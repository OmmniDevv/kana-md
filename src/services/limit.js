// Limit harian bergrup untuk fitur berat yang TIDAK dikunci premium
// (koreksi owner 2026-11-05): downloader berat dan upscale tetap bisa
// dipakai semua orang, tetapi dibatasi per hari. Premium personal dan
// sewa grup (di grup itu) menaikkan kuotanya.
//
// Penyimpanan: namespace 'usage_limits',
// key = '<digit>:<grup>:<tanggal WIB YYYY-MM-DD>', value { count }.
// Percobaan yang ditolak limit tidak menambah hitungan: consume hanya
// menaikkan count bila masih di bawah kuota.
import { wibDateString } from './user-service.js'

export const LIMITS_NS = 'usage_limits'

export const LIMIT_GROUPS = {
  download: { free: 5, paid: 50 },
  upscale: { free: 3, paid: 20 },
}

export function limitGroupConfig(group) {
  return LIMIT_GROUPS[String(group ?? '')] ?? null
}

export function quotaFor(group, paidTier = false) {
  const cfg = limitGroupConfig(group)
  if (!cfg) return Infinity
  return paidTier ? cfg.paid : cfg.free
}

export function usageKey(digits, group, date = new Date()) {
  return `${String(digits ?? '').replace(/\D/g, '')}:${group}:${wibDateString(date)}`
}

export async function getUsage(storage, digits, group, { now } = {}) {
  if (!storage || !limitGroupConfig(group)) return 0
  const date = now !== undefined ? new Date(now) : new Date()
  const record = await storage.get(LIMITS_NS, usageKey(digits, group, date))
  return Math.max(0, Number(record?.count) || 0)
}

// Intip keadaan limit tanpa mengubah apa pun (buat .cekprem/.infopremium).
export async function peekLimit(storage, digits, group, { paidTier = false, now } = {}) {
  const quota = quotaFor(group, paidTier)
  const used = await getUsage(storage, digits, group, { now })
  return { group, used, quota, left: Math.max(0, quota - used), paidTier }
}

// Coba konsumsi satu percobaan. Ditolak (ok:false) tidak menaikkan count.
export async function consumeLimitGroup(storage, digits, group, { paidTier = false, now } = {}) {
  const date = now !== undefined ? new Date(now) : new Date()
  const quota = quotaFor(group, paidTier)
  const used = await getUsage(storage, digits, group, { now })
  if (used >= quota) return { ok: false, group, used, quota, left: 0, paidTier }
  const key = usageKey(digits, group, date)
  await storage.set(LIMITS_NS, key, { count: used + 1 })
  return { ok: true, group, used: used + 1, quota, left: Math.max(0, quota - used - 1), paidTier }
}
