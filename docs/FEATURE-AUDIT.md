# Audit Fitur KANA vs Elaina-MD

Tanggal audit: 5 November 2026. Perintah user: audit semua fitur, bandingkan dengan repo Elaina-MD (SC user sendiri, sumber kebenaran perilaku fitur), tanpa mengubah kode. Sapuan tes live dihentikan user demi audit ini.

## Metode dan batasan

Setiap plugin di plugins/ dibaca kodenya dan diklasifikasikan dari handler aktualnya (bukan dari nama file): pola klon persen hashPercent, pemakaian layanan bersama src/, storage, pengiriman media, canvas, sesi, konteks grup, API WhatsApp langsung, dan proses node. Padanan Elaina dicari berdasarkan nama file di seluruh kategori plugins Elaina (1989 file), lalu mekanik intinya dibaca dari kode Elaina sesudah membuang blok config dan boilerplate. Sampel tiap kelas diverifikasi manual dengan membaca file aslinya di kedua repo (antara lain top, wa-canvas, tembak, terima, wanted, ytcomment, bank, addlist, balogo, mute, hidetag, eval, exec, join, leave, ping, gay, jam, waifu, bass, family100, cekpacar, ship, removebg). Tiga putaran kalibrasi dilakukan karena sinyal otomatis awal terbukti salah tuduh ke plugin yang fungsional lewat layanan bersama.

Kelas: SESUAI (handler menjalankan fitur namanya), KLON SALAH (handler generik tidak sesuai fitur), SEBAGIAN (fitur jalan, mekanik kunci hilang), TIDAK ADA PADANAN (fitur baru KANA, dinilai dari deskripsinya sendiri), RUSAK (kode putus). Audit ini statis: ia menilai kesesuaian mekanik handler, bukan keberhasilan tes live.

## Ringkasan hitungan

| Kelas | Jumlah |
|---|---|
| Total plugin aktif | 1408 |
| SESUAI | 756 |
| SEBAGIAN | 137 (sedang 17, rendah 120) |
| KLON SALAH | 46 (tinggi 31, sedang 15) |
| TIDAK ADA PADANAN | 469 |
| RUSAK | 0 |

Plugin dengan padanan nama di Elaina: 930 dari 1408. File yang memakai pola hashPercent: 92; yang terbukti klon persen murni: 53. Sisanya adalah keluarga cek yang sah, fun ramalan orisinal, atau plugin fungsional yang memakai hashPercent hanya sebagai benih angka (contoh wanted untuk bounty dan ytcomment). Tidak ditemukan import putus di seluruh plugin aktif, jadi kelas RUSAK kosong pada audit statis ini.

## Status tindak lanjut (tuntas 5 November 2026)

Semua temuan audit sudah ditindaklanjuti dalam tiga batch perbaikan. Keadaan sesudah tindak lanjut: KLON SALAH tersisa 0 dari 46, SEBAGIAN sedang tersisa 0 dari 17, dan 120 SEBAGIAN rendah sudah diperiksa satu per satu (hasilnya di bawah). Verifikasi akhir: npm test 534/534 hijau, npm run i18n:check bersih, loader memuat 1408 plugin dengan 0 karantina. Vonis akhir tetap tes live fungsional per plugin mengikuti metodologi tes baru.

### KLON SALAH: 46 dari 46 ditulis ulang

Batch 1 (commit 0978242d1a): fun/top (leaderboard grup top 10 dengan mentions), fun/wa-canvas (kartu profil WA canvas), fun/tembak, fun/terima, fun/tolak (alur nembak bersesi lewat mesin nembak yang sama, database pasangan dua arah), plus jalur game HTML src/ui/htmlgame.js ditulis ulang mengikuti bentuk relay Elaina.

Batch 2 (commit 82e27dae8a, 968c13772f, 0dbbcee3fa, 5c8d0e8ad6, 72f3376742): fun/artinama dan primbon/ramalanjodoh (data Siputzx asli + hitungan weton lokal), fun/randomtag, fun/jodoh, fun/cekpacar, fun/sulap (mekanik grup dan alur reply bersesi), canvas/ship (kartu canvas pasangan), main/usercard (kartu profil gambar), maker/removebg (proses foto beneran via layanan matte, validasi alpha), random/barandom (gambar Blue Archive acak terverifikasi magic bytes), random/cosba (Safebooru pos cosplay), random/quotesimage (kartu quotes PNG), fun/puisi (scrape puisipendek.net), fun/misteri (artikel horor IDN Times), fun/gachabini (gacha waifu acak dari daftar 150+ nama).

