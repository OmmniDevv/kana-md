# Kontrak Login Web Dashboard KANA

Dokumen ini adalah kontrak antara bot WhatsApp KANA (repo ini) dan tim web
dashboard di https://kana.omnicorp.web.id/login. Kedua sisi berbagi storage
yang sama. Di production driver storage adalah Supabase (Postgres) dengan
tabel `bot.kv` (kolom `ns`, `key`, `value` jsonb, `expires_at`); di dev
driver lokal memakai file JSON per namespace dengan bentuk logis yang sama.
Semua penulisan di bawah memakai pola `storage.set(ns, key, value)` di sisi
bot dan padanan query ke `bot.kv` di sisi web.

Aturan umum:

- Nomor selalu ditulis sebagai digit internasional tanpa tanda plus dan
  tanpa akhiran JID, contoh `6281234567890`. Panjang valid 9 sampai 15 digit.
- Waktu selalu epoch milidetik (angka), kecuali field tanggal yang memakai
  format `YYYY-MM-DD` zona Asia/Jakarta (WIB).
- Kode login selalu 6 karakter. Hash kode selalu sha256 hex (64 karakter
  huruf kecil) dari string kode apa adanya, tanpa spasi.
- Kode mentah tidak pernah ditulis ke log di sisi bot.

## (a) Alur utama: member meminta kode dari web

1. Member membuka halaman login dan memasukkan nomor WhatsApp.
2. Web membuat kode 6 karakter, lalu menyimpan satu record:

   - Namespace: `web_login_requests`
   - Key: nomor member (digit, tanpa plus)
   - Value:

     ```json
     {
       "codeHash": "<sha256 hex dari kode>",
       "codePlain": "<kode mentah>",
       "expiresAt": 0,
       "status": "pending",
       "attempts": 0
     }
     ```

   - `expiresAt` diisi epoch ms saat pembuatan ditambah 10 menit.
   - `status` hanya boleh salah satu dari `pending`, `sent`, `used`.
   - Satu nomor satu record: permintaan baru menimpa record lama.

3. Bot watcher (`src/services/web-login-watcher.js`, polling default tiap
   20 detik, tick pertama 5 detik setelah boot) memindai record `pending`
   yang belum kedaluwarsa dan mengirim `codePlain` ke WhatsApp member
   (`<nomor>@s.whatsapp.net`) sebagai pesan teks moe. Bahasa pesan mengikuti
   preferensi member di `users` key `<nomor>:lang` bila ada, selain itu `id`.
   Dalam keadaan normal kode sampai dalam waktu sekitar 20 detik.
4. Sesudah terkirim, bot mengubah record menjadi `status: "sent"`,
   menaikkan `attempts`, dan menghapus field `codePlain` dari record
   (field hilang total, bukan dikosongkan). Sesudah titik ini kode mentah
   tidak disimpan lagi di sisi bot.
5. Member mengetik kode di web. Web memverifikasi dengan cara:
   - Ambil record untuk nomor itu. Tidak ada record berarti member harus
     meminta kode baru.
   - Cek `expiresAt`: sudah lewat berarti kode tidak berlaku lagi.
   - Hitung sha256 hex dari input member dan bandingkan dengan `codeHash`
     memakai perbandingan konstan-waktu bila platform web mendukungnya.
   - Cocok berarti login berhasil: web menandai record `status: "used"`
     (atau menghapusnya) supaya kode yang sama tidak bisa dipakai ulang.
   - Tidak cocok berarti tampilkan kesalahan dan biarkan member mencoba
     lagi selama record belum kedaluwarsa.
6. Bila pengiriman WhatsApp gagal (jaringan, socket belum siap), bot
   menaikkan `attempts`, membiarkan `status` tetap `pending` dan
   mempertahankan `codePlain`, lalu mencoba lagi pada putaran polling
   berikutnya (jeda antar percobaan mengikuti interval watcher).

Catatan keamanan jalur ini: `codePlain` memang harus disimpan web sesaat
supaya bot bisa mengirimnya, karena bot yang menerima hanya hash tidak
bisa merekonstruksi kode. Umur `codePlain` sengaja pendek: ia terhapus
begitu kode terkirim, dan record kedaluwarsa juga terhapus (lihat (b)).

## (b) Batas anti spam bot dan record kedaluwarsa

Bot menerapkan batas per nomor sebelum mengirim, apa pun yang web tulis:

- Jeda minimal 2 menit antar pengiriman ke nomor yang sama.
- Maksimal 5 kode per nomor per hari kalender WIB.

Keadaan batas disimpan bot di namespace `web_login_limits`, key nomor,
value `{ "lastSentAt": <epoch ms>, "day": "YYYY-MM-DD", "count": <angka> }`.
Record yang terhalang batas tidak diubah statusnya dan tidak dikirim pada
putaran itu; web cukup menampilkan pesan bahwa kode sedang dalam jeda.

Record `web_login_requests` yang sudah kedaluwarsa dihapus oleh bot pada
putaran polling berikutnya. Keputusan ini disengaja: kontrak status hanya
mengenal `pending`, `sent`, dan `used`, jadi tidak ada status `expired`.
Bagi web, ketiadaan record untuk satu nomor berarti member harus meminta
kode baru. Web juga boleh menghapus record kedaluwarsa versinya sendiri
lebih dulu; kedua sisi sama sama aman karena penghapusan bersifat final.

