# SNIPPETS: triage sumber eksternal (2026-11-04)

Semua link di bawah dikirim user. Isinya dibaca (fetch teks), tidak dijalankan
membabi buta. Yang diadaptasi diberi kredit di header file dan FEATURES.md.

## Link paste dari user

| Link | Akses | Isi | Keputusan |
|---|---|---|---|
| https://code.jhx.my.id/ | Bisa | FioCode, vault 35 snippet JS by JH: scraper APK, Trace.moe, AIO downloader, anime, Instagram, CodaShop, Apple Music, Minecraft, ssweb, TikTok, Spotify, film, YouTube, Pinterest, cek jarak, Douyin, face swap, watermark remover, IG story viewer, post channel | Dilewati semua: mayoritas duplikat domain yang sudah terpasang (Spotify, IG, TikTok, Pinterest, YouTube); sebagian berbasis puppeteer (dependensi berat); sebagian tidak aman atau di luar aturan (IG story viewer bersifat pengintai, face swap, SSSIG dan FastDL memakai node:vm runInContext, postch memakai child_process spawn) |
| https://paste.c-net.org/GrossFitch | Bisa | JS: YouTube downloader via API ytultra.com (Jerexd), bentuk CLI | Dilewati: duplikat kemampuan play/download YouTube yang sudah ada lewat @distube/ytdl-core; snippet sendiri mencatat link raw terikat IP server |
| https://paste.rs/64N9Y | Tidak bisa | Fetch gagal dari lingkungan ini (network error), isi tidak diketahui | Dilewati: tidak bisa ditriage |
| https://paste.rs/Oc8BH | Tidak bisa | Fetch gagal dari lingkungan ini (network error), isi tidak diketahui | Dilewati: tidak bisa ditriage |
| https://paste.c-net.org/StinkyForged | Bisa | JS: tool magic link am.jzcloud.web.id untuk aktivasi premium (kirim dan verifikasi magic link, mengembalikan ID token) | Dilewati: alat aktivasi premium atau bypass layanan berbayar, di luar aturan proyek |
| https://codeku.izzcs.my.id/code/viu-gen-scrape-muy3v4a5 | Tidak bisa | Fetch gagal, halaman tanpa konten yang bisa diekstrak; judul URL mengarah ke generator Viu | Dilewati: isi tidak bisa dibaca untuk ditriage |
| https://dpaste.org/YNLWj/raw | Bisa | JS: TikTok downloader via tikwm.com API (Jerexd), mode HD lewat task submit, slide foto, audio | Diambil sebagian: logika tikwm (meta + HD task) diadaptasi jadi sumber fallback di src/scrapers/tiktok/tiktok.js |
| https://paste.c-net.org/PresumeCaddy | Bisa | JS: scraper komik Komikcast v2 (axios + cheerio): search, latest, detail, daftar gambar chapter | Diambil: diadaptasi ke src/scrapers/komik/komikcast.js dan plugin .komik; fungsi download chapter ke folder lokal tidak diambil (aturan tanpa file permanen) |
| https://paste.c-net.org/SworeSmashed | Bisa | JS: scraper font DaFont (axios + cheerio): search, latest, top, detail, download ZIP | Diambil: diadaptasi ke src/scrapers/font/dafont.js dan plugin .font; unduhan dikembalikan sebagai Buffer, bukan file lokal |
| https://code.shinoa.lol/explore | Sebagian | Halaman CodeShare termuat, tetapi daftar kodenya dirender JavaScript sehingga tidak terbaca lewat fetch teks | 0 diambil: tidak ada snippet yang bisa dibaca dan ditriage dengan aman dari lingkungan ini |

## Snippet langsung dari user (chat)

