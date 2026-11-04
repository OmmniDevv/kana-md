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
- Menu `.menu` bergaya bot MD klasik ala Elaina-MD: bingkai box-drawing, sapaan moe, runtime, mode, dan seksi per kategori yang dibangkitkan otomatis dari registry plugin, lengkap dengan gambar header dan tombol pintas.
- Scraper dan downloader (ditambahkan 2026-11-04 dari kiriman user): `.spotify`, `.play`, `.yts`, `.pinterest`, `.fb`, `.ig`, `.tiktok`, `.lirik`, `.komik`, `.font`, plus `.ai` yang opt-in. Semua lewat kerangka runner yang sama: proteksi SSRF, retry, circuit breaker, dan batas ukuran media (audio 16 MB, video 64 MB). Scraper gratis akan rusak berkala; bila sumber mati, bot membalas dengan pesan error yang jelas, bukan crash. Detail sumber dan kredit ada di [docs/SNIPPETS.md](docs/SNIPPETS.md).

## Perintah downloader, search, dan AI

| Perintah | Fungsi |
|---|---|
| `.spotify <judul>` | Cari lagu Spotify dan kirim audionya |
| `.play <judul>` | Cari lagu di YouTube dan kirim audionya |
| `.yts <kata kunci>` | Daftar hasil pencarian YouTube |
| `.pinterest <kata kunci>` | Cari gambar Pinterest, kirim hasil teratas |
| `.fb <link>` | Unduh video atau reel Facebook |
| `.ig <link>` | Unduh foto atau video Instagram |
| `.tiktok <link>` | Unduh video atau slide TikTok tanpa watermark |
| `.lirik <judul atau link Spotify>` | Tampilkan lirik lagu |
| `.komik <judul>` | Cari komik di Komikcast |
| `.font <kata kunci>` / `.font dl <slug>` | Cari font DaFont / unduh file fontnya |
| `.ai <pesan>` | Chat AI lewat rudder.chat, opt-in: hanya aktif bila `RUDDER_USER_ID`, `RUDDER_COOKIE_C0`, `RUDDER_COOKIE_C1`, dan `RUDDER_TH_WHO` diisi owner di `.env` |

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
  ui/         buttons.js, htmlgame.js, media.js
  services/   logger.js
  scrapers/   runner.js + spotify, youtube, pinterest, facebook, instagram,
              tiktok, komik, font, ai
plugins/      main/ (ping, menu, lang, help, game), owner/ (owner),
              download/ (spotify, play, yts, pinterest, fb, ig, tiktok, lirik),
              search/ (komik, font), ai/ (ai)
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
