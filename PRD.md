# PRD: KANA, Bot WhatsApp Moe

## Tujuan
Bot WhatsApp bernama KANA dengan persona moe gaya Kana (manis, hangat, playful), berbasis library `@rexxhayanasi/elaina-baileys`. Fondasi dulu (Fase 1), fitur katalog menyusul per batch setelah Gate 1 disetujui owner.

## Pengguna
- Owner: satu nomor utama, kontrol penuh bot.
- Pengguna grup dan private: memakai perintah dengan prefix multi (`.`, `!`, `/`, `#`).

## Ruang lingkup Fase 1 (base)
- Koneksi pairing code, sesi persisten, reconnect backoff dengan jitter, berhenti saat loggedOut.
- Pipeline pesan: parse, multi-prefix, gates dasar (owner, group, private, cooldown), error boundary.
- Sistem plugin modular dengan loader yang mengkarantina plugin rusak.
- i18n dwibahasa `id` dan `en` dengan fallback en ke id ke kunci.
- Persona moe dalam dua bahasa di semua keluaran base.
- Storage dua driver: `local` (dev, JSON di `.dev-data/`) dan `supabase` (production, Postgres).
- Plugin minimal: ping, menu, lang, help, owner (status saja).
- Satu game HTML contoh bila API mini app terkonfirmasi dari README library.

## Di luar lingkup Fase 1
- Semua fitur katalog Fase 2 dan seterusnya (downloader, RPG, kuis, AI, grup protection).
- Pairing live (ditunda, menunggu NOMOR_BOT dan NOMOR_OWNER dari user).
- Fitur terlarang dari brief: generator dokumen palsu, NSFW, spam, pengintai view-once, eval terbuka di production.

## Acceptance criteria Fase 1
- `npm test` hijau: tes i18n fallback, plugin-loader karantina, kontrak storage local.
- `node --check` lolos pada file utama.
- Struktur repo sesuai ARCHITECTURE.md, tanpa `.env` asli dan tanpa node_modules tercommit.
- FEATURES.md dan docs/DECISIONS.md mencatat status dan keputusan.
