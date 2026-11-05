# Sistem Premium, Sewa Bot, dan Limit Harian KANA

Keputusan owner 2026-11-05, dengan koreksi di hari yang sama: downloader
berat dan upscale TIDAK dikunci premium, cukup dibatasi limit harian.
Dokumen ini adalah acuan resmi untuk gate di pipeline, plugin baru
(termasuk agen ekspansi), dan panel premium di web.

## Model data

Semua data berjalan lewat storage bot dan dirutekan ke Supabase REST
oleh src/services/web-bridge.js (namespace selalu REST), supaya panel
owner di web dan bot membaca serta menulis data yang sama.

- Premium: namespace `premium`, key = digit nomor.
  Value: `{ expiresAt, addedBy, addedAt, note }`.
  `expiresAt` epoch ms, atau `null` untuk permanen.
- Sewa: namespace `sewa_bot`, key = JID grup (`...@g.us`) untuk sewa
  grup, atau digit nomor untuk sewa jadibot.
  Value: `{ expiresAt, addedBy, addedAt, type, note }`,
  `type` adalah `group` atau `jadibot`.
- Limit: namespace `usage_limits`, key =
  `<digit>:<grup>:<tanggal WIB YYYY-MM-DD>`, value `{ count }`.
- Pemegang sesi jadibot: namespace `jadibot_sessions`, key = nama sesi
  huruf kecil, value `{ number, startedBy, startedAt }`. Ditulis plugin
  jadibot saat sesi mulai dan dihapus stopjadibot saat sesi berhenti.

Kedaluwarsa bersifat malas: tidak ada pembersih berkala. Status dihitung
saat dibaca; `expiresAt` yang sudah lewat berarti tidak aktif, dan gate
menolak dengan info bahwa masa aktif sudah berakhir. Perpanjangan oleh
owner menumpuk dari sisa masa aktif yang lama.

Service bersama: `src/services/premium.js` (parseDuration, addPremium,
removePremium, listPremium, getPremiumStatus, isPremium, addSewa,
removeSewa, listSewa, getSewaStatus, isGroupRented, isJadibotRented,
hasJadibotSession, checkPremiumAccess, hasPaidTier) dan
`src/services/limit.js` (LIMIT_GROUPS, quotaFor, getUsage, peekLimit,
consumeLimitGroup).

Format durasi owner: `7d`, `30d`, `2w` (minggu), `1y` (365 hari), angka
polos (hari), `permanen` atau `0` (tanpa kedaluwarsa).

## Perintah

Owner (kategori owner, gate owner seperti biasa):

- `.addprem <nomor|reply|tag> [durasi]`: tambah atau perpanjang premium.
  Tanpa durasi berarti 30 hari.
- `.delprem <nomor>`: cabut premium.
- `.listprem`: daftar premium beserta status dan sisa waktunya.
- `.addsewa [target] [durasi]`: tanpa target di dalam grup berarti grup
  itu; target JID `@g.us` berarti sewa grup; target nomor berarti sewa
  jadibot personal (token `jadibot` diterima sebagai penegas).
- `.delsewa [jid|nomor]`: cabut sewa; tanpa target di grup berarti grup
  itu.
- `.listsewa`: daftar sewa grup dan jadibot.

Pengguna (kategori user, gratis):

- `.cekprem`: status premium sendiri, status sewa jadibot sendiri, dan
  sisa limit download serta upscale hari ini.
- `.ceksewa`: di grup menampilkan status sewa grup itu; di DM
  menampilkan status sewa jadibot sendiri.
- `.infopremium` (alias premium, sewa, sewabot): daftar fitur premium
  bertanda 💎 per kategori yang dibaca dinamis dari registry, daftar
  fitur limit ⏳ beserta kuotanya, penjelasan tiga jenis berbayar, dan
  cara aktivasi manual lewat owner.

Aktivasi selalu manual oleh owner. Tidak ada payment gateway di bot,
tidak ada bukti pembayaran buatan, dan tidak ada harga yang dikarang di
kode: urusan harga dibicarakan langsung dengan owner lewat WhatsApp.

## Aturan gate (src/core/pipeline.js)

Urutan gate yang relevan: mode/ban, resolve plugin, gate owner/grup/
privat, gate daftar, gate admin, gate premium, gate limit grup,
cooldown, limit generik, lalu handler.

Gate premium berlaku bila `config.premium === true` dan pemanggil bukan
owner. Lolos bila salah satu terpenuhi:

1. Premium personal aktif untuk nomor pemanggil.
2. Perintah dipakai di dalam grup yang sewa grupnya aktif. Sewa grup
   hanya membuka fitur di grup itu saja, tidak di DM dan tidak di grup
   lain.
3. Jalur khusus jadibot (lihat bawah).

Bila ditolak, bot membalas pesan premium berbingkai berisi nama fitur
dengan tanda 💎, status pemanggil (belum premium atau sudah berakhir),
nomor owner beserta tautan wa.me dari env OWNER_NUMBER, dan tombol
quick reply `.cekprem` serta `.infopremium` dengan fallback teks.

Pengecualian jadibot:

- `.jadibot` bersifat personal dan membuat sesi bot baru, jadi sewa
  grup TIDAK membukanya. Hanya premium personal aktif atau sewa type
  jadibot aktif untuk nomor pemanggil. Plugin jadibot bukan lagi
  owner-only; kategorinya `user`, dan jumlah sesi tetap dibatasi
  MAX_SESSIONS oleh manajer jadibot.
