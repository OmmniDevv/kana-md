// Klien PostgREST minimal untuk tabel bot.kv di Supabase, memakai fetch
// global (Node 20) tanpa dependensi baru. Dipakai jembatan web
// (src/services/web-bridge.js) karena koneksi pg langsung dari VM ke
// Supabase timeout, sedangkan jalur HTTPS PostgREST terbukti jalan.
//
// Skema yang dipakai selalu 'bot': header Accept-Profile untuk baca dan
// Content-Profile untuk tulis, sesuai cara PostgREST memilih skema.
// Kredensial (service role key) hanya dibaca pemanggil dari process.env
// dan diteruskan ke factory ini; file ini tidak membaca env sendiri.

const DEFAULT_TIMEOUT_MS = 10000

// SUPABASE_REST_URL boleh berisi origin saja
// (https://<ref>.supabase.co), root REST (https://<ref>.supabase.co/rest/v1),
// atau bahkan URL tabelnya; ketiganya dinormalkan ke root REST.
function restRoot(url) {
  let base = String(url ?? '').trim().replace(/\/+$/, '')
  if (base.endsWith('/rest/v1/kv')) base = base.slice(0, -'/kv'.length)
  if (!base.endsWith('/rest/v1')) base = `${base}/rest/v1`
  return base
}

function toExpiresAtIso(expiresAt) {
  if (expiresAt === undefined || expiresAt === null) return null
  if (expiresAt instanceof Date) return expiresAt.toISOString()
  if (typeof expiresAt === 'number') return new Date(expiresAt).toISOString()
  return String(expiresAt)
}

export function createSupabaseRest({ url, key, fetchImpl, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!url) throw new Error('SUPABASE_REST_URL wajib diisi untuk klien Supabase REST')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk klien Supabase REST')
  const doFetch = fetchImpl || globalThis.fetch
  if (typeof doFetch !== 'function') throw new Error('fetch tidak tersedia di runtime ini')
  const root = restRoot(url)
  const limit = Number.isFinite(Number(timeoutMs)) && Number(timeoutMs) > 0 ? Number(timeoutMs) : DEFAULT_TIMEOUT_MS

  async function request(path, { method = 'GET', write = false, headers = {}, body } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), limit)
    timer.unref?.()
    let res
    try {
      res = await doFetch(`${root}${path}`, {
        method,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          ...(write ? { 'Content-Profile': 'bot' } : { 'Accept-Profile': 'bot' }),
          ...headers,
        },
        body,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) {
      let detail = ''
      try {
        detail = String(await res.text()).slice(0, 200)
      } catch {}
      const err = new Error(
        `Supabase REST ${method} ${path.split('?')[0]} gagal: HTTP ${res.status}${detail ? ` ${detail}` : ''}`
      )
      err.status = res.status
      throw err
    }
    return res
  }

  const filter = (ns, keyValue) =>
    `ns=eq.${encodeURIComponent(ns)}&key=eq.${encodeURIComponent(keyValue)}`

  return {
    // Semua baris satu namespace: array baris { ns, key, value, expires_at }.
    async kvList(ns) {
      const res = await request(
        `/kv?ns=eq.${encodeURIComponent(ns)}&select=ns,key,value,expires_at`
      )
      const rows = await res.json()
      return Array.isArray(rows) ? rows : []
    },

    // Value satu baris, atau null bila barisnya tidak ada.
    async kvGet(ns, keyValue) {
      const res = await request(
        `/kv?${filter(ns, keyValue)}&select=ns,key,value,expires_at&limit=1`
      )
      const rows = await res.json()
      if (!Array.isArray(rows) || rows.length === 0) return null
      return rows[0]?.value ?? null
    },

    // Upsert satu baris. expiresAt boleh ISO string, epoch ms, Date, atau
    // kosong (null berarti baris tidak kedaluwarsa di level tabel).
    async kvSet(ns, keyValue, value, expiresAt) {
      await request('/kv?on_conflict=ns,key', {
        method: 'POST',
        write: true,
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates, return=minimal',
        },
        body: JSON.stringify({
          ns,
          key: keyValue,
          value,
          expires_at: toExpiresAtIso(expiresAt),
        }),
      })
    },

    async kvDelete(ns, keyValue) {
      await request(`/kv?${filter(ns, keyValue)}`, {
        method: 'DELETE',
        write: true,
        headers: { Prefer: 'return=minimal' },
      })
    },
  }
}
