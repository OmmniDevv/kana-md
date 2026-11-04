# Tutorial Memakai KANA MD untuk Pemula

Panduan ini mengantar kamu dari nol sampai bot KANA jalan 24 jam dan
dashboard webnya online. Tidak perlu pengalaman DevOps. Ikuti urutannya,
jangan lompat langkah.

## Isi paket ini

Ada tiga bagian, dan masing masing tinggal di tempat yang berbeda:

| Bagian | Isi | Tempat jalan yang disarankan |
| --- | --- | --- |
| Bot | Source code bot WhatsApp (folder utama repo ini) | Docker, VPS, atau Termux |
| Dashboard web | Katalog plugin, login member, dashboard (folder `web/`) | Vercel (pilihan satu satunya yang kami sarankan untuk web) |
| Database | Supabase (Postgres), untuk menyatukan bot dan web | supabase.com, gratis |

Kenapa web disarankan hanya di Vercel? Karena dashboardnya Next.js dan
Vercel memang rumah asalnya: deploy sekali klik, HTTPS otomatis, dan
tidak perlu mengurus server. Botnya sendiri TIDAK bisa jalan di Vercel
karena bot butuh koneksi WhatsApp yang menyala terus, jadi bot tinggal
di Docker, VPS, atau HP Android lewat Termux.

Kalau kamu cuma mau botnya saja tanpa dashboard, lewati Langkah 3 dan
Langkah 6. Bot tetap berfungsi penuh dengan penyimpanan lokal.

## Yang perlu disiapkan

1. Nomor WhatsApp khusus untuk bot. Jangan pakai nomor utamamu, karena
   nomor bot berisiko dibatasi WhatsApp bila keseringan mengirim pesan.
2. Akun GitHub untuk mengambil source code ini (atau unduh ZIP repo).
3. Salah satu tempat menjalankan bot:
   - Komputer atau VPS dengan Docker (paling gampang), atau
   - VPS atau komputer dengan Node.js versi 20 ke atas dan ffmpeg, atau
   - HP Android dengan aplikasi Termux.
4. Akun Supabase (gratis) bila mau memakai dashboard web dengan login.
5. Akun Vercel (gratis) bila mau memasang dashboard web.

## Langkah 1: Ambil source code

```bash
git clone https://github.com/OmmniDevv/kana-md.git
cd kana-md
```

Bila tidak punya git, unduh ZIP dari halaman repo GitHub lalu ekstrak.

## Langkah 2: Isi pengaturan .env

Salin contoh pengaturan lalu buka dengan editor teks:

```bash
cp .env.example .env
```

Untuk pemula, tiga baris ini yang wajib diisi:

```env
BOT_NUMBER=6281234567890
OWNER_NUMBER=6281234567890
STORAGE_DRIVER=local
```

Penjelasan:

- `BOT_NUMBER`: nomor WhatsApp bot, format internasional tanpa tanda
  tambah dan tanpa spasi. Contoh: nomor 0812-3456-7890 ditulis
  `6281234567890`.
- `OWNER_NUMBER`: nomormu sendiri sebagai pemilik bot, format sama.
  Perintah khusus owner hanya menuruti nomor ini.
- `STORAGE_DRIVER`: isi `local` untuk mulai cepat. Data tersimpan di
  folder data di komputermu. Ganti jadi `supabase` nanti di Langkah 3
  bila mau menyambungkan dashboard web.

Variabel lain boleh dibiarkan apa adanya dulu. Semua variabel ada
penjelasannya di berkas `.env.example`.

Penting: berkas `.env` berisi rahasia. Jangan pernah mengunggahnya ke
GitHub atau membagikannya ke siapa pun.

## Langkah 3: Buat database Supabase (untuk dashboard web)

Lewati langkah ini bila kamu tidak memasang dashboard web.

1. Buka https://supabase.com, daftar, lalu klik **New project**.
2. Beri nama proyek (misalnya `kana-md`), buat password database dan
   simpan password itu baik baik, pilih region terdekat (misalnya
   Singapore), lalu tunggu proyek selesai dibuat (sekitar 2 menit).
3. Di dashboard proyek, buka menu **SQL Editor**, klik **New query**.
4. Salin seluruh isi berkas `supabase/migrations/0001_init.sql` dari
   repo ini, tempel ke editor, lalu klik **Run**. Isi berkas itu hanya
   membuat skema `bot` dengan dua tabel: `bot.kv` (data umum bot dan
   antrean login web) dan `bot.baileys_auth` (sesi WhatsApp). Aman
   dijalankan berulang.
