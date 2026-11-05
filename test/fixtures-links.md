# Fixtures Kasus Uji Live

Dokumen ini mencatat input asli yang dipakai oleh `export const test` di tiap plugin untuk harness livetest Mode A. Aturan mutunya: downloader diuji dengan link publik asli sampai jalur penuh selesai, pencarian dengan kata kunci asli, AI dengan pertanyaan asli, dan maker dengan teks asli. Input kosong atau dummy tidak dipakai lagi sebagai kasus uji utama.

Semua bukti verifikasi di bawah berasal dari smoke test scraper langsung dari VM pada 2026-11-04. Baris yang belum punya bukti ditandai jujur sebagai belum dismoke dan menunggu tes live.

## Download

| Plugin | Input uji | Jenis | Bukti verifikasi |
| --- | --- | --- | --- |
| tiktok | .tiktok https://www.tiktok.com/@pojoksatu.id/video/7647074044960984340 | link | Lolos lewat fallback tikwm, status true |
| play | .play https://www.youtube.com/watch?v=jNQXAC9IVRw | link | downloadAudio dari URL yang sama menghasilkan buffer 309 KB (video Me at the zoo, 19 detik) |
| ytmp4 | .ytmp4 https://www.youtube.com/watch?v=jNQXAC9IVRw | link | URL yang sama dengan play, terverifikasi bisa diunduh dari VM (video Me at the zoo, 19 detik) |
| yts | .yts Tulus Sepatu | kata kunci | Kata kunci terverifikasi dari smoke 2026-11-04 |
| spotify | .spotify https://open.spotify.com/track/73DWDOjVUyJ8sAiAcySvgS | link | spotifyDownload status true (lagu Sepatu dari Tulus) |
| lirik | .lirik Tulus Sepatu | kata kunci | Metadata lagu ketemu dan lirik 910 karakter lolos |
| pinterest | .pinterest kucing lucu | kata kunci | Pencarian mengembalikan data |
| fb | .fb https://www.facebook.com/fossbytes/videos/1135171799944065/ | link | Status true, unduhan kualitas 720p tersedia |
| ig | .ig https://www.instagram.com/reel/DMXCETGSC5i/ | link | Gangguan sumber, lihat catatan khusus di bawah |
| gdrive | .gdrive https://drive.google.com/file/d/1RG3CAPiwiFlFATUlIIwhk0RrbEU4PgVP/view?usp=sharing | link | Range request membalas 206 dengan tipe image/jpeg, unduhan langsung jalan |
| mediafire | .mediafire http://www.mediafire.com/file/rqhuey1ouz6z4aq/VervalNoPonsel_04092020_publik.pdf/file | link | resolveMediafire menghasilkan direct URL, file PDF 1,17 MB |
| aio | .aio https://www.tiktok.com/@pojoksatu.id/video/7647074044960984340 | link | Dipilih karena detectPlatform di aio.js mendukung host tiktok.com dan mengarahkan ke perintah .tiktok; linknya sendiri sudah terverifikasi lewat smoke tiktok di atas |

## AI

| Plugin | Input uji | Jenis | Bukti verifikasi |
| --- | --- | --- | --- |
| ai | .ai Apa ibu kota Jepang? | teks pertanyaan | Belum dismoke, menunggu tes live |
| aiimg | .aiimg kucing oren lucu memakai kacamata | teks prompt | Belum dismoke, menunggu tes live |
| tts | .tts Halo semuanya, aku KANA | teks | Belum dismoke, menunggu tes live |
| ringkas | .ringkas diikuti satu paragraf asli berbahasa Indonesia tentang bot KANA (3 kalimat, lebih dari 200 karakter sesuai syarat handler) | teks panjang | Belum dismoke, menunggu tes live |

Plugin aireset dan vision tidak diubah dalam paket ini. aireset memang perintah tanpa argumen, sedangkan vision butuh gambar kutipan.

## Search

| Plugin | Input uji | Jenis | Bukti verifikasi |
| --- | --- | --- | --- |
| wiki | .wiki Indonesia | kata kunci | Belum dismoke, menunggu tes live |
| kbbi | .kbbi cinta | kata kunci | Belum dismoke, menunggu tes live |
| chord | .chord Sepatu Tulus | kata kunci | Belum dismoke, menunggu tes live |
| gambar | .gambar kucing lucu | kata kunci | Belum dismoke, menunggu tes live |
| anime | .anime Naruto | kata kunci | Belum dismoke, menunggu tes live |
| cuaca | .cuaca Jakarta | kata kunci | Belum dismoke, menunggu tes live |
| sholat | .sholat Jakarta | kata kunci | Belum dismoke, menunggu tes live |
| terjemah | .tr en selamat pagi dunia | teks | Belum dismoke, menunggu tes live |
| qr | .qr https://omnidevv.vercel.app | link | Belum dismoke, menunggu tes live |
| shortlink | .shortlink https://omnidevv.vercel.app | link | Belum dismoke, menunggu tes live |
| ssweb | .ssweb https://omnidevv.vercel.app | link | Belum dismoke, menunggu tes live |
| font | .font gaming | kata kunci | Belum dismoke, menunggu tes live |
| film | .film Breaking Bad | kata kunci | Belum dismoke, menunggu tes live |
| resep | .resep Chicken | kata kunci | Belum dismoke, menunggu tes live |
| komik | .komik Solo Leveling | kata kunci | Hasil pencarian ada pada smoke 2026-11-04 |