Web dianjurkan ikut menerapkan batas serupa di sisi formulir (jeda tombol
minta kode) supaya pengalaman member konsisten, tetapi batas bot di atas
adalah batas yang berlaku sebenarnya.

## (c) Jalur cadangan: perintah .webcode di WhatsApp

Member yang sudah mengobrol dengan bot bisa melewati formulir web:

1. Member mengetik `.webcode` (alias `.loginweb`) di chat bot.
2. Bot membuat kode lewat `src/services/web-login.js` dan menyimpan:

   - Namespace: `web_login`
   - Key: nomor member (digit)
   - Value: `{ "codeHash": "<sha256 hex>", "expiresAt": <epoch ms + 10 menit> }`

   Kode mentah hanya muncul di balasan chat member itu sendiri dan tidak
   disimpan di mana pun. Membuat kode baru menimpa record lama, jadi kode
   sebelumnya langsung hangus.
3. Member membuka tautan login (env `WEB_LOGIN_URL` di sisi bot, default
   `https://kana.omnicorp.web.id/login`) dan mengetik kode itu.
4. Web memverifikasi terhadap namespace `web_login` dengan aturan:
   - Tidak ada record: tolak, alasan `none`.
   - `now >= expiresAt`: hapus record, tolak, alasan `expired`.
   - sha256 input berbeda dari `codeHash`: tolak, alasan `mismatch`,
     record dipertahankan supaya member bisa mencoba lagi.
   - Cocok: hapus record (sekali pakai), terima, alasan sukses.
   Fungsi rujukan di sisi bot adalah `verifyWebCode` di
   `src/services/web-login.js`; web boleh meniru logikanya persis.

Perbedaan dengan jalur (a): jalur ini tidak memakai `codePlain`, tidak
memakai `web_login_limits`, dan kode dibuat oleh bot, bukan oleh web.
Kedua jalur memakai masa berlaku 10 menit yang sama.

Keterbatasan tombol salin: saat ini kode .webcode dikirim sebagai teks
biasa disusul tombol quick reply menu. Helper tombol proyek
(`src/ui/buttons.js`) hanya mengekspor pembangun quick reply, dan library
melarang mencampur quick reply dengan tombol salin (`cta_copy`) dalam satu
pesan, jadi tombol salin khusus belum dipakai. Member menyalin kode secara
manual dari teks pesan.

## (d) Statistik dan profil untuk dashboard

Statistik ringkas bot ditulis scheduler tiap menit ke namespace `kv`,
key `bot_stats`:

```json
{
  "startedAt": 0,
  "totalUsers": 0,
  "totalCommands": 0,
  "pluginCount": 0,
  "updatedAt": 0
}
```

- `startedAt`: epoch ms bot mulai berjalan (dari proses yang menulis).
- `totalUsers`: jumlah member terdaftar saja, yaitu key digit di namespace
  `users` yang profilnya memiliki `registered: true`. Pengguna yang hanya
  pernah mengobrol tanpa daftar tidak dihitung.
- `totalCommands`: jumlah perintah yang sudah dijalankan sejak bot mulai.
- `pluginCount`: jumlah plugin aktif.
- `updatedAt`: epoch ms penulisan terakhir.

Profil member ada di namespace `users`, key nomor digit, value objek:

| Field | Arti |
| --- | --- |
| `name` / `regName` | Nama tampil / nama saat registrasi |
| `xp` | Poin pengalaman kumulatif |
| `level` | Bukan disimpan mentah: diturunkan dari `xp` dengan rumus level di layanan user bot (level 1 mulai 0 xp, ambang naik mengikuti `50 * (level - 1)^2` xp); web menghitungnya dengan rumus yang sama |
| `balance` | Saldo ekonomi bot |
| `limitLeft` / `limitDate` | Sisa limit harian dan tanggal WIB limit itu berlaku |
| `lastSeen` | Epoch ms aktivitas terakhir |
| `registered` / `registeredAt` | Status daftar dan epoch ms saat daftar |

Key lain di namespace `users` yang berbentuk `<nomor>:lang` adalah
preferensi bahasa (`id` atau `en`), bukan profil, dan harus diabaikan
dashboard saat menghitung atau menampilkan member.

## (e) Catatan integrasi

- Dashboard membaca storage yang sama dengan bot. Di production itu
  berarti database Supabase yang sama dan tabel `bot.kv`, satu baris per
  pasangan namespace dan key, dengan `value` sebagai jsonb.
- Jangan menulis namespace bot lain di luar kontrak ini tanpa koordinasi:
  `web_login_requests` ditulis web dan bot, `web_login` ditulis bot dan
  dibaca web, `web_login_limits` khusus bot, `kv` dan `users` khusus bot
  (web hanya membaca untuk statistik dan profil).
- Watcher bot tidak mewiring dirinya sendiri; proses utama bot yang
  memanggil `startWebLoginWatcher({ session, storage })` saat boot.
- Bila dashboard pindah domain, sesuaikan env `WEB_LOGIN_URL` di sisi bot
  supaya tautan di balasan `.webcode` tetap benar.
