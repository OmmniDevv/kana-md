# Audit Fitur RYO-YAMADA-MD dan Port ke KANA

Tanggal: 2026-11-05. Perintah owner: analisa semua fitur repo RYO-YAMADA-MD (himanackerman) dan port ke KANA; yang klon jadikan fallback saja. Penegasan owner pada hari yang sama: semua fitur tanpa kecuali harus muncul di matriks ini, dan hasil port tidak boleh berupa templat kosong; fitur yang mustahil berfungsi nyata masuk daftar tolak/defer dengan alasan jujur.

## Metode

- Inventaris: semua berkas di plugins/ repo RYO (620 berkas, 27 kategori) dibaca nama perintahnya dari handler.command dan handler.help, lalu dipetakan ke registry KANA (1408 plugin, 666 alias, dibaca lewat plugin-loader).
- Klasifikasi per berkas: SUDAH ADA (fungsi/perintah terdaftar di KANA, termasuk beda nama yang dicatat), PORT BARU (ditulis ulang gaya KANA sebagai plugin baru), FALLBACK (sumbernya ditambahkan ke rantai sumber plugin kanonis KANA), KLON (fungsi sudah terwakili plugin kanonis KANA sehingga tidak dibuatkan perintah duplikat), TOLAK (melanggar batas keras proyek atau mustahil tanpa kredensial pihak ketiga), PORT PREMIUM (NSFW dewasa yang semula TOLAK lalu diport atas perintah owner 2026-11-05 23:48 sebagai fitur premium), DEFER (belum diport pada giliran ini, alasan dicatat per berkas).
- Lisensi RYO tidak jelas untuk penyalinan: tidak ada kode RYO yang disalin verbatim. Semua hasil port ditulis ulang dari nol dalam gaya KANA (ESM, i18n id+en, template proyek, tanpa externalAdReply, tanpa em dash) dari perilaku fiturnya saja.
- Setiap sumber baru wajib terverifikasi dari VM dengan input asli sebelum masuk kode (pola verifikasi fallback .ig): metadata, berkas hasil, dan magic bytes diperiksa. Sumber yang gagal probe tidak dimasukkan rantai dan dicatat di kolom DEFER/TOLAK.

## Ringkasan hitungan

| Klasifikasi | Jumlah |
|---|---|
| SUDAH ADA | 433 |
| PORT BARU | 7 |
| PORT PREMIUM | 5 |
| FALLBACK | 1 |
| KLON | 76 |
| TOLAK | 42 |
| DEFER | 56 |
| **Total berkas RYO terinventaris** | **620** |

Jumlah semua klasifikasi sama dengan total berkas (620), tidak ada yang terlewat.

## Hasil port (bukti substantif)

### Plugin baru (7 perintah)

1. **.gitclone** (dari downloader/gitclone.js): unduh repo GitHub publik sebagai ZIP lewat zipball API GitHub resmi. Bukti VM: fetchRepoZip pada octocat/Hello-World mengembalikan berkas 387 byte dengan magic PK dan nama octocat-Hello-World.zip. Kode: src/scrapers/download/gitclone.js, plugins/download/gitclone.js.
2. **.upload** (dari tools/uguu.js dan tools/tourl2.js): unggah media yang dikirim/dikutip ke uguu.se dan balas tautan publiknya. Bukti VM: unggah PNG uji membalas https://d.uguu.se/pKScbKWj.png dan URL itu diunduh balik dengan HTTP 200. Kode: src/scrapers/tools/upload.js, plugins/tools/upload.js. Cadangan litterbox.catbox.moe dicoba dan tidak terjangkau dari VM (HTTP 000), jadi TIDAK dimasukkan rantai.
3. **.emojistick** (dari sticker/emojistick.js): emoji menjadi stiker dari gambar glyph aslinya. URL pola RYO (raw.githubusercontent googlefonts/noto-emoji) terbukti 404 dari VM, jadi sumber diganti Noto Color Emoji fonts.gstatic.com (utama) dan Twemoji jsdelivr (cadangan), keduanya terverifikasi PNG asli. Bukti VM: fetchEmojiPng untuk 😀 mengembalikan PNG 30192 byte dan toStickerWebp mengubahnya jadi WebP 11090 byte (magic WEBP). Kode: src/services/emoji-image.js, plugins/sticker/emojistick.js.
4. **.pinpesan** dan **.unpinpesan** (dari group/pinpesan.js): sematkan/lepas pesan yang dikutip memakai content.pin yang didukung jalur kirim library elaina-baileys 1.4.7 (messages-send.js mengenali content.pin menjadi pinInChatMessage). Bukti: tes perilaku handler dengan ctx palsu menegaskan payload { pin: { remoteJid, fromMe, id, participant }, type: 1 } terkirim persis ke sock untuk pin dan type 2 untuk unpin; tanpa kutipan handler hanya membalas petunjuk dan tidak mengirim apa pun. Vonis live WhatsApp menunggu jendela tes chat utama. Kode: src/services/pin-message.js, plugins/group/pinpesan.js, plugins/group/unpinpesan.js.
5. **.wallpaper** (dari downloader/image-wallpaper.js): cari wallpaper di wallpaperflare.com (scrape halaman pencarian, tanpa cookie statis seperti versi RYO). Bukti VM: pencarian "anime" memberi 10 hasil dan gambar pertama terunduh 50627 byte dengan magic JPEG ffd8. Kode: src/scrapers/search/wallpaper.js, plugins/search/wallpaper.js.
6. **.wastalk** (dari stalk/wa.js, dinilai ulang 2026-11-05 atas perintah owner): penampil profil PUBLIK WhatsApp sebuah nomor. Penilaian mekanisme membuktikan isinya hanya data yang diekspos WhatsApp ke publik (cek terdaftar, foto profil, teks about, profil bisnis publik), jadi diport gaya KANA dari nol, bukan disalin: method sock library 1.4.7 yang dipakai terverifikasi ada di sumber library (onWhatsApp, fetchStatus dengan parser USyncStatusProtocol, getBusinessProfile, profilePictureUrl). Bukti: 11 tes perilaku di test/wastalk-port.test.js (normalisasi nomor, negara dari awalan, parser status USync dan profil bisnis, alur fetchWaProfile dengan sock tiruan, perilaku handler termasuk target dari pesan yang dibalas dan jalan pintas teks bila foto gagal diunduh). Vonis live WhatsApp menunggu jendela tes chat utama. Kode: src/services/wa-profile.js, plugins/search/wastalk.js.

### Fallback baru (1)

- **Cadangan unduh audio YouTube dari api-faa.my.id** (dari downloader/ytmp3v2.js): downloadAudio di src/scrapers/youtube/youtube.js kini mencoba jalur utama ytdl-core dulu; bila gagal total, downloadAudioViaFaa mengambil mp3 dari API faa (pola ytmp3 RYO) dan memvalidasi magic bytes ID3/frame sync sebelum diterima. Bukti VM: untuk video uji ZAfAud_M_mg, API membalas judul asli "Halsey - Without Me" dan berkas mp3 3,61 MB ber-magic ID3 terunduh penuh. Ini memperkuat .play, .ytmp3, dan semua pemakai downloadAudio tanpa perintah baru.

### Port premium NSFW dewasa (perintah owner 2026-11-05 23:48)

Owner memerintahkan NSFW dewasa RYO ikut diport sebagai fitur premium. Lima berkas berpindah dari TOLAK menjadi PORT PREMIUM. Semua hasil port ditulis ulang gaya KANA, tergating config.premium = true mengikuti pola src/services/premium.js, khusus chat pribadi (isPrivate), dan untuk kategori nsfw memakai gerbang konfirmasi 18+ sekali simpan yang sudah menjadi pola kategori itu.

1. **nsfw/xnxx.js menjadi .xnxxsearch** (plugins/nsfw/xnxxsearch.js ditulis ulang total; alias xnxx dan xnxxdl): cari video di xnxx.com lalu unduh mp4 langsung untuk dipilih pemanggil. Versi RYO memakai proksi CORS pihak ketiga (uncors.netlify.app); dari VM situs aslinya terjangkau langsung, jadi proksi dibuang. Bukti VM: pencarian "anime" membalas hasil asli, halaman video memuat URL mp4 CDN langsung, dan potongan berkasnya terverifikasi magic ftyp (isom). Alur pilih memakai subperintah `.xnxxsearch ambil <nomor>` atas hasil pencarian yang disimpan per pemanggil, bukan URL mentah gaya RYO. Kode: src/scrapers/xnxx/xnxx.js.
2. **nsfw/waifu.js menjadi .waifu18 (alias waifunsfw), .hentai, .oppai, .milf**: gambar anime dewasa dari sumber publik. Sumber RYO api.waifu.im mati total dari VM (koneksi gagal, HTTP 000; api.waifu.pics sama), jadi diganti NekosAPI (rating explicit; berkas WebP terverifikasi magic RIFF/WebP) dan Konachan (query tag oppai dan kolam rating:e; berkas JPEG terverifikasi magic ffd8). Konachan wajib memakai pengecualian tag di query dan saringan tag pada hasil: pos bertanda loli atau shota tidak pernah diteruskan. Tag milf tidak berbuah di booru (probe Konachan dan yande.re sama-sama 0 pos), jadi .milf memakai kolam explicit NekosAPI. Kode: src/scrapers/nsfw/adult-image.js; plugins/nsfw/waifu18.js dan hentai.js ditulis ulang sumbernya, oppai.js dan milf.js berkas baru.
3. **fun/cekkontol.js, fun/cekmemek.js, fun/cektt.js menjadi .cekkontol, .cekmemek, .cektt** (plugins/cek/, berkas baru): pemeriksa vulgar hiburan, ditulis ulang mengikuti keluarga cek KANA dengan hasil deterministik dari nama (RYO mengacak liar). Bukti: tes perilaku handler dengan ctx tiruan; hasil memuat nama sasaran dan atribut lengkap, dan nama yang sama selalu memberi hasil yang sama.

Yang dinilai ulang pada giliran ini dan ditegaskan TETAP DITOLAK:

- **nsfw/videobkp.js**: satu-satunya sumbernya daftar video koleksi repo GitHub bernama "Asupan" (13 URL video Blogger bertoken). Itu konten asupan, yaitu bocoran/pribadi yang tidak bisa diverifikasi konsensual, jadi tetap ditolak walau perintah owner membuka port NSFW dewasa.
- **anime/loli.js**: seksualisasi anak/di bawah umur. Batas keras, tidak diport dalam bentuk apa pun.
- **random/asupan.js dan random/papayang.js**: konten bocoran/pribadi orang. Batas keras, tetap ditolak.
- **rpg/ewepaksa.js**: tema pemaksaan (paksa/perkosa). Batas keras non-konsensual, tetap ditolak.
- **fun/stres.js**: memuat perintah perkosa (non-konsensual) dan teks seksual eksplisit yang ditujukan ke nama orang. Seluruh berkas tetap ditolak.
- **rpg/ewe.js**: simulasi seks RPG berbentuk teks vulgar dengan narasi atas orang fiktif dari layanan michat; bukan pengambil media dewasa publik dan bukan pemeriksa, jadi di luar cakupan yang owner izinkan pada perintah ini, dan satu keluarga dengan ewepaksa. Tetap ditolak.

Tes giliran ini: test/nsfw-premium-port.test.js, 10 tes (parser xnxx atas fixture tangkapan asli VM, parser NekosAPI dan pemilih Konachan atas fixture asli, saringan tag berbahaya termasuk penolakan pos bertanda loli, gerbang premium dan chat pribadi di config kedelapan plugin, alur gerbang 18+ dan konfirmasi xnxxsearch, perilaku handler tiga pemeriksa vulgar). npm test penuh pada giliran ini: 726/726 hijau. Vonis live WhatsApp menunggu jendela tes chat utama seperti port lain.

### Tes

- test/ryo-port.test.js: 11 tes (parser URL GitHub + magic ZIP, parser balasan uguu, codepoint/URL emoji + magic PNG, penyusun payload pin, perilaku handler pin/unpin termasuk gerbang kutipan, parser faa + magic mp3, parser galeri wallpaperflare).
- test/wastalk-port.test.js: 11 tes (penilaian ulang subset tag dan stalk 2026-11-05: normalisasi nomor, negara dari awalan kode telepon, parser status USync dan profil bisnis, alur fetchWaProfile dengan sock tiruan, perilaku handler wastalk termasuk target dari pesan yang dibalas, nomor tak terdaftar, dan jalan pintas teks bila foto gagal diunduh).
- npm test penuh: 665/665 hijau (termasuk 11 tes baru di test/ryo-port.test.js).
- Registry sesudah port: 1414 plugin (1408 + 6 berkas plugin baru), 0 karantina. npm run i18n:check bersih.

