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
