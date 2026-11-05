// API kode pos Indonesia (kodepos.vercel.app) untuk .kodepos.
// Terverifikasi dari VM: HTTP 200 dengan data asli (contoh uji:
// "manggahang" membalas 40375, Manggahang, Baleendah, Bandung, Jawa
// Barat, lengkap dengan koordinat dan zona waktu).
export function normalizeKodepos(json, limit = 8) {
  const rows = Array.isArray(json?.data) ? json.data : []
  return rows.slice(0, limit).map((r) => ({
    code: r.code,
    village: r.village || '-',
    district: r.district || '-',
    regency: r.regency || '-',
    province: r.province || '-',
    timezone: r.timezone || null,
  })).filter((r) => r.code)
}

export async function kodeposSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Nama daerah wajib diisi')
  const res = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Kodepos balas HTTP ${res.status}`)
  return normalizeKodepos(await res.json(), limit)
}
