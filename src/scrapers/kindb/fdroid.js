// F-Droid search API (search.f-droid.org) untuk .fdroid dan .apksearch.
// Terverifikasi dari VM: HTTP 200 berisi daftar aplikasi open-source
// asli (nama, ringkasan, ikon, tautan paket). Tautan unduh APK memakai
// pola resmi f-droid.org/packages/<id> yang mengarah ke APK terbaru.
export function parseFdroidApps(json, limit = 8) {
  const apps = Array.isArray(json?.apps) ? json.apps : []
  return apps.slice(0, limit).map((a) => {
    const url = a.url || ''
    const id = url.split('/packages/')[1]?.replace(/\/$/, '') || null
    return {
      name: a.name || id || '-',
      summary: a.summary || '',
      url: url || (id ? `https://f-droid.org/packages/${id}/` : 'https://f-droid.org'),
      id,
      apkUrl: id ? `https://f-droid.org/packages/${id}/` : null,
    }
  }).filter((a) => a.name !== '-')
}

export async function fdroidSearch(query, limit = 8) {
  const q = String(query || '').trim()
  if (!q) throw new Error('Kata kunci wajib diisi')
  const res = await fetch(`https://search.f-droid.org/api/search_apps?q=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`F-Droid balas HTTP ${res.status}`)
  return parseFdroidApps(await res.json(), limit)
}