| Sumber | Isi | Keputusan |
|---|---|---|
| Kiriman user 2026-11-04 | Spotify search + download (spotmp3.net + spotidown.app) | Diambil: src/scrapers/spotify/spotify.js, plugin .spotify |
| Kiriman user 2026-11-04 | YouTube search + download audio (@distube/ytdl-core) | Diambil: src/scrapers/youtube/youtube.js (diubah ke file temp), plugin .play dan .yts |
| Kiriman user 2026-11-04 | Pinterest search | Diambil: src/scrapers/pinterest/pinterest.js, plugin .pinterest |
| Kiriman user 2026-11-04 | Facebook video via snapsave.app | Diambil: src/scrapers/facebook/facebook.js, plugin .fb |
| Kiriman user 2026-11-04 | Instagram via snapsave.app | Diambil: src/scrapers/instagram/instagram.js, plugin .ig |
| Kiriman user 2026-11-04 | TikTok via api.tiklydown.eu.org | Diambil: sumber utama src/scrapers/tiktok/tiktok.js, plugin .tiktok |
| Yui Agents, kiriman user 2026-11-04 | Metadata Spotify Embed + fallback iTunes + lirik (lyrics.ovh, lrclib) | Diambil: src/scrapers/spotify/metadata.js, plugin .lirik, fallback metadata plugin .spotify |
| hazeloffc (t.me/hazeloffc), kiriman user 2026-11-04 | AI chat rudder.chat (Token Harbor, model th-rudder:free), butuh cookie sesi manual | Diambil sebagai opt-in: src/scrapers/ai/rudder.js + plugin .ai; kredensial hanya dari .env, tidak ada nilai hardcoded |

## File snippet kiriman user 2026-11-05 (batch 1 dan 2)