Batch 3 kelompok primbon (commit 80adc5e): fun/nomerhoki, fun/potensipenyakit, fun/zodiak, primbon/kecocokannamapasangan, primbon/sifatusahabisnis. Semuanya memakai endpoint primbon Siputzx yang sama dengan Elaina (terprobe hidup dari VM) lewat tambahan parse/get di src/scrapers/search/primbon.js; tanggal lahir divalidasi nyata, zodiak menguraikan string gabungan API menjadi atribut terpisah.

Batch 3 kelompok data (commit d674352): quotes/katakata (API Xemoz hidup, fallback sumber quotes repo), user/usernamegen (API Nexray hidup, format pipa nama|tema|mode), random/randomname (scrape BehindTheName dengan daftar kode kategori Elaina), random/superhero (dataset akabab menggantikan lolhuman yang butuh kunci berbayar; statistik + gambar), random/lahelu (lihat batasan jujur di bawah), fun/senja (dataset lokal 40+ kata senja karena API neoxr Elaina butuh kunci terdaftar).

Batch 3 kelompok fun (commit 6713a28): fun/bucin (dataset 50 kata bucin lokal), fun/burik (foto diturunkan kualitasnya pakai canvas, JPEG kualitas rendah), fun/coba (pertanyaan + jawaban tebakan khusus), fun/fuckmylife (scrape fmylife.com/random terverifikasi: parser mengekstrak 30 cerita dari halaman asli), fun/gachanasip, fun/gachatomboy (80 karakter), fun/halah (transformasi gayaHalah/gayaHilih persis Elaina, alias hilih), fun/kematian (tanggal + penyebab acak), fun/lifefact (hitungan lokal penuh dari tanggal lahir), fun/lupakan (kutipan move-on), fun/mimpi (generator bacaan mimpi kombinasi acak), fun/moveon (urutan moveon.exe sebagai satu pesan + alasan gagal acak), fun/renungan (kartu gambar quoteCard), fun/seberapagila (persen acak + komentar berjenjang), fun/tebakumur (bacaan umur acak). Tidak ada hashPercent tersisa di ke-46 file ini.

Dua nama yang disebut di daftar prioritas P3 tetapi ternyata BUKAN klon sesudah dibaca ulang: fun/tafsirmimpi dan fun/ayat. Keduanya sudah berbasis data lokal nyata (src/data/primbon.js dan src/data/religi.js), jadi tidak diubah.

### SEBAGIAN sedang: 17 dari 17 diperbaiki (commit fb9a1ae)

fun/family100 (khusus grup; sesi kuis dibuka untuk semua member grup, bukan hanya pemulai; poin ke penebak; sesi tertutup normal), fun/gay (target member grup acak dengan mention beneran), group/anticulik (bug kunci setelan salah tulis "antispam" diperbaiki jadi "anticulik", plus penegakan onParticipantsUpdate: bot keluar dari grup yang mengaktifkan anticulik bila dimasukkan bukan oleh owner), group/antiflood dan group/antihidetag (terverifikasi penegakannya memang ada di plugins/group/guard.js; toggle per grup diuji), owner/addsewa (target grup saat ini tanpa argumen, ID grup polos, dan tautan grup via groupGetInviteInfo), rpg/sawer (saldo beneran berpindah ke target mention/reply), rpg/fightnaga (naga bersama per grup dengan HP persisten di storage), rpg/ramadhan dan islamic/ramadhan2027 (kartu canvas hitung mundur Ramadhan baru src/ui/ramadhan-card.js; awal Ramadhan 1448 H hasil kalender Islam Intl: 7/8 Februari 2027 WIB), search/apkmod + apkmod-get (scraper APKPure tanpa kunci + sesi binding reply), search/carimusik + search/getmusik (pencarian SoundCloud + sesi binding yang sama, audio dikirim beneran), search/film (sesi binding daftar TVMaze, reply nomor = detail), search/dafont (memakai scraper DaFont yang sudah ada + sesi binding, reply nomor = gambar pratinjau font), tools/linkid dan utility/inspect (isi lama yang salah tempel info npm ditulis ulang total: parser tautan WhatsApp baru src/services/whatsapp-link.js, memakai groupGetInviteInfo dan newsletterMetadata sesuai README library).

### SEBAGIAN rendah: 120 diperiksa, dinyatakan disengaja

Pemeriksaan cepat per item (pindai sinyal handler + baca manual yang lemah sinyal: main/ping, user/jam, anime/husbu, dan kelompok fetch murni) menyimpulkan: tidak ada yang salah fungsi. Semuanya mekanik inti jalan; yang hilang hanya presentasi ala Elaina (thumbnail bawaan, kartu canvas epik) yang memang digantikan aturan proyek (teks dengan fake image, footer kecil, format KANA). user/jam menghitung jam zona-zona Indonesia lokal via Intl, setara fungsi API jam dunia Elaina dan lebih andal. main/ping mengukur latensi nyata dari timestamp pesan; kartu canvasnya murni presentasi. Kelas ini ditutup sebagai DISENGAJA, bukan kerusakan, dan hanya akan dibuka lagi bila tes live menemukan fungsi yang benar-benar gagal.

