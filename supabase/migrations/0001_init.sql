-- KANA base schema. Idempotent, aman diulang.
-- Semua tabel: RLS aktif, tanpa policy untuk anon/authenticated.
-- Bot terhubung lewat koneksi Postgres langsung (pooler), bukan Data API.

create schema if not exists bot;

create table if not exists bot.kv (
  ns text not null,
  key text not null,
  value jsonb not null,
  expires_at timestamptz,
  primary key (ns, key)
);

alter table bot.kv enable row level security;
revoke all on bot.kv from anon, authenticated;

-- Tabel sesi WhatsApp untuk usePostgresAuthState (library membuatnya sendiri
-- dengan CREATE TABLE IF NOT EXISTS di schema dari search_path pool).
-- Migrasi ini menyiapkannya di schema bot; atur search_path pool ke bot,public
-- bila ingin sesi ikut di schema bot. Isi tabel ini setara akses penuh akun,
-- jadi tidak boleh terekspos ke Data API.
create table if not exists bot.baileys_auth (
  session text not null,
  type text not null,
  id text not null,
  value jsonb not null,
  primary key (session, type, id)
);

alter table bot.baileys_auth enable row level security;
revoke all on bot.baileys_auth from anon, authenticated;