5. Ambil alamat koneksi database: buka **Project Settings**, pilih
   **Database**, cari bagian **Connection string**, pilih mode
   **Transaction** (pooler, port 6543), lalu salin URI-nya. Bentuknya
   kira kira seperti ini:

   ```text
   postgresql://postgres.<kodeproyek>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```

6. Isi alamat itu di dua tempat:
   - Berkas `.env` bot: ubah `STORAGE_DRIVER=supabase` dan isi
     `DATABASE_URL=<alamat tadi>`.
   - Dashboard web di Vercel nanti: isi sebagai variabel
     `KANA_DATABASE_URL` (Langkah 6).

Catatan: bot dan web WAJIB memakai database yang sama supaya login web
berfungsi. Bila bot memakai driver `local` sedangkan web memakai
Supabase, antrean kode login di web akan berhenti di status pending dan
kode tidak terkirim ke WhatsApp.

## Langkah 4: Jalankan bot (pilih satu cara)

### Cara A: Docker (paling disarankan)

Butuh Docker dan Docker Compose terpasang. Dari folder repo:

```bash
docker compose up -d --build
docker compose logs -f
```

Bot menyala di latar belakang dan otomatis bangun lagi bila komputer
restart. Data sesi tersimpan aman di volume Docker bernama `kana-data`
sehingga pairing cukup sekali. Lanjut ke Langkah 5 untuk pairing.

Perintah harian:

```bash
docker compose logs -f      # melihat log
docker compose restart      # menyalakan ulang bot
docker compose down         # mematikan bot
```

### Cara B: VPS atau komputer tanpa Docker

Pasang Node.js versi 20 ke atas dan ffmpeg lebih dulu.

Di Ubuntu atau Debian:

```bash
sudo apt update
sudo apt install -y ffmpeg fonts-dejavu git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Lalu dari folder repo:

```bash
npm ci
node src/index.js
```

Bot jalan selama jendela terminal terbuka. Supaya jalan 24 jam dan
tetap hidup setelah terminal ditutup, pakai PM2:

```bash
sudo npm install -g pm2
pm2 start src/index.js --name kana
pm2 save
pm2 startup
```

`pm2 startup` mencetak satu perintah tambahan, jalankan perintah itu
supaya PM2 ikut menyala saat server reboot. Pantau dengan
`pm2 logs kana`.

### Cara C: Termux di HP Android

Pasang Termux dari F-Droid (versi Play Store sudah usang), lalu:

```bash
pkg update
pkg install -y nodejs ffmpeg git
git clone https://github.com/OmmniDevv/kana-md.git
cd kana-md
cp .env.example .env
nano .env
npm install
node src/index.js
```

Tips Termux:

- Isi `.env` memakai editor `nano` (Ctrl+X lalu Y untuk menyimpan).
- Jalankan `termux-wake-lock` supaya Android tidak membunuh prosesnya.
- Jangan bersihkan data aplikasi Termux, karena sesi WhatsApp bot
  tersimpan di folder proyek. Selama sesi aman, pairing cukup sekali.
- HP harus punya koneksi internet yang stabil. Bot mati bila HP mati.

## Langkah 5: Pairing WhatsApp

Pairing adalah proses menautkan bot ke nomor WhatsApp-nya, mirip
menautkan WhatsApp Web.

1. Jalankan bot dengan salah satu cara di Langkah 4.
2. Perhatikan log atau terminal. Saat pertama kali jalan, bot meminta
   kode pairing dan menulis baris seperti ini:

   ```text
   Kode pairing KANA: KANAMOE1
   ```

   Di Docker, lihat dengan `docker compose logs -f`. Di PM2, lihat
   dengan `pm2 logs kana`.
3. Di HP yang memakai nomor bot, buka WhatsApp, masuk ke **Setelan**,
   pilih **Perangkat tertaut**, ketuk **Tautkan perangkat**, lalu pilih
   opsi **Tautkan dengan nomor telepon saja** dan masukkan kode tadi.
4. Bila berhasil, bot mengirim pesan sapaan ke nomor owner dan siap
   dipakai. Coba kirim `.menu` ke nomor bot dari nomormu.

Pairing hanya perlu dilakukan sekali. Selama folder data atau volume
Docker tidak dihapus, bot tersambung lagi sendiri setiap menyala.
Hapus data sesi hanya bila kamu memang mau ganti nomor bot.

## Langkah 6: Pasang dashboard web di Vercel

Dashboard web (`web/`) adalah katalog plugin dan tempat member login
memakai kode yang dikirim bot lewat WhatsApp. Cara pasangnya:

1. Buka https://vercel.com, masuk memakai akun GitHub.
2. Klik **Add New**, pilih **Project**, lalu impor repo `kana-md`.
3. Pada pengaturan proyek, atur **Root Directory** ke `web`. Framework
   akan terdeteksi sebagai Next.js secara otomatis.
4. Isi **Environment Variables** berikut:

   | Nama | Isi |
   | --- | --- |
   | `KANA_DATABASE_URL` | Alamat koneksi Supabase dari Langkah 3 |
   | `SESSION_SECRET` | Teks acak panjang apa saja, untuk menandatangani cookie login |
   | `OWNER_NUMBER` | Nomor owner, format internasional, sama seperti di `.env` bot |
   | `DATA_MODE` | Isi `supabase` untuk data asli. Kosongkan untuk mode demo |
   | `GITHUB_TOKEN` | Opsional, menaikkan kuota GitHub API untuk katalog plugin |

5. Klik **Deploy** dan tunggu sampai selesai. Vercel memberi alamat
   seperti `https://nama-proyek.vercel.app`.
