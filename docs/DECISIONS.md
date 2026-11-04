# DECISIONS

- 2026-11-04: Nama bot KANA (bukan Elaina), persona moe gaya Kana. Nama repo GitHub: kana-md, publik, lisensi MIT.
- 2026-11-04: Pairing ditunda. NOMOR_BOT dan NOMOR_OWNER belum diberikan user, jadi base memakai placeholder di .env.example dan `npm start` berhenti rapi dengan pesan bila BOT_NUMBER kosong.
- 2026-11-04: Folder ./reference/ tidak tersedia di workspace, tidak ada kode referensi yang dibaca atau disalin.
- 2026-11-04: Versi library di-pin exact 1.4.7 dari hasil `npm view`.
- 2026-11-04: `checkHtmlApp` di v1.4.7 adalah named export top-level, bukan properti MB. Kode mengimpornya dari root paket.
- 2026-11-04: `usePostgresAuthState({ pool, session: 'kana' })` dipakai untuk driver supabase sesuai README. Untuk driver local dipakai `useMultiFileAuthState` di .dev-data/session (dev saja).
- 2026-11-04: Kode pairing kustom 8 karakter: KANAMOE1.
- 2026-11-04: Base dirampingkan mengikuti prinsip minimum yang jalan: tanpa Dockerfile, scheduler, dan scraper dulu. Itu pekerjaan fase berikutnya setelah Gate 1.
- 2026-11-04: Aset gambar dikomposisi lokal dengan PIL dari maskot resmi Kana (pose halo dan fight), bukan gambar dari web atau referensi.
- 2026-11-04: Scraper kiriman user dipasang sebagai Fase downloader/search lebih awal atas perintah langsung user di chat utama (mengalahkan urutan Gate 1 untuk cakupan ini saja; pairing tetap menunggu nomor). Enam scraper user (Spotify, YouTube, Pinterest, Facebook, Instagram, TikTok) jadi modul di src/scrapers dengan runner bersama (SSRF guard, retry, circuit breaker).
- 2026-11-04: YouTube downloader tidak lagi menulis folder downloads permanen; audio lewat folder temp yang selalu dihapus, dikembalikan sebagai Buffer.
- 2026-11-04: TikTok memakai dua sumber: tiklydown (utama, dari user) dan tikwm (fallback, adaptasi snippet Jerexd di dpaste). Hasil dinormalisasi ke satu bentuk.
- 2026-11-04: Dua snippet paste diadaptasi (Komikcast dan DaFont, kredit Jerexd di header file dan docs/SNIPPETS.md). Sisanya dilewati dengan alasan tercatat di docs/SNIPPETS.md, termasuk tool aktivasi premium (dilarang aturan proyek) dan link yang tidak bisa diakses.
- 2026-11-04: Metadata dan lirik memakai modul Yui Agents (Spotify Embed, iTunes, lyrics.ovh, lrclib) sebagai plugin .lirik dan fallback metadata plugin .spotify.
- 2026-11-04: AI chat rudder.chat bersifat opt-in penuh: kredensial hanya dari .env (RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO), tidak ada nilai hardcoded; tanpa env, plugin .ai membalas belum dikonfigurasi.
- 2026-11-04: Auto bio: template lewat .env (BIO_ON_TEMPLATE dan BIO_OFF_TEMPLATE, placeholder {bot}, {runtime}, {since}) sesuai keputusan mekanisme yang diserahkan user; default moe bawaan kode bila env kosong. Interval pembaruan 5 menit: updateProfileStatus adalah IQ profil yang murah, tetapi WhatsApp sensitif rate limit untuk perubahan profil, jadi 5 menit dipilih sebagai titik aman antara bio yang terasa hidup dan risiko pembatasan; runtime per menit tidak cukup penting untuk dibayar dengan risiko itu. Toggle AUTO_BIO default true.
- 2026-11-04: Pemuatan .env memakai process.loadEnvFile() bawaan Node lewat src/load-env.js yang diimpor pertama di src/index.js, bukan flag --env-file di script start, supaya node src/index.js langsung juga benar dan tidak bergantung pada cara menjalankan. File .env tidak ada ditoleransi (try/catch).
- 2026-11-04: Jeda requestPairingCode 6000 ms (dari 3000 ms) berdasarkan bukti live: 3 detik gagal Connection Closed dan sisa sesi korupnya memicu loggedOut di run berikutnya; 6 detik berhasil dengan kode KANAMOE1. Pembersihan sesi korup tetap lewat clearAuth() pada jalur loggedOut, mekanisme yang disediakan library.
