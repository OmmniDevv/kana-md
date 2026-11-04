# Deploy Dashboard Web KANA dari Folder web/

Folder ini adalah bundel dashboard web KANA (katalog plugin, login member, dashboard member dan owner) yang disimpan di repo yang sama dengan source code bot supaya satu paket. Isinya identik secara fungsi dengan repo OmmniDevv/kana-web, dan repo kana-web tetap menjadi sumber deploy Vercel yang aktif di https://kana.omnicorp.web.id.

## Cara deploy dari folder ini

1. Buat project baru di Vercel dan hubungkan ke repo OmmniDevv/kana-md.
2. Atur Root Directory project ke `web`. Framework akan terdeteksi sebagai Next.js secara otomatis.
3. Isi Environment Variables berikut di Vercel:
   - `KANA_DATABASE_URL`: connection string Postgres Supabase proyek kana-md (skema bot, tabel bot.kv).
   - `SESSION_SECRET`: string rahasia acak untuk menandatangani cookie sesi.
   - `OWNER_NUMBER`: nomor WhatsApp owner dalam format digit internasional, contoh 6281234567890.
   - `DATA_MODE`: isi `supabase` untuk data asli, atau kosongkan untuk mode demo.
   - `GITHUB_TOKEN`: opsional, untuk menaikkan batas kuota GitHub API saat katalog membaca repo ini.
4. Deploy. Vercel menjalankan `npm run build` lalu `next start` sesuai package.json di folder ini.
5. Uji setelah deploy: halaman `/`, `/plugins`, `/plugins/main-ping`, dan `/login` harus menjawab 200, dan `/dashboard` tanpa sesi harus mengarah ke `/login`.

## Catatan

- Katalog plugin membaca daftar file `plugins/` dari repo kana-md lewat GitHub API, jadi web selalu menampilkan plugin dan perintah terbaru tanpa deploy ulang (cache ISR 1 jam).
- Login web menulis record ke namespace `web_login_requests` di tabel bot.kv. Kode hanya terkirim ke WhatsApp bila bot berjalan dengan driver penyimpanan Supabase yang sama; bila bot memakai driver lokal, record berhenti di status pending dan kode tidak terkirim.
- Statistik dashboard owner dibaca dari namespace `kv` key `bot_stats` sesuai kontrak di docs/WEB.md repo ini.
- Bila mengubah kode web, ubah di repo kana-web lalu salin hasilnya ke folder ini (atau sebaliknya) supaya kedua tempat tetap identik secara fungsi.