6. Uji: halaman `/`, `/plugins`, dan `/login` harus terbuka. Mengklik
   login dan memasukkan nomormu akan membuat bot mengirim kode lewat
   WhatsApp, asalkan bot sedang jalan dan memakai database yang sama.

Penjelasan lebih teknis ada di berkas `web/DEPLOY.md`.

## Langkah 7: Perawatan

### Temp otomatis bersih

Bot memakai folder sementara sistem untuk unduhan dan hasil konversi
(stiker, audio, gambar). Folder bekas proses yang mati di tengah jalan
dibuang otomatis: setiap 30 menit, sapuan temp membuang folder kerja
berawalan `kana-` yang sudah lebih tua dari 60 menit. Folder yang
sedang dipakai tidak disentuh. Atur lewat `.env`:

```env
AUTO_CLEAN_TMP=true
TMP_MAX_AGE_MIN=60
TMP_CLEAN_INTERVAL_MIN=30
```

Owner juga bisa membersihkan kapan saja dari WhatsApp dengan perintah
`.cleartmp`.

### Memperbarui bot

```bash
git pull
```

Lalu sesuaikan cara jalanmu: Docker memakai
`docker compose up -d --build`, PM2 memakai `pm2 restart kana`, dan
Termux cukup hentikan dengan Ctrl+C lalu jalankan lagi
`node src/index.js`.

### Cadangan

Cadangkan folder data bot (di Docker: volume `kana-data`; di lokal:
folder pada variabel `LOCAL_DATA_DIR`, bawaan `.dev-data`). Folder itu
berisi sesi WhatsApp, setara akses ke akun bot, jadi simpan di tempat
aman dan jangan dibagikan.

## Pemecahan masalah

- **Bot langsung keluar tanpa pesan jelas.** Kemungkinan besar
  `BOT_NUMBER` belum diisi di `.env`. Isi dulu, lalu jalankan lagi.
- **Kode pairing tidak muncul.** Pastikan nomor di `BOT_NUMBER` benar
  dan belum pernah tertaut. Hapus folder sesi bila sesi lama rusak,
  lalu jalankan lagi supaya kode baru diminta.
- **Stiker atau audio gagal dibuat.** Hampir selalu karena ffmpeg
  belum terpasang. Cek dengan `ffmpeg -version`.
- **Kode login web tidak sampai ke WhatsApp.** Bot dan web harus
  memakai database Supabase yang sama, dan bot harus sedang jalan.
  Lihat catatan di akhir Langkah 3.
- **Bot sering putus sambung.** Cek kualitas internet tempat bot
  berjalan. Di Termux, pastikan `termux-wake-lock` aktif dan mode
  hemat baterai untuk Termux dimatikan.
- **Perintah tidak dibalas.** Pastikan kamu mengirim ke nomor bot
  yang benar, awalan perintahnya titik (contoh `.menu`), dan bot
  sedang tersambung (sapaan terakhir atau log menunjukkan tersambung).

## Keamanan

- Jangan pernah membagikan berkas `.env`, folder data sesi, atau kode
  pairing ke siapa pun. Ketiganya setara kunci akun botmu.
- Pakai nomor khusus bot, bukan nomor pribadi utama.
- Perintah owner (awalan kategori owner, misalnya `.cleartmp`) hanya
  menuruti nomor di `OWNER_NUMBER`. Pastikan nomor itu benar benar
  milikmu.

Selamat mencoba, dan selamat datang di KANA~
