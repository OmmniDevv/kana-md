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

## Belum dibangun (sesuai Gate 1)
- Semua fitur katalog Fase 2 dan seterusnya.
- Kanal skor WebSocket untuk game, Dockerfile, scheduler, scraper.