### Batasan jujur yang tersisa

- random/lahelu: endpoint metadata lahelu (lahelu.com/api/post/get-posts) ternyata hidup dan balas JSON postInfos, tetapi dalam batas probe tidak ditemukan URL gambar langsung yang terverifikasi dan api.lahelu.com gagal koneksi. Sumber gambar memakai meme-api.com/gimme (terverifikasi, hanya konten nsfw false, magic bytes diperiksa) dan sumbernya disebut apa adanya di caption. Bila kelak jalur gambar lahelu resmi terbukti, plugin ini yang pertama diganti.
- search/apkmod: Elaina memakai API Neoxr ber-kunci untuk berkas APK langsung; KANA tidak punya kunci itu. Yang dikirim adalah detail + tautan unduh APKPure dari sumbernya, bukan berkas APK karangan.
- search/film: TVMaze tidak menyediakan tautan unduh, jadi sesi film hanya mengirim detail; tidak ada tautan unduh yang dikarang.
- group/anticulik: setelan per grup pola KANA (mengikuti antilink), bukan setelan global gaya Elaina; grup yang belum pernah menyalakan setelannya belum terlindungi.
- rpg/fightnaga dan rpg/ramadhan: mekanik Elaina aslinya berbeda (duel naga acak berjeda, dan sistem event RPG Ramadhan); versi KANA memilih naga bersama per grup dan kartu countdown, dicatat sebagai keputusan desain, bukan klaim paritas persis.
- Jalur game HTML: bentuk relay sudah disamakan dengan Elaina di batch 1, tetapi vonis tampil di klien WhatsApp user tetap menunggu satu kirim uji resmi + screenshot HP user.

## Hitungan per kategori

| Kategori | Total | SESUAI | SEBAGIAN | KLON SALAH | TANPA PADANAN |
|---|---:|---:|---:|---:|---:|
| ai | 86 | 52 | 14 | 0 | 20 |
| anime | 60 | 8 | 21 | 0 | 31 |
| audio | 19 | 2 | 0 | 0 | 17 |
| canvas | 41 | 38 | 0 | 1 | 2 |
| cek | 18 | 18 | 0 | 0 | 0 |
| clan | 27 | 23 | 0 | 0 | 4 |
| convert | 1 | 1 | 0 | 0 | 0 |
| donghua | 1 | 0 | 0 | 0 | 1 |
| download | 49 | 32 | 4 | 0 | 13 |
| economy | 4 | 2 | 0 | 0 | 2 |
| fun | 184 | 99 | 6 | 32 | 47 |
| game | 66 | 32 | 4 | 0 | 30 |
| gameinfo | 2 | 0 | 1 | 0 | 1 |
| general | 11 | 3 | 3 | 0 | 5 |
| group | 97 | 66 | 11 | 0 | 20 |
| image | 1 | 1 | 0 | 0 | 0 |
| info | 18 | 9 | 3 | 0 | 6 |
| internet | 4 | 0 | 2 | 0 | 2 |
| islamic | 18 | 13 | 4 | 0 | 1 |
| komik | 2 | 0 | 0 | 0 | 2 |
| main | 27 | 13 | 2 | 1 | 11 |
| maker | 64 | 37 | 0 | 1 | 26 |
| movie | 1 | 0 | 0 | 0 | 1 |
| music | 4 | 1 | 1 | 0 | 2 |
| news | 1 | 0 | 0 | 0 | 1 |
| nsfw | 10 | 4 | 0 | 0 | 6 |
| owner | 72 | 52 | 1 | 0 | 19 |
| primbon | 3 | 0 | 0 | 3 | 0 |
| quotes | 4 | 0 | 0 | 1 | 3 |
| random | 14 | 7 | 0 | 6 | 1 |
| rpg | 208 | 99 | 3 | 0 | 106 |
| search | 106 | 42 | 36 | 0 | 28 |
| sticker | 25 | 13 | 0 | 0 | 12 |
| store | 24 | 19 | 4 | 0 | 1 |
| tools | 77 | 34 | 15 | 0 | 28 |
| tts | 7 | 6 | 0 | 0 | 1 |
| user | 48 | 28 | 1 | 1 | 18 |
| utility | 4 | 2 | 1 | 0 | 1 |

## Temuan utama