| File | Penulis | Isi | Keputusan |
|---|---|---|---|
| edubrain_ai_1_6xmx.js | FruatreMaou | Tutor chat EduBrain AI via GraphQL wrtools-api.es-tech.co | Diambil: ditulis ulang jadi plugin .edubrain (kategori ai, premium). Probe VM: status 200, jawaban asli kembali |
| notrack_ai_3_zacs.js | FruatreMaou | Chat AI notrack.ai via /api/dispatch (SSE) | Diambil: ditulis ulang jadi plugin .notrack (kategori ai, premium). Probe VM sempat kena 429 (rate limit sumber), endpoint merespons |
| orginality_ai_4_2u61.js | FruatreMaou | Originality.ai free tools: plagiarism-scan, ai-scan, grammar-scan | Diambil sebagai TIGA plugin utama terpisah: .plagiarism, .aiscan, .grammarcheck (kategori tools). Probe: plagiarism dan grammar jalan; ai-scan membalas 404 dari layanan aslinya (kemungkinan dipensiunkan di sisi Originality.ai), plugin menampilkan kegagalan secara jujur |
| nsfw_checker_2_78lw.js | FruatreMaou | Cek NSFW gambar via fungsi Nyckel (alat moderasi) | Diambil: plugin .nsfwcheck (kategori tools), input URL atau gambar kutipan (data URI). Probe awal membalas 400 untuk URL contoh snippet, probe lanjutan timeout jaringan VM |
| scan_ai_slop_5_e3py.js | yuor | Cek website buatan AI via sniffslop.com /api/scan | Diambil: plugin .slopscan (kategori tools). Probe VM jalan: skor, vonis, ringkasan, dan URL laporan kembali |
| ai_image_detector_7_q0y6.js | FruatreMaou | Deteksi gambar AI via ZeroGPT aiImageDetect (multipart) | Diambil: plugin .aidetect (kategori ai, premium), multipart ditulis manual tanpa form-data, input URL atau gambar kutipan. Probe VM timeout jaringan, belum terverifikasi ujung ke ujung |
| TIKTOK_VID_MP3_DOWNLOAD_8_ki4w.js | Vellzyy | Downloader TikTok via unduhmedia.web.id | Diambil sebagai fallback ke-3 di src/scrapers/tiktok/tiktok.js (rantai .tiktok), bukan perintah baru. Probe: API merespons, untuk URL pendek vt.tiktok.com balas status false dari sumbernya |
| Ttdl_13_ilbc.js | tidak tercantum | Downloader TikTok via tokgrab-app.vercel.app | Diambil sebagai fallback ke-4 di src/scrapers/tiktok/tiktok.js, parser defensif karena bentuk respons tidak standar. Probe VM jalan: metadata video asli kembali |
| Pinterest_9_t918.js | tidak tercantum | Scraping pinterest.com langsung: search, home feed, profil, video | Diambil sebagian: paginasi POST BaseSearchResource jadi fallback .pinterest di src/scrapers/pinterest/pinterest.js plus kolom hasil diperkaya (deskripsi, statistik, tautan eksternal). Fungsi stalk profil tidak diambil. Header spoof IP acak (X-Forwarded-For/X-Real-IP) TIDAK dipakai, sesi polos seperti jalur utama |
| Anime_list_10_4rha.js | tidak tercantum | Scraper livechart.me: search, musim, jadwal, ranking, detail | Diambil: ditulis ulang jadi src/scrapers/anime/livechart.js + plugin .livechart (kategori anime) |
| antitoxic.js_12_teu6.js | tidak tercantum | Plugin grup anti toxic bot lain (zhuxin-database) | Dilewati: KANA sudah punya antitoxic lengkap (toggle .antitoxic, .addtoxic/.deltoxic/.listtoxic, guard dengan warn) dari port Elaina |
| afk.js_14_k0ft.js | tidak tercantum | Plugin .afk dengan global Map | Dilewati: .afk KANA sudah ada dan lebih baik (persisten di settings grup/profil, before() sambutan kembali + info mention); versi Map snippet hilang saat restart jadi tidak ditiru |
| Html_Deploy_11_j5jd.js | tidak tercantum | Deploy HTML ke deploysxc.vercel.app/api/deploy | Diambil: plugin .deployhtml (kategori tools), input dokumen HTML kutipan. Fungsi spoof IP (getRandomIP + header X-Forwarded-For/X-Real-IP acak) DIBUANG TOTAL, request polos. Probe VM: HTTP 200 sukses, URL deployment asli kembali tanpa spoof |
| ambulk_generator_email_6_fa4o.js | - | Pembuatan akun layanan massal + verifikasi otomatis | DITOLAK (batas keras): akun massal dan bypass verifikasi layanan pihak ketiga. Tidak dibuatkan plugin |
| Animeku_15_31y0.js | - | Scraper dengan ApiKey hasil ekstrak aplikasi pihak ketiga | DITOLAK: kredensial pihak ketiga tidak boleh masuk repo publik. Tidak dibuatkan plugin |
| YTDL_16_48gp.js | - | Downloader YouTube yang menjalankan kode server asing via node:vm | DITOLAK: tidak aman dan duplikat fungsi yang sudah ada. Tidak dipakai, termasuk sebagai fallback |

## File zip kiriman user 2026-11-05: Scraper_4_6ygm.zip (paket "Scraper By Zane", 44 file)

Semua file dibaca penuh atau per bagian kunci sebelum dinilai; tidak ada
yang dijalankan membabi buta. Probe sumber dilakukan dengan skrip probe
terpisah memakai input asli, bukan menjalankan kode zip.

