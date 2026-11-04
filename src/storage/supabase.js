import pg from 'pg'

// Driver Supabase (Postgres) untuk production. Tabel bot.kv dibuat oleh migrasi
// di supabase/migrations/, tapi init() juga membuatnya bila belum ada (idempotent).
// RLS aktif di migrasi, tanpa policy anon: bot terhubung langsung lewat pooler.
export function createSupabaseStorage(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL wajib diisi untuk STORAGE_DRIVER=supabase')
  const pool = new pg.Pool({ connectionString, max: 5 })

  return {
    driver: 'supabase',
    pool,
    async init() {
      await pool.query('create schema if not exists bot')
      await pool.query(`create table if not exists bot.kv (
        ns text not null,
        key text not null,
        value jsonb not null,
        expires_at timestamptz,
        primary key (ns, key)
      )`)
    },
    async get(ns, key) {
      const { rows } = await pool.query(
        'select value from bot.kv where ns = $1 and key = $2 and (expires_at is null or expires_at > now())',
        [ns, key]
      )
      return rows[0]?.value
    },
    async set(ns, key, value, ttlSeconds) {
      await pool.query(
        `insert into bot.kv (ns, key, value, expires_at) values ($1, $2, $3, $4)
         on conflict (ns, key) do update set value = excluded.value, expires_at = excluded.expires_at`,
        [ns, key, JSON.stringify(value), ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null]
      )
    },
    async delete(ns, key) {
      await pool.query('delete from bot.kv where ns = $1 and key = $2', [ns, key])
    },
    async keys(ns) {
      const { rows } = await pool.query(
        'select key from bot.kv where ns = $1 and (expires_at is null or expires_at > now())',
        [ns]
      )
      return rows.map((r) => r.key)
    },
    async close() {
      await pool.end()
    },
  }
}