1. Klon salah terkonsentrasi di kategori fun (32 dari 47). Polanya satu templat: impor sendButtons saja, fungsi hashPercent, balasan persen dari nama dengan empat komentar berjenjang dan tombol Cek Lagi. Nama dan judulnya diganti per plugin, mekanik fiturnya tidak pernah ditulis.
2. Kasus yang dilaporkan user semuanya terkonfirmasi dari kode: top, wa-canvas, tembak, terima, dan tolak adalah klon persen murni, sementara referensi Elaina-nya berisi mekanik nyata (leaderboard grup dengan mentions, render canvas, dan alur pacaran bersesi dengan database pasangan).
3. Di luar fun, klon salah yang berat ada di maker (removebg membalas teks, bukan memproses gambar), canvas (ship tidak menggambar apa pun), main (usercard teks statis), random (barandom, cosba, lahelu, quotesimage, randomname, superhero semuanya teks statis padahal fitur aslinya mengambil data atau gambar), primbon (3 plugin), dan quotes (katakata).
4. Keluarga cek (kategori cek 18 plugin, plus cek lain di fun yang memang bacaan persen) adalah pemakai pola persen yang SAH dan tidak dihitung klon. Begitu juga fun ramalan orisinal tanpa padanan Elaina.
5. Kategori besar lain ternyata sehat sesudah kalibrasi: rpg (99 sesuai dari 208, sisanya fitur baru tanpa padanan, termasuk bank dan engine RPG bersama), store (19 sesuai, handler bersama berbasis storage), canvas (38 sesuai, memakai layanan text-image dan cards), group (66 sesuai), owner (52 sesuai, termasuk eval dan exec yang benar benar menjalankan kode owner), download (32 sesuai).
6. Kelas SEBAGIAN rendah (120 plugin) didominasi perbedaan presentasi: Elaina mengirim gambar atau thumbnail bawaan, KANA mengirim teks dengan fake image sesuai aturan proyek. Itu bukan kerusakan dan prioritasnya paling rendah. SEBAGIAN sedang (17 plugin) adalah kehilangan mekanik nyata, terutama konteks grup (family100, anticculik, antiflood, antihidetag, fightnaga, sawer, addsewa, linkid, inspect) dan sesi (apkmod, carimusik, film, dafont, getmusik, ramadhan2027).
7. TIDAK ADA PADANAN (469 plugin) adalah fitur baru KANA yang tidak ada nama samanya di Elaina, terbanyak rpg (106), anime (31), tools (28), search (28), maker (26), group (20), owner (19), user (18), audio (17). Kelas ini dinilai dari deskripsi sendiri dan tidak ditemukan klon persen di dalamnya selain yang tertangkap aturan deskripsi; tetap perlu tes live fungsional karena audit statis tidak membuktikan sumber luar hidup.

## Jalur pengiriman game HTML

Sebanyak 17 plugin game memakai jalur game HTML (src/ui/htmlgame.js, MB.sendHtmlApp dari elaina-baileys, payload richResponseMessage dengan penanda diteruskan wajib): blockblast, bomb, breakout, catur, chess, dino, flappy, game, geometrydash, memorymatch, pacman, snake, snakeneon, supermario, tetris, tictactoe, ttthtml. Satu pemakai lain di luar game adalah main/hello. Laporan user dari HP-nya: gelembung game Block Blast dan Minesweeper (bomb) tampil sebagai pesan tidak didukung versi WhatsApp, hanya teks fallback penjelas yang terbaca. Artinya jalur ini bergantung pada dukungan rich response di klien penerima dan gagal total di klien user. Referensi Elaina tidak mempunyai game HTML sama sekali; semua gamenya teks bersesi. Rekomendasi: jadikan format teks bersesi atau papan gambar canvas sebagai jalur utama game, dan game HTML sebagai opsi tambahan saja, atau hentikan pengiriman gelembung HTML ke klien yang tidak mendukungnya. Ke-17 plugin ini diklasifikasikan dari mekanik gamenya (bukan KLON), tetapi jalur kirimnya dicatat sebagai masalah platform tersendiri di sini.

## Tabel KLON SALAH (semua)

