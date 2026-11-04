# AGENTS.md: kana-md

Instruksi kerja untuk agen yang mengerjakan proyek ini.

- ESM saja (`"type": "module"`), Node 20 ke atas. Tidak ada `require()`.
- Library WhatsApp wajib `@rexxhayanasi/elaina-baileys`, versi di-pin exact. Jangan pakai fork Baileys lain.
- Sumber kebenaran API adalah README di `node_modules/@rexxhayanasi/elaina-baileys/README.md`. Baca dulu sebelum menulis kode koneksi, tombol, atau mini app. Jangan mengarang API.
- Semua string user-facing lewat i18n (`src/i18n`), tidak ada hardcoded di plugin. Persona lewat `src/persona/moe.js`.
- Rahasia hanya di `.env` (gitignored). `.env.example` hanya berisi nama variabel. Jangan pernah mencetak key, token, atau isi kredensial sesi.
- Satu plugin rusak tidak boleh menjatuhkan bot: loader mengkarantina dan mencatat.
- Tanpa em dash di seluruh konten repo.
- Tes: `npm test` harus hijau sebelum commit. Tambahkan tes untuk perilaku baru.
- Jangan membuat fitur Fase 2 atau lebih sebelum Gate 1 disetujui owner.
- Jangan pairing WhatsApp dan jangan mengirim pesan WhatsApp tanpa instruksi eksplisit owner di chat utama.
