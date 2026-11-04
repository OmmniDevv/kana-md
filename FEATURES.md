# FEATURES: status KANA

## Preflight Fase 0 (2026-11-04)
- Node v24.22.1 (target 20 ke atas: lolos), npm 10.9.4, ffmpeg 8.1.2 tersedia.
- `@rexxhayanasi/elaina-baileys` versi exact terbaru dari `npm view`: 1.4.7, di-pin di package.json.
- README library dibaca: Penyimpanan Sesi, Kode Pairing, Pengalamatan LID/PN/JID, Button, Mini App HTML, Penanganan Masalah.
- API terverifikasi langsung dari paket 1.4.7: `usePostgresAuthState` ada (named export), `MB.sendHtmlApp` ada, `MB.checkNativeFlowButtons` ada, `checkHtmlApp` ada sebagai named export top-level (bukan `MB.checkHtmlApp`).
- Tes jaringan WhatsApp dan Supabase: informasional saja, pairing ditunda sampai user memberi NOMOR_BOT dan NOMOR_OWNER. Belum ada kredensial Supabase yang diberikan, jadi koneksi Supabase belum diuji live.
- Folder `./reference/` tidak tersedia di workspace saat base dibangun, jadi tidak ada yang dibaca atau disalin dari referensi. Daftar fitur referensi belum dijelajahi.