| Plugin | File | Perilaku benar (Elaina atau deskripsi) | Perilaku aktual KANA | Parah | Rekomendasi handler |
|---|---|---|---|---|---|
| canvas/ship | canvas/ship.js | Kartu canvas pasangan: dua foto profil dan persen kecocokan digambar di canvas, kirim sebagai gambar | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/artinama | fun/artinama.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| fun/cekpacar | fun/cekpacar.js | Cek status pasangan user dari database pasangan (hasil sistem tembak), bukan ramalan nama | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/gachabini | fun/gachabini.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/jodoh | fun/jodoh.js | Pasangkan dua member grup secara acak dengan tag, ala ramalan jodoh grup | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/misteri | fun/misteri.js | Konten misteri dari sumber data dengan media pendukung | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/nomerhoki | fun/nomerhoki.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| fun/potensipenyakit | fun/potensipenyakit.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| fun/puisi | fun/puisi.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| fun/randomtag | fun/randomtag.js | Pilih satu member grup secara acak lalu tag dia beneran dengan mentions | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/senja | fun/senja.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| fun/sulap | fun/sulap.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/tembak | fun/tembak.js | Alur nembak bersesi: tag atau reply target, simpan sesi 1 jam dan status pasangan di database, target menjawab terima atau tolak | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/terima | fun/terima.js | Menerima tembakan yang sedang aktif (dari sesi, reply pesan tembakan, atau tag penembak) lalu menetapkan pasangan dua arah di database | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/tolak | fun/tolak.js | Menolak tembakan yang sedang aktif, menghapus sesi dan status tembak, menandai penolakan ke penembak | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/top | fun/top.js | Leaderboard grup: ambil peserta grup, acak, tampilkan top member dengan tag (Elaina top 5; user meminta top 10) dan mentions beneran | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/wa-canvas | fun/wa-canvas.js | Render kartu profil WhatsApp palsu pakai canvas (foto profil, nama, nomor terformat, status) lalu kirim sebagai gambar | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| fun/zodiak | fun/zodiak.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| main/usercard | main/usercard.js | Kartu profil user dalam bentuk gambar canvas berisi data user | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| maker/removebg | maker/removebg.js | Hapus background foto yang dikirim atau dikutip, kirim balik gambar hasil (PNG transparan) | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| primbon/kecocokannamapasangan | primbon/kecocokannamapasangan.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| primbon/ramalanjodoh | primbon/ramalanjodoh.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| primbon/sifatusahabisnis | primbon/sifatusahabisnis.js | Ramalan primbon berbasis data dan perhitungan tanggal atau nama sesuai referensi primbon Elaina, bukan persen nama generik | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Port logika primbon dari referensi Elaina (data dan perhitungan), ganti total handler persen |
| quotes/katakata | quotes/katakata.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| random/barandom | random/barandom.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| random/cosba | random/cosba.js | Gambar cosplay acak dari sumber data, kirim sebagai gambar | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| random/lahelu | random/lahelu.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| random/quotesimage | random/quotesimage.js | Gambar quotes acak, kirim sebagai gambar | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Tulis ulang handler mengikuti perilaku benar di kolom sebelah; sesuaikan test.expect ke hasil substantifnya |
| random/randomname | random/randomname.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| random/superhero | random/superhero.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| user/usernamegen | user/usernamegen.js | Mengambil data nyata dari sumber atau API sesuai fitur aslinya di Elaina | Teks statis generik satu tembakan, tanpa mekanik fitur aslinya | tinggi | Implementasikan pengambilan data nyata seperti fitur aslinya |
| fun/bucin | fun/bucin.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/burik | fun/burik.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/coba | fun/coba.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/fuckmylife | fun/fuckmylife.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/gachanasip | fun/gachanasip.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/gachatomboy | fun/gachatomboy.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/halah | fun/halah.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/kematian | fun/kematian.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/lifefact | fun/lifefact.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/lupakan | fun/lupakan.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/mimpi | fun/mimpi.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/moveon | fun/moveon.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/renungan | fun/renungan.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/seberapagila | fun/seberapagila.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |
| fun/tebakumur | fun/tebakumur.js | Fitur fun Elaina dengan mekaniknya sendiri (teks pilihan, gacha, atau bacaan khusus), bukan ramalan persen dari nama | Klon ramalan persen: hashPercent dari nama, balasan persen plus komentar generik | sedang | Ganti handler dengan mekanik fitur Elaina yang sebenarnya; bila memang bacaan, buat bacaan khusus fitur ini, bukan templat persen bersama |

## Tabel SEBAGIAN sedang (mekanik kunci hilang)

| Plugin | File | Yang hilang | Parah |
|---|---|---|---|
| fun/family100 | fun/family100.js | konteks grup | sedang |
| fun/gay | fun/gay.js | pasangan acak member grup dan tag | sedang |
| group/anticulik | group/anticulik.js | konteks grup | sedang |
| group/antiflood | group/antiflood.js | konteks grup | sedang |
| group/antihidetag | group/antihidetag.js | konteks grup | sedang |
| islamic/ramadhan2027 | islamic/ramadhan2027.js | media/canvas, sesi | sedang |
| owner/addsewa | owner/addsewa.js | konteks grup | sedang |
| rpg/fightnaga | rpg/fightnaga.js | konteks grup | sedang |
| rpg/ramadhan | rpg/ramadhan.js | media/canvas, konteks grup | sedang |
| rpg/sawer | rpg/sawer.js | konteks grup | sedang |
| search/apkmod | search/apkmod.js | sesi | sedang |
| search/carimusik | search/carimusik.js | sesi | sedang |
| search/dafont | search/dafont.js | media/canvas, sesi | sedang |
| search/film | search/film.js | sesi | sedang |
| search/getmusik | search/getmusik.js | media/canvas, sesi | sedang |
| tools/linkid | tools/linkid.js | konteks grup | sedang |
| utility/inspect | utility/inspect.js | konteks grup | sedang |

