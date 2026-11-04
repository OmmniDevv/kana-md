# ARCHITECTURE: KANA

## Ringkasan
Bot WhatsApp ESM Node.js. Satu proses, arsitektur plugin, pipeline pesan sederhana, storage dapat ditukar lewat env.

## Struktur
```
src/
  core/       connection.js, plugin-loader.js, pipeline.js
  storage/    index.js (driver switch), local.js, supabase.js
  i18n/       index.js, locales/id.js, locales/en.js
  persona/    moe.js
  ui/         buttons.js, htmlgame.js (kerangka, menunggu konfirmasi API)
  services/   logger.js
plugins/      main/ (ping, menu, lang, help), owner/ (owner)
games/        hello/ (contoh mini app HTML mandiri)
scripts/      i18n-check.js
supabase/     migrations/
test/         node:test
assets/       welcome.png, rpg.png
```

## Aliran data
1. `connection.js` membuat socket Baileys, menangani pairing code (hanya bila creds belum registered), reconnect backoff dengan jitter, dan berhenti pada loggedOut.
2. Event pesan masuk dinormalisasi pipeline: ambil teks, cocokkan multi-prefix (`.`, `!`, `/`, `#`), cari perintah di registry plugin.
3. Gates dasar: owner, group only, private only, cooldown per pengguna per perintah.
4. Handler plugin jalan di dalam error boundary; error dibalas dengan pesan persona dan dicatat logger.
5. Balasan dikirim lewat `sock.sendMessage`.

## Storage
- Antarmuka repository sama untuk dua driver: `get(ns, key)`, `set(ns, key, value, ttlSeconds)`, `delete(ns, key)`.
- `local`: JSON per namespace di `.dev-data/` (gitignored), hanya untuk dev.
- `supabase`: tabel `bot.kv` lewat `pg.Pool`, migrasi di `supabase/migrations/`, RLS aktif tanpa policy anon.
- Sesi WhatsApp Postgres (`usePostgresAuthState`): menunggu konfirmasi API dari README library; status tercatat di FEATURES.md dan docs/DECISIONS.md.

## Keputusan penting
Lihat `docs/DECISIONS.md`.
