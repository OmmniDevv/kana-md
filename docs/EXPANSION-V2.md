# EXPANSION-V2: ekspansi fitur KANA v2 (2026-11-05)

Perintah user 2026-11-05 11:09 WIB: hitungan lama yang menggabungkan fitur
jadi alias/fallback DITOLAK. Aturan v2: tiap perintah unik Elaina-MD wajib
jadi PLUGIN UTAMA SENDIRI di KANA (file sendiri, nama utama sendiri, tampil
di menu dan katalog web). Koreksi 11:13 WIB: fitur yang dulu dilarang atau
dikecualikan proyek WAJIB diaudit ulang dan dimasukkan juga selama unik;
yang dibuang hanya clone/duplikat fungsi yang sama dan golongan batas keras
keamanan. Koreksi 11:16 WIB: downloader berat dan upscale memakai
limitGroup (download/upscale), bukan premium.

## Hasil akhir (terverifikasi loader plugin, bukan hitungan file)

| Ukuran | Sebelum (2026-11-04) | Sesudah v2 |
|---|---|---|
| Nama utama unik | 417 | 1408 |
| Alias | 607 | 594 |
| Total nama perintah | 1024 | 2002 |
| Kategori | 13 | 38 |
| Plugin terkarantina loader | - | 0 |
| Suite tes | 344/344 | 369/369 |

Angka sesudah dihitung dari registry loader (loadPlugins) pada kode yang
ter-push, bukan dari jumlah file: 1409 file plugin di disk, 1408 nama utama
terdaftar (satu file adalah helper bersama, bukan plugin perintah).

## Per kategori (nama utama terdaftar sesudah v2)

ai 86, anime 60, audio 19, canvas 41, cek 18, clan 27, convert 1,
donghua 1, download 49, economy 4, fun 184, game 66, gameinfo 2,
general 11, group 98, image 1, info 18, internet 4, islamic 18, komik 2,
main 27, maker 64, movie 1, music 4, news 1, nsfw 10, owner 70,
primbon 3, quotes 4, random 14, rpg 208, search 106, sticker 25,
store 24, tools 77, tts 7, user 49, utility 4.

Kategori baru yang lahir di v2: canvas, cek, clan, convert, donghua,
economy, gameinfo, general, image, info, internet, islamic, komik, movie,
music, news, nsfw, primbon, quotes, random, store, tools, tts, utility
(24 kategori baru; audio dan anime yang sebelumnya tanpa label menu kini
punya label menu.cat sendiri).

## Metode audit

- Ekstraksi semua nama perintah unik dari referensi Elaina-MD milik user
  (pluginConfig.name + handler.command semua gaya tulis): sekitar 2090
  nama mentah, 1765 file berisi fungsi nyata.
- Satu file Elaina = satu fungsi: nama utama file itu jadi kandidat plugin
  utama; nama lain di file yang sama adalah varian (boleh jadi alias plugin
  barunya, tidak dihitung utama). Varian sufiks lanjutan (2/3/4/v2/hd) dari
  basis yang sudah ada = clone.
- Nama yang sebelumnya cuma alias di KANA tetapi punya file Elaina sendiri
  DIPROMOSI jadi plugin utama; alias lamanya dicabut dari file lama supaya
  loader tidak bentrok (152 file lama disesuaikan).
- Dari audit: 1017 kandidat port utama. Hasil generator: 967 file baru
  tertulis langsung, sisanya menyusul dari perbaikan karantina dan batch
  snippet (total bersih +991 nama utama dari 417 ke 1408, termasuk plugin
  premium/sewa/limit dari agen premium dan plugin snippet user).

## Status per kelompok

- Terport utama: 1408 nama utama terdaftar (termasuk 417 lama). Rincian
  pemetaan nama Elaina ke plugin KANA ada di docs/DECISIONS.md bagian A-C
  untuk gelombang pertama; gelombang v2 memakai aturan satu file satu
  plugin sehingga namanya sama persis dengan nama utama Elaina-nya.