Plugin gempa dan kurs tidak diubah karena memang berfungsi tanpa argumen. Plugin ocr dan scanqr tidak diubah karena butuh media gambar, lihat catatan khusus.

## Maker berbasis teks

| Plugin | Input uji | Jenis | Bukti verifikasi |
| --- | --- | --- | --- |
| brat | .brat halo semuanya | teks | Belum dismoke, menunggu tes live |
| attp | .attp keren banget | teks | Belum dismoke, menunggu tes live |
| ttp | .ttp semangat terus | teks | Belum dismoke, menunggu tes live |
| textstyle | .textstyle halo kana | teks | Belum dismoke, menunggu tes live |
| logo | .logo OmniDevv | teks | Belum dismoke, menunggu tes live |
| quotly | .quotly Halo semuanya, aku KANA | teks | Belum dismoke, menunggu tes live; handler aslinya tetap butuh pesan kutipan, lihat catatan khusus |
| fakechat | .fakechat Budi\|halo, apa kabar? | teks | Belum dismoke, menunggu tes live |
| faketweet | .faketweet Budi\|hari ini seru banget | teks | Belum dismoke, menunggu tes live |
| carbon | .carbon const kana = 'moe' | teks kode | Belum dismoke, menunggu tes live |
| emojimix | .emojimix 😀 🔥 | pasangan emoji | Belum dismoke, menunggu tes live |

## Catatan khusus

### Instagram adalah gangguan sumber, bukan bug fixture

Link reel yang dipakai adalah link asli dari dokumen akademik. Scraper SnapSave membalas kosong dari VM. Buktinya: dua link asli yang berbeda sama sama membalas "Empty response from SnapSave". Jadi bila tes live ig gagal mengambil media, itu gangguan di sumber SnapSave dan harus dilaporkan terpisah dari kesehatan plugin.

### Plugin yang butuh media kutipan belum teruji penuh lewat harness teks

Harness Mode A hanya menyuntikkan pesan teks sintetis, jadi plugin yang butuh media atau pesan kutipan belum bisa teruji penuh lewat jalur ini:

| Plugin | Kebutuhan |
| --- | --- |
| sticker | Gambar atau stiker kutipan |
| toimg | Stiker kutipan |
| tovideo | Stiker animasi atau GIF kutipan |
| tomp3 | Video kutipan |
| tovn | Audio atau video kutipan |
| smeme | Gambar kutipan |
| circle | Gambar kutipan |
| hd | Gambar kutipan |
| removebg | Gambar kutipan (fiturnya sendiri saat ini masih berstatus belum tersedia) |
| ocr | Gambar kutipan |
| scanqr | Gambar QR kutipan |
| vision | Gambar kutipan |
| quotly | Pesan teks kutipan; input teks pada kasus ujinya hanya memicu pengingat kutip dulu |
| meme | Bisa jalan dari teks saja karena gambar kutipan bersifat opsional; kasus ujinya tidak diubah dalam paket ini |

### Gelombang audit definisi test 2026-11-05

Sesudah sapuan live dihentikan owner, semua definisi test plugin berargumen diaudit ulang. 56 definisi yang inputnya masih perintah polos diperbaiki dengan argumen asli dan expect penanda hasil substantif (bukan balasan petunjuk pemakaian), di antaranya: keluarga pertanyaan fun memakai pertanyaan asli, downloader dan pemeriksa media memakai URL asli (picsum.photos untuk aidetect dan nsfwcheck, sesuai contoh handler), perintah grup memakai argumen asli dengan expect gerbang grup, dan perintah owner yang aman (addprem ke nomor owner, getplugin ke path plugin nyata) memakai target asli.

Penjaga otomatisnya adalah test/plugin-test-args-guard.test.js: perintah berargumen dengan kasus uji polos gagal validasi, kecuali 42 nama yang tercatat sebagai pengecualian berdokumentasi di file itu (keluarga cek bernama opsional, bentuk polos penampil status, media kutipan, perintah owner berdampak eksternal, dan pixeldrain di bawah).

Pixeldrain belum punya link fixture terverifikasi: pencarian tidak menemukan link berkas publik yang bisa dibuktikan, dan unggah anonim lewat API Pixeldrain timeout dari VM pada 2026-11-05. Begitu ada link berkas Pixeldrain yang terverifikasi dari VM, definisinya wajib diganti ke link itu dan namanya dihapus dari daftar pengecualian penjaga.