| File | Isi | Keputusan |
|---|---|---|
| igexportScraper.js | API igexport.com/api/ig-photo, tanpa kunci | Diambil: cadangan .ig ketiga di src/scrapers/instagram/instagram.js (parseIgExportMedia + instagramViaIgExport). Probe VM: HTTP 200, video fbcdn asli, magic bytes ftyp lolos |
| instaloadrScraper.js | API instaloadr.com/api/fetch, tanpa kunci/captcha | Diambil: cadangan .ig keempat (parseInstaloadrMedia + instagramViaInstaloadr, retry 422 sebagai post). Probe VM: HTTP 200, item mp4 asli, magic bytes ftyp lolos. Unduhan IPv4 paksa dari file asli tidak diambil; unduhan tetap lewat downloadBuffer repo |
| fastdl.js | FastDL.app: kunci HMAC hasil reverse bundle app + curl untuk lolos Turnstile | DITOLAK: kredensial hasil ekstrak aplikasi pihak ketiga (pola sama dengan Animeku) dan FastDL pernah dilewati pada triage FioCode. Tidak dipakai, termasuk sebagai fallback |
| animein.js | API animeinweb.com dengan x-proxy-secret hardcoded | DITOLAK: kredensial pihak ketiga tertanam di kode |
| iloveimgRmBg.js, iloveimgUpscale.js | iLoveIMG dengan token TASK statis milik proyek iLoveIMG | DITOLAK: token pihak ketiga hardcoded. Fitur removebg/upscale KANA sudah punya sumber yang lulus uji |
| ampremium.js, parxAm.js, satriaAm.js, noxxAmScraper.js, adamAmPrem.js, vinzAm.js | Aktivator premium Alight Motion via magic link (kirim, verifikasi, inject premium) | DITOLAK: aktivasi/bypass layanan berbayar, pola sama dengan tool magic link AM yang ditolak pada triage paste StinkyForged |
| naxachat.js | Chat AI dengan auto-register akun dari email temp untuk bypass kuota | DITOLAK (batas keras): akun massal dan bypass kuota layanan pihak ketiga |
| generatorgmail.js, tempmail.js | Generator email sementara (generator.email, emailnator) termasuk buat massal dan auto-solve captcha | DITOLAK: keluarga generator email yang sama dengan ambulk (ditolak batas keras); KANA sudah punya .tempmail sendiri |
| igstalkScraper.js | insta-stories-viewer.com: lihat story IG tanpa login | DITOLAK: story viewer bersifat pengintai (preseden triage FioCode) |
| tikstalkScraper.js | tik.ninja: profil/story TikTok dengan memecahkan challenge JS situs (SHA256 + AES) | Dilewati: pemecahan challenge anti-bot dan fitur story; KANA sudah punya .tiktokstalk |
| ffStalkScraper.js | Stalk Free Fire dengan solver proof-of-work SHA256 sampai 50 juta percobaan | Dilewati: duplikat .ffstalk yang sudah ada dan beban CPU solver tidak masuk akal untuk bot |
| spotsearchdl.js | spotmp3.net dengan rotasi proxy publik otomatis saat kuota IP habis | Dilewati: mekanisme penghindaran kuota per IP; .spotify KANA sudah memakai spotmp3 dan lulus uji |
| chosicSpotify.js | Ambil token Spotify gratis milik chosic.com lalu panggil api.spotify.com | Dilewati: bertumpu pada token layanan pihak ketiga; metadata Spotify KANA sudah tercakup jalur embed dan iTunes |
| Sisanya (aio/downvideo, omdown, capcutdl, facebookScraper, pinterest, sswebScraper/thum.io, soundboardScraper/myinstants, removeVocal/x-minus, 8daudio, text2img/pollinations, mangadex, komikstationScraper, anichin, donghive, ttdlzone, ttsearch, spotify partner, ytmp3/ytmp3gg/ytmp3pc/ytscrape/y2mate/invidious, amfinder, picsurf, rannd, wac) | Beragam scraper bersih tanpa kunci hardcoded | Dilewati: bersih, tetapi plugin padanannya di KANA sudah punya sumber yang lulus sapuan live (bukan sumber mati/lemah), atau tidak ada plugin padanan (removeVocal, picsurf, rannd, wac, 8daudio katalog). Tidak ditambahkan sebagai fallback tanpa bukti sumber utama bermasalah |
| (tidak ada di zip) | Chord | Paket ini TIDAK memuat scraper chord apa pun, jadi .chord tidak mendapat fallback dari kiriman ini; statusnya tetap seperti catatan matriks sapuan (chordtela dan chordindonesia memindah pencarian ke render klien) |