- `.stopjadibot` premium juga, tetapi pemegang sesi aktif tetap boleh
  menghentikan sesinya walau premiumnya baru berakhir (gate memeriksa
  namespace `jadibot_sessions`). Pengguna premium hanya bisa melihat
  dan menghentikan sesinya sendiri; owner bisa semua sesi.

Gate limit grup berlaku bila `config.limitGroup` terisi dan pemanggil
bukan owner. Percobaan dihitung sebelum handler jalan; percobaan yang
ditolak tidak menambah hitungan dan tidak memakan cooldown. Plugin
limitGroup melewati limit generik `config.limit` supaya tidak kena
potong dua kali. Tingkat berbayar untuk kuota (premium personal, atau
sewa grup aktif di grup tempat perintah dipakai) menaikkan kuota.

## Daftar premium awal (config.premium = true)

Total awal: 14 plugin. Alasan kelompok biaya di kanan.

| Plugin | Kelompok alasan |
|---|---|
| ai | AI: komputasi dan layanan model |
| aiimg | Generate gambar: komputasi berat |
| aireset | AI: bagian sesi AI (mengatur sesi fitur premium) |
| ringkas | AI: ringkasan teks oleh model |
| tts | AI: sintesis suara (kategori ai) |
| vision | Vision: analisis gambar oleh model |
| jadibot | Kloning bot: sesi bot penuh di nomor lain |
| stopjadibot | Pasangan jadibot (dengan pengecualian pemegang sesi) |
| removebg | Render berat: pemrosesan gambar eksternal |
| ssweb | Render berat: screenshot situs |
| ocr | Vision: OCR gambar ke teks (pemrosesan gambar eksternal) |
| game | Game HTML dan server skor online |
| hello | Game HTML contoh (sendHtmlGame) |
| topgame | Leaderboard server skor game online |

Nama dari daftar awal yang TIDAK ditemukan sebagai plugin tersendiri
saat penerapan (jangan dikarang): twitter (tidak ada plugin; unduhan X
belum ada), dailymotion (tidak ada plugin, dulu hanya metadata),
ytvideo adalah `.ytmp4` (limit, bukan premium), instagram adalah `.ig`
dan facebook adalah `.fb` (keduanya limit). ephoto belum ada sebagai
plugin; bila agen ekspansi membuatnya, perlakukan sebagai premium
(render lanjutan). Nama enhance, upscale, dan remini adalah alias dari
`.hd`, yang berstatus limit grup upscale, bukan premium.

Yang sengaja TETAP gratis: admin grup dasar, fun dan kuis teks, search
dan info ringan, RPG dasar (termasuk blackjack, slot, daduvs teks),
stiker dasar (brat, ttp, attp), maker ringan, dan unduhan audio ringan
(ytmp3, play, tiktokmp3 masuk limit download karena tetap mengunduh
dari TikTok, lihat bab Limit untuk rinciannya).

## Limit harian bergrup (config.limitGroup)

| Grup | Gratis | Premium / sewa grup | Owner |
|---|---|---|---|
| download | 5 kali per hari | 50 kali per hari | tanpa batas |
| upscale | 3 kali per hari | 20 kali per hari | tanpa batas |

Reset tengah malam WIB (kunci tanggal memakai tanggal WIB).

Plugin grup download: aio, capcut, fb, gdrive, ig, mediafire,
pixeldrain, soundcloud, spotify, tiktok, tiktokmp3, ytmp4.
Plugin grup upscale: hd (alias enhance, enhancehd, remini).

Bukan limit grup (tetap gratis dengan limit generik lama): ytmp3, play,
lirik, pinterest, transkrip, yts.

Pesan limit habis menyebut grup fitur, pemakaian dan batas hari ini,
reset tengah malam WIB, dan info bahwa premium atau sewa grup menaikkan
limit, dengan tombol `.cekprem` dan `.infopremium` plus fallback teks.

## Tanda di menu dan web

- Menu bot: perintah premium diberi akhiran ` 💎`, perintah limitGroup
  diberi akhiran ` ⏳`, perintah biasa tanpa tanda. Legenda
  `💎 = fitur premium` dan `⏳ = ada limit harian` tampil di menu utama,
  menu kategori, dan menu all. Id tombol dan selection menu tidak
  berubah.
- Katalog web: parser membaca `premium: true` dan menampilkan badge
  `💎 Premium`; parser membaca `limitGroup` dan menampilkan badge
  `Limit` (dengan nama grupnya). Plugin tanpa keduanya tanpa badge.

## Kriteria untuk plugin baru

Setel `config.premium = true` bila plugin masuk salah satu kelompok:
AI dan generate gambar atau vision; kloning bot; render berat (ephoto
dan canvas lanjutan, removebg, upscale versi AI, screenshot web); game
HTML atau online dengan server skor; fitur jalan terus atau massal
personal (auto-bio personal, scheduler personal). Broadcast tetap
owner-only, bukan premium.

Setel `config.limitGroup = 'download'` untuk pengunduh video atau file
berat baru, dan `config.limitGroup = 'upscale'` untuk keluarga
upscale/enhance baru. Jangan jadikan keduanya premium sekaligus kecuali
ada keputusan owner baru.

Sisanya biarkan gratis. Bila ragu, catat alasan biaya (bandwidth,
komputasi, atau layanan eksternal) di dokumen ini saat menambahkan.
