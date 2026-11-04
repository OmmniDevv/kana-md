# KANA

![Thumbnail KANA](thumbnail.png)

KANA adalah bot WhatsApp moe dengan persona Kana yang manis, hangat, dan playful. Dibangun di atas library `@rexxhayanasi/elaina-baileys` versi 1.4.7 (di-pin exact), ESM murni, Node 20 ke atas.

Status saat ini: base Fase 1 selesai dan berhenti di Gate 1. Pairing belum dilakukan karena nomor bot dan nomor owner belum diberikan. Detail status ada di [FEATURES.md](FEATURES.md) dan keputusan teknis di [docs/DECISIONS.md](docs/DECISIONS.md).

## Fitur base

- Koneksi pairing code (kode kustom 8 karakter), reconnect exponential backoff plus jitter, berhenti bersih saat loggedOut.
- Sesi WhatsApp persisten: Postgres lewat `usePostgresAuthState` untuk production, file lokal di `.dev-data/` untuk dev.
- Pipeline pesan multi-prefix (`.`, `!`, `/`, `#`) dengan gates owner, grup, private, dan cooldown, plus error boundary per plugin.
- Sistem plugin modular: satu file per fitur, loader memvalidasi config dan mengkarantina plugin yang rusak supaya bot tidak mati.
- Dwibahasa Indonesia dan Inggris, bisa diganti per pengguna dengan perintah `.lang`. Fallback bahasa: en, lalu id, lalu kunci.
- Persona moe di semua keluaran base, termasuk pesan error.
- Storage dua driver lewat `STORAGE_DRIVER`: `local` (JSON di `.dev-data/`, dev saja) dan `supabase` (Postgres, tabel `bot.kv`, RLS aktif tanpa policy anon).
- Tombol interaktif lewat `MB.Button` dengan fallback teks biasa bila pengiriman tombol gagal.
- Mini game HTML contoh di `games/hello/` yang dikirim lewat `MB.sendHtmlApp` (tampil penuh di Android, klien lain menerima label teks).
- Plugin bawaan base: `ping`, `menu`, `lang`, `help`, `owner` (status, khusus owner), dan `hello` (game contoh).

## Cara menjalankan

```bash
npm install
cp .env.example .env
# isi BOT_NUMBER dan OWNER_NUMBER di .env (format internasional, hanya digit)
npm start
```

Bila `BOT_NUMBER` masih kosong, bot berhenti rapi dengan pesan penjelasan. Saat pertama jalan dengan nomor terisi, kode pairing dicetak di log: buka WhatsApp, Perangkat tertaut, Tautkan perangkat, lalu pilih tautkan dengan nomor telepon saja.

Perintah lain:

```bash
npm test            # tes unit dan kontrak (node:test)
npm run i18n:check  # cek paritas kunci id dan en
```

## Struktur proyek

```
src/
  core/       connection.js, pipeline.js, plugin-loader.js
  storage/    index.js (driver switch), local.js, supabase.js
  i18n/       index.js, locales/id.js, locales/en.js
  persona/    moe.js
  ui/         buttons.js, htmlgame.js
  services/   logger.js
plugins/      main/ (ping, menu, lang, help, game), owner/ (owner)
games/        hello/ (mini app HTML mandiri)
scripts/      i18n-check.js
supabase/     migrations/0001_init.sql
test/         i18n, plugin-loader, storage local
assets/       welcome.png, rpg.png
```

## Cara menulis plugin

Buat file baru di `plugins/<kategori>/<nama>.js`:

```js
export const config = {
  name: 'contoh',
  alias: [],
  category: 'main',
  description: { id: 'Deskripsi singkat', en: 'Short description' },
  usage: '.contoh',
  example: '.contoh',
  cooldown: 3,
  // isOwner: true, isGroup: true, isPrivate: true (opsional)
}

export const i18n = {
  id: { contoh: { reply: 'Halo dari plugin contoh~' } },
  en: { contoh: { reply: 'Hello from the sample plugin~' } },
}

export async function handler(ctx) {
  await ctx.reply(ctx.t('contoh.reply'))
}
```

Semua string yang dilihat pengguna wajib lewat `ctx.t()` dan `i18n` plugin, tidak boleh hardcoded. Plugin yang gagal impor atau config-nya tidak valid akan dikarantina otomatis dan dicatat di log.

## Catatan risiko

Library ini memakai API WhatsApp tidak resmi, jadi ada risiko nomor diblokir atau dibanned oleh WhatsApp. Pakai nomor cadangan untuk bot, jangan nomor utama. Jangan kirim pesan massal dan beri jeda antar pesan saat pengujian.

## Lisensi

MIT, lihat [LICENSE](LICENSE). Copyright (c) 2026 OmniDevv.