## Matriks lengkap per berkas

| Berkas RYO | Perintah RYO | Klasifikasi | Padanan / catatan |
|---|---|---|---|
| ai/alya.js | alya <teks>, alya | SUDAH ADA | Nama perintah "alya" terdaftar di registry KANA |
| ai/bard.js | bard <pertanyaan>, bard | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/bocchi.js | bocchi <teks>, bocchi, bocchiai | SUDAH ADA | Nama perintah "bocchi" terdaftar di registry KANA |
| ai/chatgpt.js | chatgpt, ai | SUDAH ADA | Nama perintah "ai" terdaftar di registry KANA |
| ai/claude.js | claude, claudeai | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/dolphin.js | dolphin <pertanyaan>, dolphin | SUDAH ADA | Nama perintah "dolphin" terdaftar di registry KANA |
| ai/epsilon.js | epsilon | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/felo.js | felo | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/furina.js | furina | SUDAH ADA | Nama perintah "furina" terdaftar di registry KANA |
| ai/gemini.js | gemini | SUDAH ADA | Nama perintah "gemini" terdaftar di registry KANA |
| ai/gita.js | gita | SUDAH ADA | Nama perintah "gita" terdaftar di registry KANA |
| ai/gptprompt.js | gptprompt | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/hoshino.js | hoshino <teks>, hoshino, hoshinoba | SUDAH ADA | Nama perintah "hoshino" terdaftar di registry KANA |
| ai/hutao.js | hutao <teks>, hutao, hutaoai | SUDAH ADA | Nama perintah "hutao" terdaftar di registry KANA |
| ai/imgprompt.js | imgprompt | SUDAH ADA | Nama perintah "imgprompt" terdaftar di registry KANA |
| ai/jeeves.js | jeeves | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/kita.js | kita <teks>, kita, kitaikuyo | SUDAH ADA | Nama perintah "kita" terdaftar di registry KANA |
| ai/mahiru.js | mahiru | SUDAH ADA | Nama perintah "mahiru" terdaftar di registry KANA |
| ai/makima.js | makima | SUDAH ADA | Nama perintah "makima" terdaftar di registry KANA |
| ai/megumin.js | meguminai, megu | SUDAH ADA | Nama perintah "meguminai" terdaftar di registry KANA |
| ai/mikasa.js | mikasa <teks>, mikasa | SUDAH ADA | Nama perintah "mikasa" terdaftar di registry KANA |
| ai/miku.js | mikuai | SUDAH ADA | Nama perintah "mikuai" terdaftar di registry KANA |
| ai/nanobana.js | editimage, nanobanana | SUDAH ADA | Nama perintah "nanobanana" terdaftar di registry KANA |
| ai/nijika.js | nijika <teks>, nijika, nijikaai | SUDAH ADA | Nama perintah "nijika" terdaftar di registry KANA |
| ai/oguri.js | oguri <teks>, oguricap <teks>, oguri, oguricap | SUDAH ADA | Nama perintah "oguri" terdaftar di registry KANA |
| ai/oguricap.js | oguri <teks>, oguricap <teks>, oguri, oguricap | SUDAH ADA | Nama perintah "oguri" terdaftar di registry KANA |
| ai/perplexity.js | perplexity, plx | SUDAH ADA | Nama perintah "perplexity" terdaftar di registry KANA |
| ai/powerbrain.js | powerbrain | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/public.js | publicai | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/quilbot.js | quillbot | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/realtime.js | airealtime <pertanyaan>, airealtime | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| ai/ryo.js | ryo <teks>, ryoyamada <teks>, ryoai <teks>, ryo, ryoyamada, ryoai | SUDAH ADA | Nama perintah "ryo" terdaftar di registry KANA |
| ai/text2img.js | text2img <prompt>, text2img | SUDAH ADA | Nama perintah "text2img" terdaftar di registry KANA |
| ai/waguri.js | waguri <teks>, waguri | KLON | Varian provider/persona dari satu fungsi chat AI; sesuai strategi paritas, persona adalah mode di .ai KANA, bukan perintah baru |
| anime/anilist.js | anilist | SUDAH ADA | Nama perintah "anilist" terdaftar di registry KANA |
| anime/animequotes.js | animequotes | SUDAH ADA | Nama perintah "animequotes" terdaftar di registry KANA |
| anime/bluearchive.js | bluearchive | SUDAH ADA | Nama perintah "bluearchive" terdaftar di registry KANA |
| anime/imagesearch.js | animesearch | DEFER | Pencarian gambar anime (trace gambar): sumber belum diverifikasi pada giliran ini |
| anime/info.js | animeinfo <anime>, animeinfo | SUDAH ADA | Nama perintah "animeinfo" terdaftar di registry KANA |
| anime/komiku.js | komiku | DEFER | Endpoint komiku di API nexray terbukti mati (404 Endpoint not found) dari VM; padanan .komik (scrape Komikcast) sudah ada. Bisa dibuka lagi bila scrape langsung komiku.org dikerjakan |
| anime/latest.js | animelatest, latestanime | SUDAH ADA | Nama perintah "animelatest" terdaftar di registry KANA |
| anime/loli.js | loli | TOLAK | Kategori loli: dilarang keras (seksualisasi anak) |
| anime/luvyaa.js | luvyaa | DEFER | Sumber belum diverifikasi pada giliran ini |
| anime/manga.js | manga <judul>, manga | SUDAH ADA | Nama perintah "manga" terdaftar di registry KANA |
| anime/pap.js | pap | SUDAH ADA | Nama perintah "pap" terdaftar di registry KANA |
| anime/random.js | akira, akiyama, anna, asuna, ayuzawa, boruto, chitanda, chitoge, deidara, doraemon, emilia, erza, gremory, hestia, hinata, inori, itachi, isuzu, itori, kaga, kagura, kakasih, kaori, kaneki, kosaki, kotori, kuriyama, kuroha, kurumi, madara, mikasa, miku, minato, naruto, natsukawa, neko2, nekohime, nezuko, nishimiya, onepiece, pokemon, rem, rize, sagiri, sakura, sasuke, shina, shinka, shizuka, shota, tomori, toukachan, tsunade, yatogami, yuki | SUDAH ADA | Nama perintah "anna" terdaftar di registry KANA |
| anime/story-anime.js | storyanime, animestory, stori, y | DEFER | Sumber belum diverifikasi pada giliran ini |
| anime/topanime.js | topanime <jumlah>, topanime | SUDAH ADA | Nama perintah "topanime" terdaftar di registry KANA |
| anime/waifu.js | waifu | SUDAH ADA | Nama perintah "waifu" terdaftar di registry KANA |
| anime/yande.js | yande | SUDAH ADA | Nama perintah "yande" terdaftar di registry KANA |
| anu/_afk.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen before AFK KANA (sambutan kembali + info mention) |
| anu/_alert.js | (hook internal) | DEFER | Hook pelacak perintah internal RYO: bukan fitur user, tidak diadopsi |
| anu/_antierror.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen pengaman error pipeline KANA (satu plugin rusak tidak menjatuhkan bot) |
| anu/_antilink.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen guard antilink grup KANA |
| anu/_antimedia.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen guard antimedia grup KANA |
| anu/_antipromosi.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen guard antipromosi grup KANA |
| anu/_antitoxic.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen guard antitoxic grup KANA |
| anu/_autodl.js | (hook internal) | DEFER | Hook unduh otomatis semua tautan: tidak diadopsi; unduhan KANA lewat perintah eksplisit per platform |
| anu/_autogpt.js | (hook internal) | KLON | Balasan AI otomatis di grup: terwakili .autoai KANA |
| anu/_autolevelup.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen level-up otomatis sistem XP KANA |
| anu/_autosholat.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen notifikasi sholat KANA |
| anu/_autosimi.js | (hook internal) | KLON | Balasan AI otomatis di grup: terwakili .autoai KANA |
| anu/_claim-limit.js | claimlimit | KLON | Klaim limit: terwakili sistem limit dan klaim KANA |
| anu/_cmdtracker.js | (hook internal) | DEFER | Hook pelacak perintah internal RYO: bukan fitur user, tidak diadopsi |
| anu/_cmdWithMedia.js | (hook internal) | SUDAH ADA | Hook internal: perintah bermedia ditangani pipeline KANA (downloadMedia/downloadQuoted) |
| anu/_didyoumean.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen saran perintah saat perintah tidak dikenal di pipeline KANA |
| anu/_getpp.js | getpp <@tag/reply>, getpp | SUDAH ADA | Nama perintah "getpp" terdaftar di registry KANA |
| anu/_hilman.js | (hook internal) | DEFER | Hook khas author RYO (respon nama Hilman), tidak relevan untuk KANA |
| anu/_intro.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen intro grup KANA |
| anu/_memfess-ans.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen jawaban menfess KANA |
| anu/_premium.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen gerbang premium KANA di pipeline |
| anu/_templateResponse.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen template pusat src/config/templates.js KANA |
| anu/_tes.js | (hook internal) | DEFER | Hook pelacak perintah internal RYO: bukan fitur user, tidak diadopsi |
| anu/_waalaikumsalam.js | (hook internal) | KLON | Salam otomatis: terwakili autoreply dan customcmd grup KANA |
| audio/effect.js | bass, blown, deep, earrape, fast, fat, nightcore, reverse, robot, slow, smooth, tupai, reverb, chorus, flanger, distortion, pitch, highpass, lowpass, underwater, squirrel, chipmunk | SUDAH ADA | Nama perintah "bass" terdaftar di registry KANA |
| audio/tomp3.js | tomp3 | SUDAH ADA | Nama perintah "tomp3" terdaftar di registry KANA |
| audio/tovn.js | tovn, toptt | SUDAH ADA | Nama perintah "tovn" terdaftar di registry KANA |
| audio/zeta.js | zetavoice | SUDAH ADA | Nama perintah "zetavoice" terdaftar di registry KANA |
| downloader/aio.js | aio | SUDAH ADA | Nama perintah "aio" terdaftar di registry KANA |
| downloader/aio2.js | aio2 <url>, aio2 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/applemusic.js | applemusic, aplmusic, applemp3 | SUDAH ADA | Nama perintah "applemusic" terdaftar di registry KANA |
| downloader/blibili.js | bilibili <url>, bili, blibli, bilibili | DEFER | Gateway playurl bilibili.tv membalas kode 10015001 (batasan wilayah hak cipta) untuk semua video uji dari VM dan halaman video tidak menyematkan stream; jalur penuh tidak bisa dibuktikan, jadi tidak dibuatkan plugin pajangan |
| downloader/capcut.js | capcut | SUDAH ADA | Nama perintah "capcut" terdaftar di registry KANA |
| downloader/douyin.js | douyin <url>, douyin | SUDAH ADA | Padanan KANA: .douyindl |
| downloader/facebook.js | facebook <link>, fb, facebook | SUDAH ADA | Nama perintah "facebook" terdaftar di registry KANA |
| downloader/gitclone.js | gitclone | PORT BARU | Diport jadi .gitclone (src/scrapers/download/gitclone.js + plugins/download/gitclone.js) |
| downloader/googledrive.js | gdrive <url>, gdrive | SUDAH ADA | Nama perintah "gdrive" terdaftar di registry KANA |
| downloader/ig.js | instagram <url>, ig, instagram | SUDAH ADA | Nama perintah "instagram" terdaftar di registry KANA |
| downloader/ig3.js | instagram3, ig3, igdl3 | KLON | Varian cadangan Instagram dari API nexray; rantai .ig KANA sudah 4 sumber terverifikasi dan endpoint nexray terprobe membalas 500/403 dari VM, jadi tidak ditambahkan |
| downloader/igaudio.js | igaudio <url>, igmp3 <url>, igaudio, igmp3 | SUDAH ADA | Nama perintah "igaudio" terdaftar di registry KANA |
| downloader/image-wallpaper.js | wallpaper,  <query> | PORT BARU | Diport jadi .wallpaper, scrape wallpaperflare ditulis ulang tanpa cookie statis RYO (src/scrapers/search/wallpaper.js + plugins/search/wallpaper.js) |
| downloader/instatiktok.js | dlit <platform> <url>, dlit | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/mediafire.js | mediafire <url>, mediafire, mf | SUDAH ADA | Nama perintah "mediafire" terdaftar di registry KANA |
| downloader/pindl.js | pindl | SUDAH ADA | Nama perintah "pindl" terdaftar di registry KANA |
| downloader/pindl2.js | pindl2 | SUDAH ADA | Nama perintah "pindl2" terdaftar di registry KANA |
| downloader/play.js | play | SUDAH ADA | Nama perintah "play" terdaftar di registry KANA |
| downloader/play2.js | play2 <judul lagu>, play2 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/sfile.js | sfile <query>, sfiledl <link>, sfile, sfiledl | SUDAH ADA | Nama perintah "sfiledl" terdaftar di registry KANA |
| downloader/soundcloud.js | scdl <url>, scdl, soundcloud | SUDAH ADA | Nama perintah "scdl" terdaftar di registry KANA |
| downloader/spotify.js | spotify <judul/url>, spotify, spotifydl, spotifymp3 | SUDAH ADA | Nama perintah "spotify" terdaftar di registry KANA |
| downloader/tiktok.js | tt, tiktok | SUDAH ADA | Nama perintah "tt" terdaftar di registry KANA |
| downloader/tiktok2.js | tt2 <url/query>, tiktok2 <url/query>, tt2, tiktok2 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/ttimg.js | ttimg <url>, tiktokimg <url>, ttimg, tiktokimg | SUDAH ADA | Nama perintah "ttimg" terdaftar di registry KANA |
| downloader/ttmusic.js | tiktokmusic, ttmusic, ttmp3 | SUDAH ADA | Nama perintah "ttmp3" terdaftar di registry KANA |
| downloader/twitter.js | twitter, tw, xdl | SUDAH ADA | Nama perintah "twitter" terdaftar di registry KANA |
| downloader/videy.js | videy <url>, videy | SUDAH ADA | Nama perintah "videy" terdaftar di registry KANA |
| downloader/ytmp3.js | ytmp3 | SUDAH ADA | Nama perintah "ytmp3" terdaftar di registry KANA |
| downloader/ytmp3v2.js | ytmp3v2 <url>, ytmp3v2 | FALLBACK | Sumber api-faa ytmp3 ditambahkan sebagai cadangan downloadAudio di src/scrapers/youtube/youtube.js (parseFaaYtmp3 + downloadAudioViaFaa); terverifikasi VM: judul asli + mp3 3,61 MB magic ID3 |
| downloader/ytmp3v3.js | ytmp3v3 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/ytmp4.js | playvid, ytmp4 | SUDAH ADA | Nama perintah "playvid" terdaftar di registry KANA |
| downloader/ytmp4v2.js | ytmp4v2 <url>, ytmp4v2 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| downloader/ytmp4v3.js | ytmp4v3 | KLON | Varian unduhan dari API agregator (faa/nexray) untuk fungsi yang sudah ada dan terverifikasi di KANA; menambah sumber agregator tanpa bukti keunggulan tidak dilakukan |
| fun/alay.js | alay | SUDAH ADA | Nama perintah "alay" terdaftar di registry KANA |
| fun/angka.js | angka <0-9>, angka | SUDAH ADA | Nama perintah "angka" terdaftar di registry KANA |
| fun/apakah.js | apakah <teks>?, apakah | SUDAH ADA | Nama perintah "apakah" terdaftar di registry KANA |
| fun/benarkah.js | benarkah | SUDAH ADA | Nama perintah "benarkah" terdaftar di registry KANA |
| fun/bisakah.js | bisakah <pertanyaan>, bisakah | SUDAH ADA | Nama perintah "bisakah" terdaftar di registry KANA |
| fun/cekcantik.js | cantikcek, cekcantik | SUDAH ADA | Nama perintah "cekcantik" terdaftar di registry KANA |
| fun/cekfemboy.js | cekfemboy | SUDAH ADA | Nama perintah "cekfemboy" terdaftar di registry KANA |
| fun/cekhodam.js | cekkhodam *<name>*, cekkhodam | SUDAH ADA | Nama perintah "cekkhodam" terdaftar di registry KANA |
| fun/cekjomok.js | jomok | SUDAH ADA | Nama perintah "jomok" terdaftar di registry KANA |
| fun/cekkontol.js | cekkontol *<name>*, cekkontol | PORT PREMIUM | Diport perintah owner 2026-11-05 sebagai .cekkontol premium (plugins/cek/cekkontol.js), pemeriksa vulgar hiburan deterministik gaya keluarga cek KANA |
| fun/cekmemek.js | cekmemek *<name>*, cekmemek, cekmmk | PORT PREMIUM | Diport perintah owner 2026-11-05 sebagai .cekmemek premium (plugins/cek/cekmemek.js), pemeriksa vulgar hiburan deterministik gaya keluarga cek KANA |
| fun/cektt.js | cektt *<name>*, cekpentil, cektt | PORT PREMIUM | Diport perintah owner 2026-11-05 sebagai .cektt premium (plugins/cek/cektt.js, alias cekpentil), pemeriksa vulgar hiburan deterministik gaya keluarga cek KANA |
| fun/dimanakah.js | dimanakah <pertanyaan>, dimanakah | SUDAH ADA | Nama perintah "dimanakah" terdaftar di registry KANA |
| fun/funcek.js | goblokcek, jelekcek, gaycek, rate, lesbicek, gantengcek, cantikcek, begocek, suhucek, pintercek, jagocek, nolepcek, babicek, bebancek, baikcek, jahatcek, anjingcek, haramcek, pakboycek, pakgirlcek, sangecek, bapercek, fakboycek, alimcek, fakgirlcek, kerencek, wibucek, pasarkascek, kulcek, cekgoblok, cekjelek, cekgay, ceklesbi, cekganteng, cekcantik, cekbego, ceksuhu, cekpinter, cekjago, ceknolep, cekbabi, cekbeban, cekbaik, cekjahat, cekanjing, cekharam, cekpakboy, cekpakgirl, ceksange, cekbaper, cekfakboy, cekalim, cekfakgirl, cekkeren, cekwibu, cekpasarkas, cekkul | SUDAH ADA | Nama perintah "rate" terdaftar di registry KANA |
| fun/kapankah.js | kapankah <pertanyaan>, kapankah | SUDAH ADA | Nama perintah "kapankah" terdaftar di registry KANA |
| fun/kematian.js | kematian <nama opsional>, kematian | SUDAH ADA | Nama perintah "kematian" terdaftar di registry KANA |
| fun/kerangajaib.js | kerang, kerangajaib | SUDAH ADA | Nama perintah "kerang" terdaftar di registry KANA |
| fun/lupakan.js | lupakan | SUDAH ADA | Nama perintah "lupakan" terdaftar di registry KANA |
| fun/mimpi.js | dreamworld, dream, mimpi, dreamexp | SUDAH ADA | Nama perintah "dreamworld" terdaftar di registry KANA |
| fun/moveon.js | moveon | SUDAH ADA | Nama perintah "moveon" terdaftar di registry KANA |
| fun/ramalan.js | ramal <nama opsional>, ramal | SUDAH ADA | Nama perintah "ramal" terdaftar di registry KANA |
| fun/seberapagila.js | seberapagila <nama opsional>, seberapagila | SUDAH ADA | Nama perintah "seberapagila" terdaftar di registry KANA |
| fun/simi.js | simi, simisimi | SUDAH ADA | Nama perintah "simi" terdaftar di registry KANA |
| fun/sipaling2.js | sipaling <teks>, sipaling | SUDAH ADA | Nama perintah "sipaling" terdaftar di registry KANA |
| fun/stres.js | genjot, nenen, wangy, curhat, perkosa | TOLAK | Perintah berbalas vulgar/seksual (genjot, perkosa, dan sejenisnya): dilarang |
| fun/suratcinta.js | suratcinta <nama>, suratcinta | SUDAH ADA | Nama perintah "suratcinta" terdaftar di registry KANA |
| fun/tafsirmimpi.js | mimpi2 <kata>, mimpi2 | SUDAH ADA | Padanan KANA: .tafsirmimpi |
| fun/tebakumur.js | tebakumur | SUDAH ADA | Nama perintah "tebakumur" terdaftar di registry KANA |
| fun/tool-morse.js | morse, demorse | SUDAH ADA | Nama perintah "morse" terdaftar di registry KANA |
| fun/top.js | top | SUDAH ADA | Nama perintah "top" terdaftar di registry KANA |
| game/_tictactoe.js | (hook internal) | SUDAH ADA | Hook internal: ekuivalen sesi tictactoe KANA |
| game/akinator.js | akinator, aki, akistop | SUDAH ADA | Nama perintah "akinator" terdaftar di registry KANA |
| game/blackjack.js | blackjack | SUDAH ADA | Nama perintah "blackjack" terdaftar di registry KANA |
| game/bom.js | bomb | SUDAH ADA | Nama perintah "bomb" terdaftar di registry KANA |
| game/caklontong.js | caklontong | SUDAH ADA | Nama perintah "caklontong" terdaftar di registry KANA |
| game/cerdascermat.js | cerdascermat, cc | SUDAH ADA | Nama perintah "cerdascermat" terdaftar di registry KANA |
| game/dino.js | dino | SUDAH ADA | Nama perintah "dino" terdaftar di registry KANA |
| game/family100.js | family100, family1 | SUDAH ADA | Nama perintah "family100" terdaftar di registry KANA |
| game/flappybird.js | flappybird, flappy | SUDAH ADA | Nama perintah "flappy" terdaftar di registry KANA |
| game/games-tictactoe.js | tictactoe, ttt | SUDAH ADA | Nama perintah "tictactoe" terdaftar di registry KANA |
| game/kuis.js | kuis | SUDAH ADA | Nama perintah "kuis" terdaftar di registry KANA |
| game/lengkapikalimat.js | lengkapikalimat | SUDAH ADA | Nama perintah "lengkapikalimat" terdaftar di registry KANA |
| game/maths.js | maths | SUDAH ADA | Nama perintah "maths" terdaftar di registry KANA |
| game/perangsarung.js | perangsarung @user, perangsarung | SUDAH ADA | Nama perintah "perangsarung" terdaftar di registry KANA |
| game/sambungkata.js | sambungkata | SUDAH ADA | Nama perintah "sambungkata" terdaftar di registry KANA |
| game/siapakahaku.js | siapakahaku | SUDAH ADA | Nama perintah "siapakahaku" terdaftar di registry KANA |
| game/snake.js | snake | SUDAH ADA | Nama perintah "snake" terdaftar di registry KANA |
| game/sonic.js | dash, sonic, speedy, speeddash | SUDAH ADA | Nama perintah "dash" terdaftar di registry KANA |
| game/suit.js | suit | SUDAH ADA | Nama perintah "suit" terdaftar di registry KANA |
| game/susunkata.js | susunkata, sskata | SUDAH ADA | Nama perintah "susunkata" terdaftar di registry KANA |
| game/tebakanime.js | tebakanime | SUDAH ADA | Nama perintah "tebakanime" terdaftar di registry KANA |
| game/tebakbendera.js | tebakbendera, tbendera, whoflag, who | SUDAH ADA | Nama perintah "tebakbendera" terdaftar di registry KANA |
| game/tebakbola.js | tebakbola, whobola | SUDAH ADA | Nama perintah "tebakbola" terdaftar di registry KANA |
| game/tebakff.js | tebakff, whoff | SUDAH ADA | Nama perintah "tebakff" terdaftar di registry KANA |
| game/tebakgambar.js | tebakgambar | SUDAH ADA | Nama perintah "tebakgambar" terdaftar di registry KANA |
| game/tebakgame.js | tebakgame | SUDAH ADA | Nama perintah "tebakgame" terdaftar di registry KANA |
| game/tebakhewan.js | tebakhewan | SUDAH ADA | Nama perintah "tebakhewan" terdaftar di registry KANA |
| game/tebakjkt.js | tebakjkt, whojkt | SUDAH ADA | Nama perintah "tebakjkt" terdaftar di registry KANA |
| game/tebakkartun.js | tebakkartun, whokartun | SUDAH ADA | Nama perintah "tebakkartun" terdaftar di registry KANA |
| game/tebakkimia.js | tebakkimia, whokimia | SUDAH ADA | Nama perintah "tebakkimia" terdaftar di registry KANA |
| game/tebaklagu.js | tebaklagu, wholagu | SUDAH ADA | Nama perintah "tebaklagu" terdaftar di registry KANA |
| game/tebaklirik.js | tebaklirik | SUDAH ADA | Nama perintah "tebaklirik" terdaftar di registry KANA |
| game/tebaklogo.js | tebaklogo | SUDAH ADA | Nama perintah "tebaklogo" terdaftar di registry KANA |
| game/tebakmakanan.js | tebakmakanan | SUDAH ADA | Nama perintah "tebakmakanan" terdaftar di registry KANA |
| game/tebaksurah.js | tebaksurah, whosurah | SUDAH ADA | Nama perintah "tebaksurah" terdaftar di registry KANA |
| game/tebaktebakan.js | tebaktebakan | SUDAH ADA | Nama perintah "tebaktebakan" terdaftar di registry KANA |
| game/tebakwarna.js | tebakwarna, whowarna | SUDAH ADA | Nama perintah "tebakwarna" terdaftar di registry KANA |
| game/tetris.js | tetris | SUDAH ADA | Nama perintah "tetris" terdaftar di registry KANA |
| game/togel.js | togel, angka, stoptogel | SUDAH ADA | Nama perintah "togel" terdaftar di registry KANA |
| game/truthordare.js | truthordare, tod | KLON | Terwakili .truth dan .dare KANA |
| game/uno.js | (hook internal) | DEFER | Permainan kartu UNO grup bersesi: belum ada padanan di KANA dan belum diport pada giliran ini |
| game/war-attack.js | attack, atk | SUDAH ADA | Nama perintah "attack" terdaftar di registry KANA |
| game/war.js | war | KLON | Permainan perang teks: terwakili .perangsarung dan perang clan/guild KANA |
| group/acc.js | acc, approve | SUDAH ADA | Nama perintah "acc" terdaftar di registry KANA |
| group/antidana.js | antidana | SUDAH ADA | Nama perintah "antidana" terdaftar di registry KANA |
| group/antihidetag.js | antihidetag <on/off>, antihidetag | SUDAH ADA | Nama perintah "antihidetag" terdaftar di registry KANA |
| group/antiklinkch.js | antilinkch | KLON | Guard antilink KANA menahan semua jenis tautan termasuk tautan channel |
| group/antinsfw.js | antinsfw | KLON | Penahan konten NSFW di grup: terwakili guard grup + .nsfwcheck KANA |
| group/antispam.js | antispam <on/off>, antispam | SUDAH ADA | Nama perintah "antispam" terdaftar di registry KANA |
| group/antitagsw.js | antitagsw | SUDAH ADA | Nama perintah "antitagsw" terdaftar di registry KANA |
| group/autosticker.js | autosticker <on/off>, autosticker | SUDAH ADA | Nama perintah "autosticker" terdaftar di registry KANA |
| group/delppgc.js | delppgc, removeppgc | DEFER | Menghapus foto profil grup belum didukung jalur KANA saat ini |
| group/enable.js | enable, disable, on, off | SUDAH ADA | Nama perintah "enable" terdaftar di registry KANA |
| group/group-delete.js | del, delete, d, hps, hapus, erase | SUDAH ADA | Nama perintah "del" terdaftar di registry KANA |
| group/hidetag.js | hidetag, ht | SUDAH ADA | Nama perintah "hidetag" terdaftar di registry KANA |
| group/info.js | infogc, gc | SUDAH ADA | Padanan KANA: .groupinfo |
| group/kick.js | kick @user, kick (reply pesan), kick | SUDAH ADA | Nama perintah "kick" terdaftar di registry KANA |
| group/link.js | linkgrup | SUDAH ADA | Nama perintah "linkgrup" terdaftar di registry KANA |
| group/opentime.js | opentime <angka> <unit>, opentime | SUDAH ADA | Nama perintah "opentime" terdaftar di registry KANA |
| group/pinpesan.js | pinpesan, unpinpesan | PORT BARU | Diport jadi .pinpesan dan .unpinpesan (src/services/pin-message.js + plugins/group/pinpesan.js + plugins/group/unpinpesan.js) |
| group/polling.js | poll, polling | SUDAH ADA | Nama perintah "poll" terdaftar di registry KANA |
| group/promote.js | promote @user, demote @user, promote, demote | SUDAH ADA | Nama perintah "promote" terdaftar di registry KANA |
| group/setbye.js | setbye | SUDAH ADA | Padanan KANA: .setgoodbye |
| group/setintro.js | setintro, intro, delintro | SUDAH ADA | Nama perintah "setintro" terdaftar di registry KANA |
| group/setnamagc.js | setnamagc | DEFER | Mengganti nama grup: belum diport pada giliran ini |
| group/setppgc.js | setppgc | SUDAH ADA | Padanan KANA: .setppgrup |
| group/settings.js | gc *open / close*, group, gc | SUDAH ADA | Nama perintah "group" terdaftar di registry KANA |
| group/setwelcome.js | setwelcome, setw | SUDAH ADA | Nama perintah "setwelcome" terdaftar di registry KANA |
| group/spamtag.js | spamtag @user, spamtag | TOLAK | Dinilai ulang per mekanisme 2026-11-05 atas perintah owner: loop mention berulang ke SATU target yang sama (3x pengguna biasa, 5x premium, 10x owner, jeda 700ms) = spam tag banjir untuk mengganggu, bukan tag pengumuman. TETAP DITOLAK (spam, batas keras owner). Tag pengumuman satu kali sudah terwakili .totag, .tagall, dan .hidetag KANA |
| group/tagadmin.js | tagadmin | SUDAH ADA | Nama perintah "tagadmin" terdaftar di registry KANA |
| group/tagall.js | tagall | SUDAH ADA | Nama perintah "tagall" terdaftar di registry KANA |
| group/tagsw.js | swgc, upswgc | KLON | Dinilai ulang per mekanisme 2026-11-05 atas perintah owner: bukan mengambil status orang (colongsw), melainkan MEMPOSTING status grup sendiri lewat groupStatusMessageV2/isGroupStatus. Fungsi itu sudah terwakili perintah kanonis KANA .upsw (plugins/group/upsw.js, upload story grup), jadi tidak dibuat perintah duplikat. Pembeda RYO dicatat sebagai bahan pemilik .upsw: target grup lain lewat tautan undangan/JID, warna latar status teks, dan anotasi musik tertanam |
| group/totag.js | totag, tag | SUDAH ADA | Nama perintah "totag" terdaftar di registry KANA |
| group/totalchat.js | totalchat | SUDAH ADA | Nama perintah "totalchat" terdaftar di registry KANA |
| group/totalpesan.js | totalpesan | SUDAH ADA | Nama perintah "totalpesan" terdaftar di registry KANA |
| group/tutupjam-bukajam.js | bukajam <jam:menit>, tutupjam <jam:menit>, jadwal, bukajam, tutupjam | SUDAH ADA | Nama perintah "bukajam" terdaftar di registry KANA |
| image/ai-flux.js | flux <prompt>, flux, fluximg, flux-image | KLON | Generate/edit gambar AI: terwakili .aiimg dan keluarga imgstyle KANA |
| image/hd.js | hd | SUDAH ADA | Nama perintah "hd" terdaftar di registry KANA |
| image/hitamkan.js | hitamkan | KLON | Generate/edit gambar AI: terwakili .aiimg dan keluarga imgstyle KANA |
| image/img2img.js | editimg, img2img | KLON | Generate/edit gambar AI: terwakili .aiimg dan keluarga imgstyle KANA |
| image/picsart.js | picsart | KLON | Generate/edit gambar AI: terwakili .aiimg dan keluarga imgstyle KANA |
| image/to3d.js | to3d, toanime, tocyberpunk, todisney, toghibli, tojepang, tolego, tomanga, tooil, topixar, tosketch | SUDAH ADA | Nama perintah "to3d" terdaftar di registry KANA |
| image/toblonde.js | toblonde | SUDAH ADA | Nama perintah "toblonde" terdaftar di registry KANA |
| image/tohitam.js | tobotak, tochibi, tofunk, tofigura, tofigurav2, tofigurav3, toghibli, tohijab, tojapanese, tojepang, tokacamata, tokamboja, tolego, toliquor, tomaid, tomirror, tomoai, tomonyet, topacar, topeci, topiramida, toputih, toreal, toroblox, toroh, totato, totua, toviking, tozombie, tounderground, tohitam | SUDAH ADA | Nama perintah "tochibi" terdaftar di registry KANA |
| info/bmkggempa.js | bmkggempa | SUDAH ADA | Nama perintah "bmkggempa" terdaftar di registry KANA |
| info/donasi.js | donasi | SUDAH ADA | Nama perintah "donasi" terdaftar di registry KANA |
| info/exp-ceksn.js | ceksn | SUDAH ADA | Padanan KANA: .serialnumber |
| info/jadwalbola.js | jadwalbola, bola | SUDAH ADA | Nama perintah "jadwalbola" terdaftar di registry KANA |
| info/jadwalsholat.js | jadwalsholat | SUDAH ADA | Nama perintah "jadwalsholat" terdaftar di registry KANA |
| info/lapor.js | lapor <pesan>, lapor, report | SUDAH ADA | Nama perintah "lapor" terdaftar di registry KANA |
| info/market.js | market | SUDAH ADA | Nama perintah "market" terdaftar di registry KANA |
| info/ping.js | ping, speed | SUDAH ADA | Nama perintah "ping" terdaftar di registry KANA |
| info/rpg-misi.js | misi, misirpg | SUDAH ADA | Nama perintah "misi" terdaftar di registry KANA |
| info/runtime.js | runtime | SUDAH ADA | Nama perintah "runtime" terdaftar di registry KANA |
| info/script.js | sc, script | SUDAH ADA | Nama perintah "sc" terdaftar di registry KANA |
| info/totalfitur.js | totalfitur | SUDAH ADA | Nama perintah "totalfitur" terdaftar di registry KANA |
| info/tqto.js | tqto, thanks, credit, credits | SUDAH ADA | Nama perintah "tqto" terdaftar di registry KANA |
| info/tutorialbot.js | (hook internal) | KLON | Tutorial bot: terwakili .help dan panduan di .menu KANA |
| info/weather.js | weather <city>, weather | SUDAH ADA | Nama perintah "weather" terdaftar di registry KANA |
| internet/alkitab.js | alkitab | SUDAH ADA | Nama perintah "alkitab" terdaftar di registry KANA |
| internet/artinama.js | artinama | SUDAH ADA | Nama perintah "artinama" terdaftar di registry KANA |
| internet/doa.js | doa <kata kunci>, doa | SUDAH ADA | Nama perintah "doa" terdaftar di registry KANA |
| internet/fetch.js | fetch, get | SUDAH ADA | Nama perintah "fetch" terdaftar di registry KANA |
| internet/gimg.js | gimg | KLON | Pencarian gambar: terwakili .gambar KANA (sumber RYO memakai API agregator faa) |
| internet/github-trend.js | githubtrend | SUDAH ADA | Nama perintah "githubtrend" terdaftar di registry KANA |
| internet/infoloker.js | infoloker | SUDAH ADA | Nama perintah "infoloker" terdaftar di registry KANA |
| internet/lirik.js | lyrics <judul>, lyrics, lirik | SUDAH ADA | Nama perintah "lyrics" terdaftar di registry KANA |
| internet/novel-royalroad.js | rrsearch <judul>, rrdetail <url>, rrlatest, rrprofile <url>, rrsearch, detail, latest, profile | SUDAH ADA | Nama perintah "detail" terdaftar di registry KANA |
| internet/pinvideo.js | pinterestvideo, pinvid | SUDAH ADA | Nama perintah "pinvid" terdaftar di registry KANA |
| internet/renungan.js | renungan | SUDAH ADA | Nama perintah "renungan" terdaftar di registry KANA |
| internet/ringtone.js | ringtone <judul>, ringtone | SUDAH ADA | Nama perintah "ringtone" terdaftar di registry KANA |
| internet/roblox.js | toproblox | SUDAH ADA | Nama perintah "toproblox" terdaftar di registry KANA |
| internet/surah.js | surah | SUDAH ADA | Nama perintah "surah" terdaftar di registry KANA |
| internet/tafsir.js | tafsir | SUDAH ADA | Nama perintah "tafsir" terdaftar di registry KANA |
| internet/telegramch.js | tgram <kata kunci>, tgram | SUDAH ADA | Nama perintah "tgram" terdaftar di registry KANA |
| internet/tools-cekweb.js | iplookup <domain>, iplookup | SUDAH ADA | Nama perintah "iplookup" terdaftar di registry KANA |
| internet/uhdpaper.js | uhdpaper <query>, uhdpaper | SUDAH ADA | Nama perintah "uhdpaper" terdaftar di registry KANA |
| internet/wallsearch.js | wallsearch <query>, wallrating <new|popular|top_rated>, wallcat <video|parallax|ai_art|exclusive>, wallsearch, rating, cat | SUDAH ADA | Nama perintah "cat" terdaftar di registry KANA |
| internet/wordltime.js | worldtime, waktuglobal | SUDAH ADA | Nama perintah "worldtime" terdaftar di registry KANA |
| main/@verify.js | @verify | DEFER | Sistem verifikasi lencana ala RYO tidak cocok dengan sistem akun KANA |
| main/afk-afk.js | afk | SUDAH ADA | Nama perintah "afk" terdaftar di registry KANA |
| main/creator.js | owner, infoowner, creator | SUDAH ADA | Nama perintah "owner" terdaftar di registry KANA |
| main/daftar.js | daftar, verify | SUDAH ADA | Nama perintah "daftar" terdaftar di registry KANA |
| main/delbot.js | delbot <nomor>, delbot | DEFER | Penghapusan akun bot ala RYO: KANA memakai mekanisme ban dan deluser sendiri |
| main/exp-unreg.js | ,  | SUDAH ADA | Padanan KANA: .unreg |
| main/fun-jadian.js | jadian | SUDAH ADA | Nama perintah "jadian" terdaftar di registry KANA |
| main/jadibot.js | jadibot <nomor>, jadibot | SUDAH ADA | Nama perintah "jadibot" terdaftar di registry KANA |
| main/levelup.js | levelup | SUDAH ADA | Nama perintah "levelup" terdaftar di registry KANA |
| main/limit.js | limit | SUDAH ADA | Nama perintah "limit" terdaftar di registry KANA |
| main/menu.js | menu, help | SUDAH ADA | Nama perintah "menu" terdaftar di registry KANA |
| main/order.js | sewa, premium | SUDAH ADA | Nama perintah "sewa" terdaftar di registry KANA |
| main/profile.js | profile, profil, me | SUDAH ADA | Nama perintah "profile" terdaftar di registry KANA |
| maker/bratbahlil.js | bahlil, bratbahlil | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| maker/bratspongebob.js | bratspongebob, bratsbb | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| maker/cewekbrat.js | cewekbrat <teks>, cewekbrat | SUDAH ADA | Nama perintah "cewekbrat" terdaftar di registry KANA |
| maker/codesnap.js | codesnap <code>, codesnap | SUDAH ADA | Nama perintah "codesnap" terdaftar di registry KANA |
| maker/ephoto.js | 1917style, advancedglow, amongustext, blackpinklogo, blackpinkstyle, cartoonstyle, deletingtext, effectclouds, flag3dtext, flagtext, freecreate, galaxystyle, galaxywallpaper, glitchtext, glowingtext, gradienttext, lighteffects, logomaker, luxurygold, makingneon, multicoloredneon, neonglitch, papercutstyle, pixelglitch, rainytext, royaltext, sandsummer, summerbeach, typographytext, underwatertext, watercolortext | SUDAH ADA | Nama perintah "watercolortext" terdaftar di registry KANA |
| maker/fakebca.js | fakebca | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakecall.js | fakecall | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakedana.js | fakedana <nominal>, fakedana, fakedan | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakediscoard.js | fdc, fakediscoard | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakeff.js | fakeff, fflobby | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakegc.js | fakegc <Nama | Anggota>, fakegc, fakegrup | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakeml.js | fakeml <nickname>, fakeml | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakeovo.js | fakeovo | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/fakestory.js | fakestory | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/faketiktok.js | faketiktok | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/faketweet.js | faketweet | SUDAH ADA | Nama perintah "faketweet" terdaftar di registry KANA |
| maker/fakewafat.js | fakewafat | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/ffduo.js | fakeffduo | TOLAK | Dokumen/bukti palsu: dilarang batas keras proyek dan daftar larangan DECISIONS |
| maker/hotline.js | hotline teks|teks, hotline | SUDAH ADA | Nama perintah "hotline" terdaftar di registry KANA |
| maker/iqc.js | iqc | SUDAH ADA | Nama perintah "iqc" terdaftar di registry KANA |
| maker/iqc2.js | iqc2 | KLON | Varian style .iqc KANA |
| maker/iqcpink.js | iqc3, iqcpink | SUDAH ADA | Nama perintah "iqcpink" terdaftar di registry KANA |
| maker/iqcv2.js | iqcv2 | KLON | Varian style .iqc KANA |
| maker/meledak.js | meledak | DEFER | Efek gambar meledak: sumber dan mekanik belum diverifikasi pada giliran ini |
| maker/nulis.js | nulis | SUDAH ADA | Nama perintah "nulis" terdaftar di registry KANA |
| maker/sertifikatcinta.js | sertifikatcinta <nama>, sertifikatcinta | SUDAH ADA | Nama perintah "sertifikatcinta" terdaftar di registry KANA |
| maker/sertifikatlemot.js | sertifikatlemot <nama>, sertifikatlemot | SUDAH ADA | Nama perintah "sertifikatlemot" terdaftar di registry KANA |
| maker/spotifycard.js | spotifycard | SUDAH ADA | Padanan KANA: .musiccard |
| maker/sticker-brat2.js | bratcanvas <teks>, bratc, bratcanvas | SUDAH ADA | Padanan KANA: .brat (mesin brat-canvas yang sama) |
| maker/typograpy.js | typogaleri2 judul|tempat (reply video/foto), typogaleri2, typogaleri, tg2 | DEFER | Galeri tipografi dari video: sumber belum terverifikasi |
| maker/wq.js | wq <text>, wq | KLON | Pembuat kutipan chat: padanan fungsi .qc dan maker kutipan KANA |
| nsfw/videobkp.js | videobkp | TOLAK | Dinilai ulang 2026-11-05: satu-satunya sumber adalah daftar video koleksi repo GitHub "Asupan" (13 URL video Blogger bertoken), yaitu konten asupan/bocoran yang tidak bisa diverifikasi konsensual. Tetap ditolak walau owner memerintahkan port NSFW dewasa |
| nsfw/waifu.js | waifunsfw, hentai, oppai, milf | PORT PREMIUM | Diport perintah owner 2026-11-05 sebagai .waifu18 (alias waifunsfw), .hentai, .oppai, .milf premium. Sumber RYO api.waifu.im mati dari VM, diganti NekosAPI + Konachan tersaring (src/scrapers/nsfw/adult-image.js) |
| nsfw/xnxx.js | xnxx | PORT PREMIUM | Diport perintah owner 2026-11-05 sebagai .xnxxsearch premium (plugins/nsfw/xnxxsearch.js ditulis ulang total, alias xnxx), scraper langsung xnxx.com tanpa proksi CORS RYO (src/scrapers/xnxx/xnxx.js) |
| owner/addlimit.js | addlimit @user <jumlah>, addlimit nomor <jumlah> | SUDAH ADA | Padanan KANA: .addlimit |
| owner/addowner.js | addowner <nomor>, addowner | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/addprem.js | addprem, delprem, add, tambah, del, hapus | SUDAH ADA | Nama perintah "addprem" terdaftar di registry KANA |
| owner/autotyping.js | autotyping | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/backup.js | backup | SUDAH ADA | Nama perintah "backup" terdaftar di registry KANA |
| owner/banchat.js | banchat, bnc | SUDAH ADA | Nama perintah "banchat" terdaftar di registry KANA |
| owner/banchat2.js | banchat2 | KLON | Terwakili .banchat KANA |
| owner/banuser.js | ban | SUDAH ADA | Nama perintah "ban" terdaftar di registry KANA |
| owner/broadcast.js | broadcast <teks>, bcgc, broadcast | SUDAH ADA | Nama perintah "broadcast" terdaftar di registry KANA |
| owner/broadcastgc.js | bcgc <teks>, bcgc, broadcast | SUDAH ADA | Nama perintah "bcgc" terdaftar di registry KANA |
| owner/cariplugin.js | cariplugin, grepplugin, cari | SUDAH ADA | Nama perintah "grepplugin" terdaftar di registry KANA |
| owner/cekeror.js | checkerror, cekeror | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/cheat.js | own-cheat, cheat-own, o-cheat, cit | KLON | Alat curang owner untuk RPG: terwakili alat owner KANA (addkoin, addexp, dan sejenisnya) |
| owner/cleartmp.js | cleartmp, cleantmp, cleartemp | SUDAH ADA | Nama perintah "cleartmp" terdaftar di registry KANA |
| owner/dashboard.js | dashboard, topcmd, dash, cmdstats | SUDAH ADA | Nama perintah "dashboard" terdaftar di registry KANA |
| owner/delplugin.js | deleteplugin <namafile>, deleteplugin, delplugin, df | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/deluser.js | deleteuser | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/exec.js | (hook internal) | TOLAK | Eval/exec terbuka: dilarang DECISIONS |
| owner/exec2.js | eval | SUDAH ADA | Nama perintah "eval" terdaftar di registry KANA |
| owner/exec3.js | > , =>  | DEFER | Belum diport pada giliran ini |
| owner/getdb.js | getdb | TOLAK | Mengirim isi database dan berkas sesi bot ke chat: paparan data internal dan kredensial sesi |
| owner/gp.js | getplugin <folder/filename>, getplugin, gp | SUDAH ADA | Nama perintah "getplugin" terdaftar di registry KANA |
| owner/join.js | join | SUDAH ADA | Nama perintah "join" terdaftar di registry KANA |
| owner/leavegc.js | leavegc, out | SUDAH ADA | Nama perintah "leavegc" terdaftar di registry KANA |
| owner/listbanchat.js | listbanchat | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/listch.js | listch | SUDAH ADA | Nama perintah "listch" terdaftar di registry KANA |
| owner/listgc.js | listgc | SUDAH ADA | Nama perintah "listgc" terdaftar di registry KANA |
| owner/listjadibot.js | listbot | SUDAH ADA | Nama perintah "listbot" terdaftar di registry KANA |
| owner/listown.js | listowner | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/listpc.js | listpc | SUDAH ADA | Nama perintah "listpc" terdaftar di registry KANA |
| owner/listplugin.js | listplugin, lp, plugins | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/listprem.js | listprem, premium | SUDAH ADA | Nama perintah "listprem" terdaftar di registry KANA |
| owner/msgch.js | msgch | DEFER | Kirim konten ke channel WhatsApp oleh owner: belum diadopsi KANA dan rawan spam bila longgar |
| owner/mutegc.js | mutegc, unmutegc | KLON | Terwakili .mute dan .unmute KANA |
| owner/playch.js | playch | SUDAH ADA | Nama perintah "playch" terdaftar di registry KANA |
| owner/pluginbaru.js | newplugin, pluginbaru, np | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/promote.js | opromote @tag, opromote | SUDAH ADA | Nama perintah "opromote" terdaftar di registry KANA |
| owner/ptvch.js | ptvch | DEFER | Kirim konten ke channel WhatsApp oleh owner: belum diadopsi KANA dan rawan spam bila longgar |
| owner/q.js | q | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/resetchat.js | resetchat | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/resetlimit.js | limit, resetlimit | SUDAH ADA | Nama perintah "limit" terdaftar di registry KANA |
| owner/restart.js | restart, reboot | SUDAH ADA | Nama perintah "restart" terdaftar di registry KANA |
| owner/rf.js | rf, renamefile, f | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/rm.js | rm | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/rpg-addexp.js | addexp @user/nomor jumlah, addexp | SUDAH ADA | Nama perintah "addexp" terdaftar di registry KANA |
| owner/rpg-addmoney.js | addrpg <field> @user <jumlah>, addrpg | SUDAH ADA | Nama perintah "addrpg" terdaftar di registry KANA |
| owner/rpg-deps.js | deps | SUDAH ADA | Nama perintah "deps" terdaftar di registry KANA |
| owner/savescrape.js | savescrape | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/self-public.js | self, public | KLON | Mode self/public bot: terwakili pengaturan mode di settings KANA |
| owner/sesi.js | getsession | TOLAK | Mengirim isi database dan berkas sesi bot ke chat: paparan data internal dan kredensial sesi |
| owner/setaudio.js | setaudio | SUDAH ADA | Nama perintah "setaudio" terdaftar di registry KANA |
| owner/setbio.js | setbio | SUDAH ADA | Nama perintah "setbio" terdaftar di registry KANA |
| owner/setcmd.js | setcmd <teks>, delcmd, listcmd, lockcmd, unlockcmd, setcmd | SUDAH ADA | Nama perintah "listcmd" terdaftar di registry KANA |
| owner/setmenu.js | setmenu <1/2/3>, setmenu | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/setppbot.js | setppbot | SUDAH ADA | Nama perintah "setppbot" terdaftar di registry KANA |
| owner/setprefix.js | setprefix, setpref | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/setthumb.js | setthumb | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/setthumbmenu.js | setthumbmenu | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/setwelcomebg.js | setwelcomebg, setbgwelcome | DEFER | Konfigurasi owner seperti ini dikelola KANA lewat env dan berkas konfigurasi, bukan perintah chat |
| owner/sewa.js | ceksewa, delsewa, listsewa, setsewa | SUDAH ADA | Nama perintah "ceksewa" terdaftar di registry KANA |
| owner/sf.js | saveplugin <folder/filename>, sf, saveplugin, sp | TOLAK | Menulis/menghapus file plugin dan skrip arbitrer dari chat: permukaan eksekusi kode, dilarang pola eval/exec terbuka di DECISIONS |
| owner/simulate.js | simulate, simulasi | DEFER | Belum diport pada giliran ini; sebagian padanannya ada di perangkat owner KANA (searchplugin, daftar ban, dan sejenisnya) |
| owner/tagall.js | o-tagall | DEFER | Kirim konten ke channel WhatsApp oleh owner: belum diadopsi KANA dan rawan spam bila longgar |
| owner/tool-uppastebin.js | up-pb, uppastebin | SUDAH ADA | Nama perintah "up-pb" terdaftar di registry KANA |
| owner/unbanchat.js | unbanchat, ubnc | SUDAH ADA | Nama perintah "unbanchat" terdaftar di registry KANA |
| owner/unbanchat2.js | unbanchat2 | KLON | Terwakili .banchat KANA |
| owner/unbanuser.js | unban | SUDAH ADA | Nama perintah "unban" terdaftar di registry KANA |
| owner/upch.js | upch <caption>, upch | DEFER | Kirim konten ke channel WhatsApp oleh owner: belum diadopsi KANA dan rawan spam bila longgar |
| owner/upstik.js | upstik, stickch | DEFER | Kirim konten ke channel WhatsApp oleh owner: belum diadopsi KANA dan rawan spam bila longgar |
| panel/cadmin.js | cadmin | TOLAK | Jualan/pengelolaan panel server (Pterodactyl): kategori panel dilarang DECISIONS |
| panel/cpanel.js | 1gb, 2gb, 3gb, 4gb, 5gb, 6gb, 7gb, 8gb, 9gb, 10gb, unlimited, unli | TOLAK | Jualan/pengelolaan panel server (Pterodactyl): kategori panel dilarang DECISIONS |
| panel/deladmin.js | deladmin <id_user_admin>, deladmin | TOLAK | Jualan/pengelolaan panel server (Pterodactyl): kategori panel dilarang DECISIONS |
| panel/delpanel.js | delpanel | TOLAK | Jualan/pengelolaan panel server (Pterodactyl): kategori panel dilarang DECISIONS |
| panel/listadmin.js | listadmin | SUDAH ADA | Nama perintah "listadmin" terdaftar di registry KANA |
| panel/listpanel.js | listpanel, listp, listserver | TOLAK | Jualan/pengelolaan panel server (Pterodactyl): kategori panel dilarang DECISIONS |
| quotes/bacot.js | bacot | SUDAH ADA | Nama perintah "bacot" terdaftar di registry KANA |
| quotes/bucin.js | quotebucin | SUDAH ADA | Padanan KANA: .bucin |
| quotes/dare.js | dare | SUDAH ADA | Nama perintah "dare" terdaftar di registry KANA |
| quotes/islam-murotal.js | murothal | SUDAH ADA | Nama perintah "murothal" terdaftar di registry KANA |
| quotes/islam.js | q-islam | SUDAH ADA | Nama perintah "q-islam" terdaftar di registry KANA |
| quotes/pantun.js | pantun | SUDAH ADA | Nama perintah "pantun" terdaftar di registry KANA |
| quotes/pantun2.js | pantun2 | KLON | Terwakili .pantun KANA |
| quotes/sadboy.js | sadboy | SUDAH ADA | Nama perintah "sadboy" terdaftar di registry KANA |
| quotes/truth.js | truth | SUDAH ADA | Nama perintah "truth" terdaftar di registry KANA |
| quran/asmaulhusna.js | (hook internal) | SUDAH ADA | Padanan KANA: .asmaulhusna (kategori islamic) |
| quran/ayat-kursi.js | ayatkursi | SUDAH ADA | Nama perintah "ayatkursi" terdaftar di registry KANA |
| quran/islam-kisahnabi.js | kisahnabi <name>, kisahnabi | SUDAH ADA | Nama perintah "kisahnabi" terdaftar di registry KANA |
| random/asupan.js | asupan | TOLAK | Konten asupan: dilarang DECISIONS |
| random/cecanchina.js | cecanchina | SUDAH ADA | Nama perintah "cecanchina" terdaftar di registry KANA |
| random/cecanindo.js | cecanindo | SUDAH ADA | Nama perintah "cecanindo" terdaftar di registry KANA |
| random/cecanjapan.js | cecanjapan | SUDAH ADA | Nama perintah "cecanjapan" terdaftar di registry KANA |
| random/cecankorea.js | cecankorea | SUDAH ADA | Nama perintah "cecankorea" terdaftar di registry KANA |
| random/cecanthailand.js | cecanthai | SUDAH ADA | Nama perintah "cecanthai" terdaftar di registry KANA |
| random/cecanvietnam.js | cecanvietnam | SUDAH ADA | Nama perintah "cecanvietnam" terdaftar di registry KANA |
| random/meme.js | meme | SUDAH ADA | Nama perintah "meme" terdaftar di registry KANA |
| random/memespongbob.js | memespongbob, spongebob | SUDAH ADA | Nama perintah "spongebob" terdaftar di registry KANA |
| random/papayang.js | papayang | TOLAK | Konten asupan: dilarang DECISIONS |
| random/ppcp.js | ppcp, ppcouple | SUDAH ADA | Nama perintah "ppcp" terdaftar di registry KANA |
| random/stiker-nekopack.js | smug, woof, gasm, 8ball, goose, cuddle, avatar, slap, v3, pat, gecg, feed, fox_girl, lizard, neko, hug, meow, kiss, wallpaper, tickle, spank, waifu, lewd, ngif | SUDAH ADA | Nama perintah "smug" terdaftar di registry KANA |
| rpg/adventure.js | petualang, adventure | SUDAH ADA | Nama perintah "petualang" terdaftar di registry KANA |
| rpg/airdrop.js | airdrop | SUDAH ADA | Nama perintah "airdrop" terdaftar di registry KANA |
| rpg/akuntt.js | akuntt, akuntiktok, akuntiktokprofile | SUDAH ADA | Nama perintah "akuntiktok" terdaftar di registry KANA |
| rpg/akunyt.js | akunyt | SUDAH ADA | Nama perintah "akunyt" terdaftar di registry KANA |
| rpg/atm.js | atm, atmall | SUDAH ADA | Nama perintah "atm" terdaftar di registry KANA |
| rpg/bank-nabung.js | nabung, nabungall | SUDAH ADA | Nama perintah "nabung" terdaftar di registry KANA |
| rpg/bank.js | bank | SUDAH ADA | Nama perintah "bank" terdaftar di registry KANA |
| rpg/bankcek.js | bankcek | SUDAH ADA | Nama perintah "bankcek" terdaftar di registry KANA |
| rpg/banktarik.js | tarik, tarikall | SUDAH ADA | Nama perintah "tarik" terdaftar di registry KANA |
| rpg/bansos.js | korupsi, bansos | SUDAH ADA | Nama perintah "korupsi" terdaftar di registry KANA |
| rpg/berburu.js | berburu, hunt | SUDAH ADA | Nama perintah "berburu" terdaftar di registry KANA |
| rpg/berdagang.js | berdagang | SUDAH ADA | Nama perintah "berdagang" terdaftar di registry KANA |
| rpg/berkebun.js | berkebun, berkebon | SUDAH ADA | Nama perintah "berkebon" terdaftar di registry KANA |
| rpg/bossbattle.js | bossbattle | SUDAH ADA | Nama perintah "bossbattle" terdaftar di registry KANA |
| rpg/buah.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/buy.js | buy, sell | SUDAH ADA | Nama perintah "buy" terdaftar di registry KANA |
| rpg/cafe.js | cafemenu, cafeopen, cafeupgrade, cafestock, cafeadd, caferename, cafelist | SUDAH ADA | Nama perintah "cafemenu" terdaftar di registry KANA |
| rpg/casino.js | casino | SUDAH ADA | Nama perintah "casino" terdaftar di registry KANA |
| rpg/ceklevel.js | ceklvl | SUDAH ADA | Padanan KANA: .level |
| rpg/claim.js | claim | SUDAH ADA | Nama perintah "claim" terdaftar di registry KANA |
| rpg/collect.js | collect | SUDAH ADA | Nama perintah "collect" terdaftar di registry KANA |
| rpg/craft.js | craft, crafting, chant | SUDAH ADA | Nama perintah "craft" terdaftar di registry KANA |
| rpg/createakunyt.js | createakun | SUDAH ADA | Nama perintah "createakun" terdaftar di registry KANA |
| rpg/creatett.js | creatett <username>, creatett | SUDAH ADA | Nama perintah "creatett" terdaftar di registry KANA |
| rpg/duel.js | duel, gass, skip | SUDAH ADA | Nama perintah "duel" terdaftar di registry KANA |
| rpg/dungeon.js | dungeon | SUDAH ADA | Nama perintah "dungeon" terdaftar di registry KANA |
| rpg/ewe.js | ewe, anu | TOLAK | Fitur RPG seksual: dilarang |
| rpg/ewepaksa.js | ewepapksa @tag, ewepaksa, perkosa | TOLAK | Fitur RPG seksual: dilarang |
| rpg/fightnaga.js | fightnaga | SUDAH ADA | Nama perintah "fightnaga" terdaftar di registry KANA |
| rpg/freelimit.js | freelimit | SUDAH ADA | Nama perintah "freelimit" terdaftar di registry KANA |
| rpg/gajian.js | gajian, gaji | SUDAH ADA | Nama perintah "gajian" terdaftar di registry KANA |
| rpg/grab.js | grab, taksi, taxy, megrab | SUDAH ADA | Nama perintah "taksi" terdaftar di registry KANA |
| rpg/heal.js | heal | SUDAH ADA | Nama perintah "heal" terdaftar di registry KANA |
| rpg/hero.js | hero | SUDAH ADA | Nama perintah "hero" terdaftar di registry KANA |
| rpg/hitman.js | bunuh, hitman | SUDAH ADA | Nama perintah "bunuh" terdaftar di registry KANA |
| rpg/hunt.js | hunt | SUDAH ADA | Nama perintah "hunt" terdaftar di registry KANA |
| rpg/huntzone.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/inventory.js | inv, inventory | SUDAH ADA | Nama perintah "inv" terdaftar di registry KANA |
| rpg/jadian.js | tembak @tag, terima, tolak, putus, pasangan, tembak | SUDAH ADA | Nama perintah "tembak" terdaftar di registry KANA |
| rpg/jual.js | jual <item> <jumlah>, jual | SUDAH ADA | Nama perintah "jual" terdaftar di registry KANA |
| rpg/judibola.js | (hook internal) | DEFER | Judi bola virtual: belum diport; keluarga judi KANA memakai koin virtual yang sudah ada |
| rpg/kandang.js | kandang | SUDAH ADA | Nama perintah "kandang" terdaftar di registry KANA |
| rpg/karung.js | karung | SUDAH ADA | Nama perintah "karung" terdaftar di registry KANA |
| rpg/kerja.js | kerja | SUDAH ADA | Nama perintah "kerja" terdaftar di registry KANA |
| rpg/koboy.js | koboy | SUDAH ADA | Nama perintah "koboy" terdaftar di registry KANA |
| rpg/koin.js | putarkoin | SUDAH ADA | Padanan KANA: .lemparkoin |
| rpg/leaderboard.js | lb <type>, leaderboard, lb | SUDAH ADA | Nama perintah "lb" terdaftar di registry KANA |
| rpg/livett.js | livett <judul>, livett | SUDAH ADA | Nama perintah "livett" terdaftar di registry KANA |
| rpg/maling.js | maling | SUDAH ADA | Nama perintah "maling" terdaftar di registry KANA |
| rpg/mancing.js | mancing, fishing, memancing | SUDAH ADA | Nama perintah "mancing" terdaftar di registry KANA |
| rpg/marketplace.js | 7eleven, foodshop, marketstall, buyfood <item> <jumlah>, buyfood | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/masak.js | masak, cook | SUDAH ADA | Nama perintah "masak" terdaftar di registry KANA |
| rpg/membunuh.js | membunuh *@tag*, membunuh | SUDAH ADA | Nama perintah "membunuh" terdaftar di registry KANA |
| rpg/merampok.js | merampok @tag, merampok | SUDAH ADA | Nama perintah "merampok" terdaftar di registry KANA |
| rpg/minecraftbattle.js | minecraftbattle | SUDAH ADA | Nama perintah "minecraftbattle" terdaftar di registry KANA |
| rpg/mining.js | mining | SUDAH ADA | Nama perintah "mining" terdaftar di registry KANA |
| rpg/monthly.js | monthly | SUDAH ADA | Nama perintah "monthly" terdaftar di registry KANA |
| rpg/mulai.js | mulai | SUDAH ADA | Nama perintah "mulai" terdaftar di registry KANA |
| rpg/mulung.js | mulung | SUDAH ADA | Nama perintah "mulung" terdaftar di registry KANA |
| rpg/open.js | open, buka, gacha | SUDAH ADA | Nama perintah "open" terdaftar di registry KANA |
| rpg/pasar.js | pasar <jual> <args>, pasar, jual | SUDAH ADA | Nama perintah "jual" terdaftar di registry KANA |
| rpg/pelabuhan.js | pelabuhan <command>, pelabuhan | SUDAH ADA | Nama perintah "pelabuhan" terdaftar di registry KANA |
| rpg/penjara.js | penjara @tag, kabur, statuspenjara, penjara | SUDAH ADA | Nama perintah "penjara" terdaftar di registry KANA |
| rpg/petshop.js | petshop | SUDAH ADA | Nama perintah "petshop" terdaftar di registry KANA |
| rpg/petualanganpremium.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/phonix.js | fightphonix | SUDAH ADA | Nama perintah "fightphonix" terdaftar di registry KANA |
| rpg/pointxp.js | expoint | SUDAH ADA | Nama perintah "expoint" terdaftar di registry KANA |
| rpg/polisi.js | polisi, polisi cari, polisi status, polisi item <item>, polisi leaderboard, polisi stop | SUDAH ADA | Nama perintah "polisi" terdaftar di registry KANA |
| rpg/quest.js | quest, quest claim | SUDAH ADA | Nama perintah "quest" terdaftar di registry KANA |
| rpg/racing.js | (hook internal) | DEFER | Game balap dan sepak bola RPG: belum diport pada giliran ini, engine RPG KANA sudah luas |
| rpg/ramuan.js | ramuan | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/reedem.js | reedem <kode>, reedem | SUDAH ADA | Nama perintah "reedem" terdaftar di registry KANA |
| rpg/resetbansos.js | resetbansos <nomor>, resetbansos | SUDAH ADA | Nama perintah "resetbansos" terdaftar di registry KANA |
| rpg/roket.js | roket, ngroket, groket, jadiroket | SUDAH ADA | Nama perintah "roket" terdaftar di registry KANA |
| rpg/role.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/romawi.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/rpg.js | dungeon, dg | SUDAH ADA | Nama perintah "dungeon" terdaftar di registry KANA |
| rpg/sawer.js | sawer, nyawer | SUDAH ADA | Nama perintah "sawer" terdaftar di registry KANA |
| rpg/shop.js | buy, sell | SUDAH ADA | Nama perintah "buy" terdaftar di registry KANA |
| rpg/simulator.js | simulator | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/skill.js | skill | SUDAH ADA | Nama perintah "skill" terdaftar di registry KANA |
| rpg/slot.js | slot, jackpot | SUDAH ADA | Nama perintah "slot" terdaftar di registry KANA |
| rpg/soccer.js | (hook internal) | DEFER | Game balap dan sepak bola RPG: belum diport pada giliran ini, engine RPG KANA sudah luas |
| rpg/survival.js | survival, sv | SUDAH ADA | Nama perintah "survival" terdaftar di registry KANA |
| rpg/taxy.js | taxy | SUDAH ADA | Nama perintah "taxy" terdaftar di registry KANA |
| rpg/transfer.js | tf <item> <jumlah> @user, tf, transfer | SUDAH ADA | Nama perintah "tf" terdaftar di registry KANA |
| rpg/upgrade.js | upgrade, up | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| rpg/warnet.js | (hook internal) | KLON | Fungsi ekonomi/RPG yang terwakili engine RPG dan toko KANA |
| search/applemusic.js | applemusicsearch | SUDAH ADA | Padanan KANA: .applemusic |
| search/carigrup.js | carigrup <keyword1,keyword2>, carigrup | SUDAH ADA | Nama perintah "carigrup" terdaftar di registry KANA |
| search/douyinsearch.js | douyinsearch <query>, douyinsearch | DEFER | Pencarian Douyin lewat API nexray: belum terverifikasi; padanan unduhnya (.douyindl) sudah ada |
| search/jobstreetsearch.js | jobstreetsearch | KLON | Terwakili .infoloker KANA |
| search/kodepos.js | kodepos <query>, kodepos | SUDAH ADA | Nama perintah "kodepos" terdaftar di registry KANA |
| search/npmjs.js | npmjs | SUDAH ADA | Nama perintah "npmjs" terdaftar di registry KANA |
| search/pinterest.js | pinterest <query>, pinterest, pin | SUDAH ADA | Nama perintah "pinterest" terdaftar di registry KANA |
| search/pinterest2.js | pinterest2 <query>, pin2, pinterest2 | KLON | Terwakili .pinterest KANA (sumber RYO memakai API nexray) |
| search/resep.js | resep | SUDAH ADA | Nama perintah "resep" terdaftar di registry KANA |
| search/sekolah.js | sekolah <nama>, sekolah, carisekolah | DEFER | API resmi Kemdikbud tidak terjangkau dari VM (HTTP 000) dan sumber RYO memakai API agregator kyzzz yang tidak sesuai aturan scraper proyek; belum diport |
| search/soundmeme.js | soundmeme-listnama nama, soundmeme-random, soundmeme-search nama, soundmeme2 | SUDAH ADA | Nama perintah "soundmeme2" terdaftar di registry KANA |
| search/spotify.js | spotifysearch <query>, spotifysearch, spotifys, spsearch | SUDAH ADA | Nama perintah "spotifysearch" terdaftar di registry KANA |
| search/tiktok.js | ttsearch, tiktoksearch | SUDAH ADA | Nama perintah "ttsearch" terdaftar di registry KANA |
| search/webton.js | webtoonsearch <judul>, webtoonsearch | SUDAH ADA | Nama perintah "webtoonsearch" terdaftar di registry KANA |
| search/yts.js | yts, youtubesearch | SUDAH ADA | Nama perintah "yts" terdaftar di registry KANA |
| sound/mangkane.js | mangkane <1-54>, mangkane | KLON | Koleksi bunyi meme statis dari repo GitHub pihak ketiga: terwakili .soundmeme KANA; daftar berkas pihak ketiga tidak disalin |
| sound/music.js | music <1-65>, music | SUDAH ADA | Nama perintah "music" terdaftar di registry KANA |
| sound/playncs.js | playncs, ncssearch, ncsplay | SUDAH ADA | Nama perintah "playncs" terdaftar di registry KANA |
| sound/sad.js | sad <nomor>, sad | SUDAH ADA | Nama perintah "sad" terdaftar di registry KANA |
| sound/sound.js | sound <1-119>, sound | KLON | Koleksi bunyi meme statis dari repo GitHub pihak ketiga: terwakili .soundmeme KANA; daftar berkas pihak ketiga tidak disalin |
| stalk/cekdmganda.js | cekdmganda <uid> <zone>, cekdmganda, cekdm, dmganda | DEFER | Cek harga diamond Mobile Legends lewat pihak ketiga: sumber belum terverifikasi |
| stalk/ff.js | ffstalk <uid>, ffstalk, freefire, ff | SUDAH ADA | Nama perintah "ffstalk" terdaftar di registry KANA |
| stalk/github.js | ghstalk | SUDAH ADA | Padanan KANA: .githubstalk |
| stalk/jkt.js | jktstalk | DEFER | Stalk JKT48: sumber belum terverifikasi pada giliran ini |
| stalk/ml.js | mlstalk <userId> <zoneId>, mlstalk | SUDAH ADA | Nama perintah "mlstalk" terdaftar di registry KANA |
| stalk/pinterest.js | pintereststalk <username>, pintereststalk, pinstalk, pstalk | SUDAH ADA | Nama perintah "pintereststalk" terdaftar di registry KANA |
| stalk/roblox.js | robloxstalk <username>, robloxstalk | SUDAH ADA | Nama perintah "robloxstalk" terdaftar di registry KANA |
| stalk/sanckvideo.js | snackvideostalk <username>, snackvideostalk, snackstalk, snackvideo | SUDAH ADA | Nama perintah "snackvideo" terdaftar di registry KANA |
| stalk/threadsstalk.js | threadsstalk <username>, threadsstalk, threadstalk | DEFER | Plugin threads KANA sedang dinonaktifkan, jadi stalk Threads ditunda mengikuti status itu |
| stalk/ttstalk.js | ttstalk <username>, ttstalk | SUDAH ADA | Padanan KANA: .tiktokstalk |
| stalk/twitter.js | twitterstalk <username>, twitterstalk, twitter, xstalk | SUDAH ADA | Nama perintah "twitterstalk" terdaftar di registry KANA |
| stalk/wa.js | wastalk, wa, whatsappstalk | PORT BARU | Dinilai ulang per mekanisme 2026-11-05 atas perintah owner: isinya hanya data PUBLIK profil WhatsApp (cek terdaftar onWhatsApp, foto profil profilePictureUrl, teks about fetchStatus, profil bisnis publik getBusinessProfile), sekelas .igstalk, bukan data registrasi non-publik dan bukan mengambil story orang. DIPORT gaya KANA sebagai .wastalk (plugins/search/wastalk.js + src/services/wa-profile.js, 11 tes di test/wastalk-port.test.js). DECISIONS melarang stalking NON-publik; yang ini publik. Vonis live menunggu jendela tes chat utama |
| stalk/yt.js | ytstalk, youtubestalk | SUDAH ADA | Nama perintah "ytstalk" terdaftar di registry KANA |
| sticker/animebrat.js | animebrat | SUDAH ADA | Nama perintah "animebrat" terdaftar di registry KANA |
| sticker/animebratvid.js | animebratvid <teks>, animebratvid, bratanimvid, bratanimevid | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/attp.js | ttp, attp | SUDAH ADA | Nama perintah "ttp" terdaftar di registry KANA |
| sticker/brat.js | brat <text>, brat | SUDAH ADA | Nama perintah "brat" terdaftar di registry KANA |
| sticker/bratanime.js | bratanime | SUDAH ADA | Nama perintah "bratanime" terdaftar di registry KANA |
| sticker/bratcolor.js | (hook internal) | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/bratgojo.js | bratgojo <teks>, bratgojo | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/bratgojovid.js | bratgojovid <teks>, bratgojovid | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/brathd.js | brathd <teks>, brathd | SUDAH ADA | Nama perintah "brathd" terdaftar di registry KANA |
| sticker/bratimg.js | bratimg | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/bratvid.js | bratvid <teks>, bratvid | SUDAH ADA | Nama perintah "bratvid" terdaftar di registry KANA |
| sticker/bratvid2.js | bratvid2, bratgif2 | KLON | Varian style dari mesin .brat KANA (satu plugin, banyak style) |
| sticker/emojigif.js | emojigif <emoji>, emojigif | KLON | Varian stiker yang terwakili katalog stiker KANA |
| sticker/emojimix.js | emojimix, emix | SUDAH ADA | Nama perintah "emojimix" terdaftar di registry KANA |
| sticker/emojistick.js | emojistick <emoji>, emojistick | PORT BARU | Diport jadi .emojistick; sumber gambar diganti Noto gstatic + Twemoji karena URL pola RYO terbukti 404 (src/services/emoji-image.js + plugins/sticker/emojistick.js) |
| sticker/jarvis.js | jarvis <teks>, jarvis | SUDAH ADA | Nama perintah "jarvis" terdaftar di registry KANA |
| sticker/meme.js | smeme | SUDAH ADA | Nama perintah "smeme" terdaftar di registry KANA |
| sticker/qc.js | qc | SUDAH ADA | Nama perintah "qc" terdaftar di registry KANA |
| sticker/search.js | stickersearch <query>, stickersearch | KLON | Varian stiker yang terwakili katalog stiker KANA |
| sticker/sprem.js | sprem, stickerprem, spremium | KLON | Varian stiker yang terwakili katalog stiker KANA |
| sticker/sticker.js | sticker | SUDAH ADA | Nama perintah "sticker" terdaftar di registry KANA |
| sticker/stickerly.js | stickerly | KLON | Varian stiker yang terwakili katalog stiker KANA |
| sticker/telegram.js | telestick | KLON | Varian stiker yang terwakili katalog stiker KANA |
| sticker/toimg.js | toimg, toimage | SUDAH ADA | Nama perintah "toimg" terdaftar di registry KANA |
| sticker/tovideo.js | tovideo, tovid | SUDAH ADA | Nama perintah "tovideo" terdaftar di registry KANA |
| sticker/wm.js | wm <packname>|<author>, wm | KLON | Varian stiker yang terwakili katalog stiker KANA |
| store/addlist.js | addlist, list, dellist | SUDAH ADA | Nama perintah "addlist" terdaftar di registry KANA |
| store/done.js | done <barang,harga,pembayaran>, done | SUDAH ADA | Nama perintah "done" terdaftar di registry KANA |
| store/payment.js | pay, addpay, delpay, listpay | DEFER | Sistem pembayaran toko ala RYO: KANA memakai sistem premium dan QRIS owner sendiri, bukan pengelola metode bayar generik |
| tools/am.js | amprem <email>, amprem <email>|<link>, amv2, ampremium | TOLAK | Aktivator premium Alight Motion: bypass layanan berbayar (preseden penolakan SNIPPETS untuk keluarga yang sama) |
| tools/ascii.js | imagetoasci, imgascii, ascii | SUDAH ADA | Nama perintah "imagetoasci" terdaftar di registry KANA |
| tools/breach.js | breach <email>, breach | DEFER | Cek kebocoran data per email menyentuh data pribadi: perlu keputusan owner sebelum diport |
| tools/bypass.js | bypass <url>, bypass | TOLAK | Alat bypass tautan/layanan pihak ketiga: dilarang |
| tools/calc.js | calc <expression>, calculate | SUDAH ADA | Padanan KANA: .kalkulator |
| tools/catbox.js | catbox | KLON | Fungsi unggah berkas: terwakili .upload hasil port; host catbox tidak terjangkau dari VM (litterbox HTTP 000) sehingga uguu yang terverifikasi yang dipakai |
| tools/ccgen.js | ccgen <type> <jumlah>, ccgen | TOLAK | Generator kartu pembayaran (ccgen): dilarang daftar larangan DECISIONS |
| tools/cekhost.js | checkhost, cekhost, check | SUDAH ADA | Nama perintah "checkhost" terdaftar di registry KANA |
| tools/cekidch.js | cekidgc, cekidgrup, cekidch, idch | SUDAH ADA | Nama perintah "cekidgc" terdaftar di registry KANA |
| tools/cekml.js | cekml, mlbb, mlstalk | SUDAH ADA | Nama perintah "mlbb" terdaftar di registry KANA |
| tools/ceknsfw.js | nsfwcheck | SUDAH ADA | Nama perintah "nsfwcheck" terdaftar di registry KANA |
| tools/cekrek.js | cekrek <bank>|<nomor>, cekrek, cekrekening | TOLAK | Dinilai ulang per mekanisme 2026-11-05 atas perintah owner: memvalidasi nomor rekening/e-wallet MILIK ORANG LAIN lewat api.nexray.eu.cc = data finansial non-publik. TETAP DITOLAK (stalking non-publik, batas keras owner), tanpa dicarikan sumber alternatif |
| tools/cekresi.js | cekresi | DEFER | Memakai token ui statis situs cekresi.com dan sesi PHP yang rapuh; belum terverifikasi ujung ke ujung dari VM |
| tools/codepromt.js | promptcode, detectbug, convertcode, explaincode, imagesolve | SUDAH ADA | Nama perintah "promptcode" terdaftar di registry KANA |
| tools/copynum.js | copynum | DEFER | Gimmick tombol salin nomor pengirim, bukan fungsi data; nilai port rendah |
| tools/ekspedisilist.js | ekspedisilist | SUDAH ADA | Nama perintah "ekspedisilist" terdaftar di registry KANA |
| tools/encode.js | encode, decode | SUDAH ADA | Nama perintah "encode" terdaftar di registry KANA |
| tools/gh.js | ghuser, ghsearch, ghgist | SUDAH ADA | Nama perintah "ghuser" terdaftar di registry KANA |
| tools/gmaps.js | jarak, gmaps | SUDAH ADA | Nama perintah "jarak" terdaftar di registry KANA |
| tools/gsmarena.js | gsmarena <nama hp>, gsmarena, gsmspek, hpspek | SUDAH ADA | Nama perintah "gsmarena" terdaftar di registry KANA |
| tools/hash.js | hash <text>, hash | DEFER | Util hash teks: belum diport pada giliran ini, nilai rendah |
| tools/hd2.js | hd2 | KLON | Terwakili .upscale KANA |
| tools/hdvid.js | hdvideo, unblurvideo, vhd | DEFER | API peningkat kualitas video: belum terverifikasi dari VM |
| tools/ip.js | ip | SUDAH ADA | Padanan KANA: .cekip |
| tools/jadwaltv.js | jadwaltv | SUDAH ADA | Nama perintah "jadwaltv" terdaftar di registry KANA |
| tools/nik.js | nik <nomor>, nik | TOLAK | Dinilai ulang per mekanisme 2026-11-05 atas perintah owner: parser NIK lokal membuka tanggal lahir, jenis kelamin, umur, dan wilayah sampai kecamatan dari nomor kependudukan 16 digit orang lain = data pribadi non-publik. TETAP DITOLAK (stalking non-publik, batas keras owner), tanpa dicarikan sumber alternatif |
| tools/npmjs.js | npmjs | SUDAH ADA | Nama perintah "npmjs" terdaftar di registry KANA |
| tools/npmshield.js | npmshield | SUDAH ADA | Nama perintah "npmshield" terdaftar di registry KANA |
| tools/numbgen.js | numbgen | SUDAH ADA | Nama perintah "numbgen" terdaftar di registry KANA |
| tools/ocr.js | ocr | SUDAH ADA | Nama perintah "ocr" terdaftar di registry KANA |
| tools/pastebin.js | pastebin <url>, pastebin | SUDAH ADA | Nama perintah "pastebin" terdaftar di registry KANA |
| tools/pymodules.js | pymodules | DEFER | Pencarian modul Python: sumber belum terverifikasi |
| tools/qrcode.js | (hook internal) | SUDAH ADA | Padanan KANA: .qr (buat kode QR) |
| tools/randomname.js | randomname gender|kata|surname(optional)|kategori(optional), randomname | SUDAH ADA | Nama perintah "randomname" terdaftar di registry KANA |
| tools/rcweb.js | rcweb <url>, recordweb <url>, rcweb, recordweb | DEFER | Perekam halaman web membutuhkan browser berat di luar tumpukan KANA saat ini |
| tools/readmore.js | readmore, spoiler, hidetext, selengkapnya | SUDAH ADA | Nama perintah "readmore" terdaftar di registry KANA |
| tools/readqr.js | readqr | SUDAH ADA | Nama perintah "readqr" terdaftar di registry KANA |
| tools/removebg.js | removebg | SUDAH ADA | Nama perintah "removebg" terdaftar di registry KANA |
| tools/removevocal.js | vocalremover, aivocal | TOLAK | Memakai token statis aivocalremover.com hasil ekstrak aplikasi web pihak ketiga di dalam kode (pola fastdl dan animein yang ditolak di SNIPPETS); fitur pemisah vokal tidak diport dengan kredensial seperti itu |
| tools/rvo.js | rvo | TOLAK | Membuka pesan view-once orang lain: dilarang batas keras |
| tools/searchgist.js | searchgist | SUDAH ADA | Nama perintah "searchgist" terdaftar di registry KANA |
| tools/sfl.js | sfl <url>, sfl, bypasssfl | TOLAK | Alat bypass tautan/layanan pihak ketiga: dilarang |
| tools/sharetext.js | shareteks teks, shareteks, bagiteks | SUDAH ADA | Nama perintah "shareteks" terdaftar di registry KANA |
| tools/speedtest.js | speedtest | SUDAH ADA | Padanan KANA: .testspeed |
| tools/ssweb.js | ssweb | SUDAH ADA | Nama perintah "ssweb" terdaftar di registry KANA |
| tools/tembox.js | copy | KLON | Terwakili .tempmail KANA |
| tools/tempmail.js | tempmail, cekmail <token>, pesanmail <id>, cekmail, pesanmail | SUDAH ADA | Nama perintah "tempmail" terdaftar di registry KANA |
| tools/toesm-tocjs.js | toesm, tocjs | SUDAH ADA | Nama perintah "toesm" terdaftar di registry KANA |
| tools/toptv.js | toptv, tovideonote, topvn | KLON | Terwakili .tovn KANA (ubah video jadi video note) |
| tools/tourl.js | tourl | SUDAH ADA | Nama perintah "tourl" terdaftar di registry KANA |
| tools/tourl2.js | upload | PORT BARU | Fungsi yang sama dengan .upload hasil port (perintah upload berkas di RYO) |
| tools/trackip.js | trackip <domain/ip>, trackip, iptrack | SUDAH ADA | Padanan KANA: .cekip |
| tools/translate.js | translate, tr | SUDAH ADA | Nama perintah "translate" terdaftar di registry KANA |
| tools/tthastag.js | tthashtag <hashtag>, tthashtag, tiktokhashtag | DEFER | Statistik hashtag TikTok lewat API nexray: belum terverifikasi |
| tools/uguu.js | uguu | PORT BARU | Diport jadi .upload, sumber uguu.se terverifikasi (src/scrapers/tools/upload.js + plugins/tools/upload.js) |
| tools/upvidey.js | upvidey | SUDAH ADA | Padanan KANA: .videy |
| tools/vgist.js | vgist <url/id>, vgist | SUDAH ADA | Nama perintah "vgist" terdaftar di registry KANA |
| tools/webtozip.js | webtozip <url>, webtozip, wzip | DEFER | Sumber arsip web ke ZIP belum terverifikasi dari VM |
| voice/tts-anime.js | tts <teks jepang>, tts | SUDAH ADA | Nama perintah "tts" terdaftar di registry KANA |
| voice/tts-ondoku.js | ondoku <voice|text>, voiceondoku, ondoku | SUDAH ADA | Nama perintah "ondoku" terdaftar di registry KANA |
| voice/ttsai.js | ttsvoice <model> <teks>, ttsvoice | SUDAH ADA | Nama perintah "ttsvoice" terdaftar di registry KANA |
| voice/ttsdracin.js | ttsdracin <teks>, ttsdracin | KLON | Varian suara TTS: terwakili .tts KANA |
| voice/vn.js | ara, lopyou, Ara ara, ara ara, Ara, lopyu, loveyou, love, lope, lupyu, iloveyou | SUDAH ADA | Nama perintah "love" terdaftar di registry KANA |

## Catatan jujur penutup

- Game HTML RYO (snake, tetris, dino, flappybird, sonic) tidak diport sebagai aset: KANA sudah punya snake, tetris, dino, flappy, dan runner dash sendiri; nilai RYO ada pada format pengirimannya (format C) yang dibakukan terpisah ke src/ui/htmlgame.js oleh giliran lain, bukan pada berkas gamenya. Sonic Dash adalah merek pihak ketiga dan tidak diport sebagai aset bermerek.
- Mayoritas katalog RYO adalah varian: 30+ berkas AI adalah satu fungsi chat, belasan berkas downloader adalah varian agregator yang sama, dan keluarga brat/IQC adalah style dari satu mesin. Semuanya tercatat per berkas di matriks sebagai KLON agar tidak ada perintah duplikat yang menggelembungkan registry.
- Berkas DEFER bukan penolakan permanen: masing-masing menyebut penghalangnya (sumber mati, wilayah, kredensial, atau keputusan owner) dan bisa dibuka lagi bila penghalangnya hilang.