## Tabel SEBAGIAN rendah (semua, dominan perbedaan presentasi)

| Plugin | File | Catatan |
|---|---|---|
| ai/aifilter | ai/aifilter.js | mekanik inti jalan; hilang: media/canvas |
| ai/lobbyff | ai/lobbyff.js | mekanik inti jalan; hilang: media/canvas |
| ai/musicmaker | ai/musicmaker.js | mekanik inti jalan; hilang: media/canvas |
| ai/nanobanana | ai/nanobanana.js | mekanik inti jalan; hilang: media/canvas |
| ai/sologo | ai/sologo.js | mekanik inti jalan; hilang: media/canvas |
| ai/toblack | ai/toblack.js | mekanik inti jalan; hilang: media/canvas |
| ai/tochibi | ai/tochibi.js | mekanik inti jalan; hilang: media/canvas |
| ai/toemotebatu | ai/toemotebatu.js | mekanik inti jalan; hilang: media/canvas |
| ai/tofigure | ai/tofigure.js | mekanik inti jalan; hilang: media/canvas |
| ai/toghibli | ai/toghibli.js | mekanik inti jalan; hilang: media/canvas |
| ai/tohijab | ai/tohijab.js | mekanik inti jalan; hilang: media/canvas |
| ai/tojapanese | ai/tojapanese.js | mekanik inti jalan; hilang: media/canvas |
| ai/tomekah | ai/tomekah.js | mekanik inti jalan; hilang: media/canvas |
| ai/tts | ai/tts.js | mekanik inti jalan; hilang: media/canvas |
| anime/anilist | anime/anilist.js | mekanik inti jalan; hilang: media/canvas |
| anime/animedate | anime/animedate.js | mekanik inti jalan; hilang: media/canvas |
| anime/animeimgsearch | anime/animeimgsearch.js | mekanik inti jalan; hilang: media/canvas |
| anime/animereco | anime/animereco.js | mekanik inti jalan; hilang: media/canvas |
| anime/animeseason | anime/animeseason.js | mekanik inti jalan; hilang: media/canvas |
| anime/animetrailer | anime/animetrailer.js | mekanik inti jalan; hilang: media/canvas |
| anime/animewall | anime/animewall.js | mekanik inti jalan; hilang: media/canvas |
| anime/anischedule | anime/anischedule.js | mekanik inti jalan; hilang: media/canvas |
| anime/character | anime/character.js | mekanik inti jalan; hilang: media/canvas |
| anime/fotorandom002 | anime/fotorandom002.js | mekanik inti jalan; hilang: media/canvas |
| anime/husbu | anime/husbu.js | mekanik inti jalan; hilang: media/canvas |
| anime/ikiru | anime/ikiru.js | mekanik inti jalan; hilang: media/canvas |
| anime/kasedaiki | anime/kasedaiki.js | mekanik inti jalan; hilang: media/canvas |
| anime/komikindo | anime/komikindo.js | mekanik inti jalan; hilang: media/canvas |
| anime/konachan | anime/konachan.js | mekanik inti jalan; hilang: media/canvas |
| anime/mywaifu | anime/mywaifu.js | mekanik inti jalan; hilang: media/canvas |
| anime/shinigamidetail | anime/shinigamidetail.js | mekanik inti jalan; hilang: media/canvas |
| anime/tokusatsu | anime/tokusatsu.js | mekanik inti jalan; hilang: media/canvas |
| anime/topanime | anime/topanime.js | mekanik inti jalan; hilang: media/canvas |
| anime/wuwa | anime/wuwa.js | mekanik inti jalan; hilang: media/canvas |
| anime/yande | anime/yande.js | mekanik inti jalan; hilang: media/canvas |
| download/aio | download/aio.js | mekanik inti jalan; hilang: media/canvas |
| download/gimage | download/gimage.js | mekanik inti jalan; hilang: media/canvas |
| download/tiktokdl | download/tiktokdl.js | mekanik inti jalan; hilang: media/canvas |
| download/twitter | download/twitter.js | mekanik inti jalan; hilang: media/canvas |
| fun/tebakjkt | fun/tebakjkt.js | mekanik inti jalan; hilang: media/canvas |
| fun/tebakkartun | fun/tebakkartun.js | mekanik inti jalan; hilang: media/canvas |
| fun/tebaksurah | fun/tebaksurah.js | mekanik inti jalan; hilang: media/canvas |
| fun/ulartangga | fun/ulartangga.js | mekanik inti jalan; hilang: media/canvas |
| game/genshinprofile | game/genshinprofile.js | mekanik inti jalan; hilang: media/canvas |
| game/surah | game/surah.js | mekanik inti jalan; hilang: media/canvas |
| game/tebakanime | game/tebakanime.js | mekanik inti jalan; hilang: media/canvas |
| game/tebaklogo | game/tebaklogo.js | mekanik inti jalan; hilang: media/canvas |
| gameinfo/ffstalk | gameinfo/ffstalk.js | mekanik inti jalan; hilang: media/canvas |
| general/mcaddons | general/mcaddons.js | mekanik inti jalan; hilang: media/canvas |
| general/mltour | general/mltour.js | mekanik inti jalan; hilang: media/canvas |
| general/tafsir | general/tafsir.js | mekanik inti jalan; hilang: media/canvas |
| group/autoai | group/autoai.js | mekanik inti jalan; hilang: media/canvas |
| group/cekidgc | group/cekidgc.js | mekanik inti jalan; hilang: media/canvas |
| group/goodbye | group/goodbye.js | mekanik inti jalan; hilang: media/canvas |
| group/groupinfo | group/groupinfo.js | mekanik inti jalan; hilang: media/canvas |
| group/rules | group/rules.js | mekanik inti jalan; hilang: media/canvas |
| group/rulesgrup | group/rulesgrup.js | mekanik inti jalan; hilang: media/canvas |
| group/upsw | group/upsw.js | mekanik inti jalan; hilang: media/canvas |
| group/welcome | group/welcome.js | mekanik inti jalan; hilang: media/canvas |
| info/bluearchive-char | info/bluearchive-char.js | mekanik inti jalan; hilang: media/canvas |
| info/hok | info/hok.js | mekanik inti jalan; hilang: media/canvas |
| info/wwchar | info/wwchar.js | mekanik inti jalan; hilang: media/canvas |
| internet/dongeng | internet/dongeng.js | mekanik inti jalan; hilang: media/canvas |
| internet/fdroid | internet/fdroid.js | mekanik inti jalan; hilang: media/canvas |
| islamic/audioquran | islamic/audioquran.js | mekanik inti jalan; hilang: media/canvas |
| islamic/autosahur | islamic/autosahur.js | mekanik inti jalan; hilang: media/canvas |
| islamic/jadwalsholat | islamic/jadwalsholat.js | mekanik inti jalan; hilang: media/canvas |
| main/menu | main/menu.js | mekanik inti jalan; hilang: media/canvas |
| main/ping | main/ping.js | latensi diukur nyata dari timestamp pesan, tapi kartu canvas epik Elaina hilang, tinggal teks |
| music/playncs | music/playncs.js | mekanik inti jalan; hilang: media/canvas |
| search/alquran | search/alquran.js | mekanik inti jalan; hilang: media/canvas |
| search/android1-get | search/android1-get.js | mekanik inti jalan; hilang: media/canvas |
| search/animeapaini | search/animeapaini.js | mekanik inti jalan; hilang: media/canvas |
| search/apkmod-get | search/apkmod-get.js | mekanik inti jalan; hilang: media/canvas |
| search/applemaps | search/applemaps.js | mekanik inti jalan; hilang: media/canvas |
| search/clip | search/clip.js | mekanik inti jalan; hilang: media/canvas |
| search/genshinstalk | search/genshinstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/githubstalk | search/githubstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/igstalk | search/igstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/imdb | search/imdb.js | mekanik inti jalan; hilang: media/canvas |
| search/mangaread | search/mangaread.js | mekanik inti jalan; hilang: media/canvas |
| search/mcaddon | search/mcaddon.js | mekanik inti jalan; hilang: media/canvas |
| search/movieku | search/movieku.js | mekanik inti jalan; hilang: media/canvas |
| search/nerdfont-ambil | search/nerdfont-ambil.js | mekanik inti jalan; hilang: media/canvas |
| search/npmstalk | search/npmstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/pap | search/pap.js | mekanik inti jalan; hilang: media/canvas |
| search/pin | search/pin.js | mekanik inti jalan; hilang: media/canvas |
| search/pintereststalk | search/pintereststalk.js | mekanik inti jalan; hilang: media/canvas |
| search/pinvid | search/pinvid.js | mekanik inti jalan; hilang: media/canvas |
| search/playch | search/playch.js | mekanik inti jalan; hilang: media/canvas |
| search/ptvsearch | search/ptvsearch.js | mekanik inti jalan; hilang: media/canvas |
| search/putar-play | search/putar-play.js | mekanik inti jalan; hilang: media/canvas |
| search/resep | search/resep.js | mekanik inti jalan; hilang: media/canvas |
| search/robloxstalk | search/robloxstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/searchthatsong | search/searchthatsong.js | mekanik inti jalan; hilang: media/canvas |
| search/tiktokfoto | search/tiktokfoto.js | mekanik inti jalan; hilang: media/canvas |
| search/tiktokstalk | search/tiktokstalk.js | mekanik inti jalan; hilang: media/canvas |
| search/ttsearch | search/ttsearch.js | mekanik inti jalan; hilang: media/canvas |
| search/uptodown | search/uptodown.js | mekanik inti jalan; hilang: media/canvas |
| search/wikipedia | search/wikipedia.js | mekanik inti jalan; hilang: media/canvas |
| search/ytstalk | search/ytstalk.js | mekanik inti jalan; hilang: media/canvas |
| store/beli | store/beli.js | mekanik inti jalan; hilang: media/canvas |
| store/list | store/list.js | mekanik inti jalan; hilang: media/canvas |
| store/myorder | store/myorder.js | mekanik inti jalan; hilang: media/canvas |
| store/productinfo | store/productinfo.js | mekanik inti jalan; hilang: media/canvas |
| tools/bandingkan-hp | tools/bandingkan-hp.js | mekanik inti jalan; hilang: media/canvas |
| tools/converter | tools/converter.js | mekanik inti jalan; hilang: media/canvas |
| tools/emojitoanimasi | tools/emojitoanimasi.js | mekanik inti jalan; hilang: media/canvas |
| tools/hd8 | tools/hd8.js | mekanik inti jalan; hilang: media/canvas |
| tools/mcstalk | tools/mcstalk.js | mekanik inti jalan; hilang: media/canvas |
| tools/preset | tools/preset.js | mekanik inti jalan; hilang: media/canvas |
| tools/qwa | tools/qwa.js | mekanik inti jalan; hilang: media/canvas |
| tools/resizevideo | tools/resizevideo.js | mekanik inti jalan; hilang: media/canvas |
| tools/ssdesktop | tools/ssdesktop.js | mekanik inti jalan; hilang: media/canvas |
| tools/sstablet | tools/sstablet.js | mekanik inti jalan; hilang: media/canvas |
| tools/tebalteks | tools/tebalteks.js | mekanik inti jalan; hilang: media/canvas |
| tools/tourl | tools/tourl.js | mekanik inti jalan; hilang: media/canvas |
| tools/txt2qr | tools/txt2qr.js | mekanik inti jalan; hilang: media/canvas |
| tools/vgist | tools/vgist.js | mekanik inti jalan; hilang: media/canvas |
| user/jam | user/jam.js | fungsi jam jalan (dihitung lokal via Intl), Elaina mengambil data jam dunia via API |