## Base Fase 1
| Fitur | Status |
|---|---|
| Koneksi pairing code + reconnect backoff/jitter + loggedOut berhenti | Kode selesai, belum dites live (menunggu nomor) |
| Sesi Postgres `usePostgresAuthState` (driver supabase) | Kode selesai, belum dites live |
| Sesi lokal `useMultiFileAuthState` di .dev-data (driver local) | Kode selesai |
| Pipeline multi-prefix (. ! / #), gates owner/group/private/cooldown, error boundary | Selesai |
| Plugin loader + karantina plugin rusak | Selesai, dites unit |
| i18n id + en, fallback en ke id ke kunci, `npm run i18n:check` | Selesai, hijau |
| Persona moe KANA dua bahasa | Selesai |
| Storage local (JSON .dev-data) | Selesai, dites kontrak |
| Storage supabase (bot.kv + migrasi SQL, RLS aktif tanpa policy anon) | Kode selesai, belum dites live |
| Plugin ping, menu, lang, help, owner (status) | Selesai |
| Tombol MB.Button + fallback teks | Kode selesai, belum dites live |
| Game HTML contoh (games/hello, perintah .hello) | Kode selesai, belum dites live di HP |
| Tes unit dan kontrak (node:test) | 5 tes, hijau |
| Spike S1 sampai S7 | Belum jalan, semua butuh pairing dan HP user |

## Scraper dan plugin downloader/search/AI (2026-11-04, atas kiriman user)

Status di bagian ini: kode terpasang + tes unit hijau + smoke test loader.
Tes live di bot tetap menunggu pairing (Gate 1). Tes jaringan langsung dari
VM pada 2026-11-04: Pinterest search berhasil (3 hasil), Spotify search
berhasil (hasil pertama "Sepatu"), metadata iTunes fallback berhasil
("Sepatu", Tulus). Sisanya belum diuji jaringan satu per satu.

| Modul / plugin | Sumber | Status |
|---|---|---|
| src/scrapers/runner.js (SSRF guard, retry, circuit breaker, downloadBuffer, withTempDir) | Kerangka spesifikasi 4.8 | Terpasang, dites unit |
| src/scrapers/spotify/spotify.js, plugin .spotify | Kode kiriman user (spotmp3 + spotidown) | Terpasang, search lolos tes jaringan |
| src/scrapers/spotify/metadata.js, plugin .lirik, fallback metadata .spotify | Yui Agents (Spotify Embed + iTunes + lirik lyrics.ovh/lrclib) | Terpasang, iTunes lolos tes jaringan |
| src/scrapers/youtube/youtube.js, plugin .play dan .yts | Kode kiriman user (@distube/ytdl-core), diubah ke file temp | Terpasang |
| src/scrapers/pinterest/pinterest.js, plugin .pinterest | Kode kiriman user | Terpasang, lolos tes jaringan |
| src/scrapers/facebook/facebook.js, plugin .fb | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/instagram/instagram.js, plugin .ig | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/tiktok/tiktok.js, plugin .tiktok | Kode kiriman user (tiklydown) + fallback tikwm dari snippet Jerexd, https://dpaste.org/YNLWj/raw | Terpasang |
| src/scrapers/komik/komikcast.js, plugin .komik | Adaptasi snippet Jerexd, https://paste.c-net.org/PresumeCaddy | Terpasang |
| src/scrapers/font/dafont.js, plugin .font | Adaptasi snippet Jerexd, https://paste.c-net.org/SworeSmashed | Terpasang |
| src/scrapers/ai/rudder.js, plugin .ai | Snippet rudder.chat oleh hazeloffc (t.me/hazeloffc) | Terpasang, opt-in: aktif hanya bila RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO diisi di .env |

| src/services/auto-bio.js | Fitur dari user: bio profil otomatis | Terpasang, dites unit; tes live menunggu bot connect |

Detail auto bio: saat connection open, bio profil bot diisi status ON plus
runtime dari template (BIO_ON_TEMPLATE, placeholder {bot}, {runtime},
{since}), diperbarui tiap 5 menit, dan diubah ke OFF (BIO_OFF_TEMPLATE)
pada shutdown rapi. Default template moe bawaan kode bila env kosong.
Toggle AUTO_BIO (default true). API sock.updateProfileStatus terkonfirmasi
di README dan kode library v1.4.7. Kegagalan update bio tidak fatal.

Perbaikan bug base dari pairing live 2026-11-04: (1) src/index.js sekarang
memuat .env lewat src/load-env.js (process.loadEnvFile bawaan Node,
diimpor pertama); (2) jeda requestPairingCode diubah 3000 ms menjadi
6000 ms (terbukti berhasil live dengan kode KANAMOE1), dan jalur loggedOut
tetap memanggil clearAuth() agar sisa sesi tidak terdaftar yang korup
dibersihkan dengan aman.

Triage lengkap semua link paste ada di docs/SNIPPETS.md. Catatan jujur:
scraper gratis akan rusak berkala; runner dibuat agar kegagalannya rapi
(error jelas ke pengguna) dan perbaikannya murah. Batas kirim media:
audio 16 MB, video 64 MB, gambar 16 MB, dokumen 64 MB.

## Menu ala Elaina-MD (2026-11-04, permintaan user)

| Item | Status |
|---|---|
| Menu gaya bot MD klasik: bingkai box-drawing, header nama bot + sapaan moe ke user (pushName), runtime, mode (env BOT_MODE, default public), jumlah plugin dan perintah (termasuk alias), tanggal + jam WIB | Terpasang, dites unit + smoke test loader |
| Seksi per kategori dari registry (main, download, search, ai, owner) dengan ikon dan judul 「 KATEGORI 」, perintah format "│ ◦ .nama" teks polos | Terpasang, dinamis dari registry, tidak ada daftar hardcoded |
| Formatter murni di src/ui/format.js (formatMenu, formatWibDateTime, sortCategories), label semua lewat i18n; nada id moe + alay, en moe polos | Terpasang, dites unit |
| Gambar header assets/welcome.png: jadi caption bila menu muat 1024 karakter, selain itu gambar terpisah lalu teks menu; tombol quick reply .ping/.help/.owner dipertahankan dengan fallback teks | Terpasang (smoke test lokal: gambar terkirim, fallback teks jalan) |
| Help (.help) diselaraskan: detail perintah dan hint dalam bingkai yang sama | Terpasang |

## Belum dibangun (sesuai Gate 1)
- Semua fitur katalog Fase 2 dan seterusnya di luar scraper di atas.
- Kanal skor WebSocket untuk game, Dockerfile, scheduler.