- Agen premium (di luar misi ini, tercatat supaya tidak dobel): sistem
  premium/sewa/limit di docs/PREMIUM.md (addprem, delprem, listprem,
  addsewa, delsewa, listsewa, cekprem, ceksewa, infopremium, jadibot,
  stopjadibot). Plugin baru v2 mengikuti kontraknya: AI/generate/vision,
  render berat, ssweb, game HTML/online, dan fitur jalan terus personal
  memakai premium: true; downloader berat memakai limitGroup download;
  keluarga upscale memakai limitGroup upscale.
- Batas keras (tidak dibuatkan plugin, tidak dibuatkan fallback):
  generator dokumen/bukti pembayaran palsu dan penipuan sejenis (keluarga
  fake, struk, invoicemaker, ektp, boardingpass, tweet canvas dan
  sejenisnya), bypass premium/lisensi/aktivasi layanan pihak ketiga
  (bypass, subs4unlock, panel Atlantic am*), alat spam massal dan ambil
  kontak (folder jpm dan pushkontak, savekontak, spamngl, sendngl),
  pembuka view-once dan pencuri status/story (colong, swhd, igstory),
  stalking data non-publik (lookup rekening bank ceknorek/cekrek dan
  sejenisnya, cekplat, nikparser, wastalk), konten seksual anak atau
  non-konsensual (bocil, bocilvid, ewe-paksa, ngentot, openbo dan
  sejenisnya). Daftar nama persisnya tercatat di DECISIONS.md dan di
  berkas audit misi.
- Clone dibuang: varian nama/sumber untuk fungsi yang sama (mis. keluarga
  auto* di store_autoorder menjadi varian fungsi store dasar, duplikat
  .berita di tools yang sama persis dengan .berita di search, varian
  sufiks angka dari basis yang sudah berdiri sendiri).
- Mustahil teknis terverifikasi (dicoba, mentok di sumber, dicatat):
  removebg/nobg dan faceswap serta img2vid/sora2/talkingphoto (tidak ada
  model/API gratis lokal yang terverifikasi jalan), TTS karakter RVC
  (holotts dan sejenisnya), lid/pn konversi (tidak ada sumber publik),
  cekresi/cekongkir (butuh API key berbayar), stt/videotranscribe,
  bitly (butuh token), stickerly/telestick/stickerpack/pinpack (sumber
  tidak bisa dijangkau), setpp/web2zip/proxy dan sejenisnya.
- Ditunda karena butuh hook pipeline (wilayah agen lain, bukan mustahil):
  botafk, antipm (hook before global), notifpromote, notifdemote (hook
  events.participants), antimedia (guard belum punya aturan antimedia).

## Dukungan v2 yang menyertai

- Set kuis teks baru di src/data/quiz.js: tebakanime, tebaklogo, tebakff,
  tebaktebakan (soal ditulis sendiri dua bahasa).
- Game HTML baru di games/: geometrydash, pacman, fruitslot, supermario
  (mengikuti pola vars + server skor yang sama dengan game lama).
- Label menu.cat id/en untuk semua kategori baru di src/i18n/locales.
- Perbaikan karantina pasca-generator: impor energi RPG diselaraskan ke
  API asli (MAX_ENERGY, restoreEnergy, energyOf), unreg memakai
  storage.delete, alias twdl/twitterdl duplikat dibuang dari .twitter,
  dan token game di plugin HTML yang rusak diperbaiki ke getGameSecret().

## Batch snippet user (2026-11-05, di luar audit Elaina)

Delapan plugin baru dari snippet kiriman user: .edubrain, .notrack,
.aidetect, .plagiarism, .aiscan, .grammarcheck, .nsfwcheck, .slopscan,
.deployhtml, .livechart (10 plugin), plus fallback .tiktok (unduhmedia +
tokgrab) dan fallback .pinterest (POST berpaginasi). Detail triase dan
kredit penulis ada di docs/SNIPPETS.md, keputusan kanonis/fallback ada di
docs/DECISIONS.md bagian F.