## Prioritas perbaikan handler

P0, yang disebut user langsung: top (leaderboard grup top 10 dengan mentions), wa-canvas (render kartu profil WA canvas), tembak, terima, tolak (satu alur pacaran bersesi dengan database pasangan dan jawaban reply-first).

P1, maker dan media: removebg, ship, usercard, misteri, cosba, quotesimage. Semuanya wajib menghasilkan atau mengambil media beneran.

P2, grup dan alur sosial: randomtag, jodoh, cekpacar (baca database pasangan), family100 dan gay (konteks grup), plus SEBAGIAN grup lain (anticulik, antiflood, antihidetag).

P3, klon fun dan bacaan: gachabini, gachatomboy, gachanasip, bucin, burik, coba, fuckmylife, halah, kematian, lifefact, lupakan, mimpi, moveon, renungan, seberapagila, sulap, tebakumur, artinama, puisi, senja, ayat, zodiak, nomerhoki, potensipenyakit, tafsirmimpi, kecocokannamapasangan, ramalanjodoh, sifatusahabisnis, katakata, barandom, lahelu, randomname, superhero, usernamegen.

P4, SEBAGIAN sedang (17 plugin di tabel di atas), terutama yang hilang sesi dan konteks grup.

P5, SEBAGIAN rendah (perbedaan presentasi) dan peninjauan berkala kelas TANPA PADANAN lewat tes live fungsional.

Catatan penutup: angka kelas berasal dari audit statis terkalibrasi dengan verifikasi manual sampel di semua kelas. Vonis akhir per plugin tetap membutuhkan tes live fungsional sesudah handler diperbaiki, mengikuti metodologi tes baru (input asli, alur penuh, sesi ditutup).
