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
