# FEATURES: status KANA

## Preflight Fase 0 (2026-11-04)
- Node v24.22.1 (target 20 ke atas: lolos), npm 10.9.4, ffmpeg 8.1.2 tersedia.
- `@rexxhayanasi/elaina-baileys` versi exact terbaru dari `npm view`: 1.4.7, di-pin di package.json.
- README library dibaca: Penyimpanan Sesi, Kode Pairing, Pengalamatan LID/PN/JID, Button, Mini App HTML, Penanganan Masalah.
- API terverifikasi langsung dari paket 1.4.7: `usePostgresAuthState` ada (named export), `MB.sendHtmlApp` ada, `MB.checkNativeFlowButtons` ada, `checkHtmlApp` ada sebagai named export top-level (bukan `MB.checkHtmlApp`).
- Tes jaringan WhatsApp dan Supabase: informasional saja, pairing ditunda sampai user memberi NOMOR_BOT dan NOMOR_OWNER. Belum ada kredensial Supabase yang diberikan, jadi koneksi Supabase belum diuji live.
- Folder `./reference/` tidak tersedia di workspace saat base dibangun, jadi tidak ada yang dibaca atau disalin dari referensi. Daftar fitur referensi belum dijelajahi.

## Base Fase 1
| Fitur | Status |
|---|---|
| Koneksi pairing code + reconnect backoff/jitter + loggedOut berhenti | Kode selesai, belum dites live (menunggu nomor) |
| Sesi Postgres `usePostgresAuthState` (driver supabase) | Kode selesai, belum dites live |
| Sesi lokal `useMultiFileAuthState` di .dev-data (driver local) | Kode selesai |
| Pipeline multi-prefix (. ! / #), gates owner/group/private/cooldown, error boundary | Selesai |
| Plugin loader + karantina plugin rusak | Selesai, dites unit |
| i18n id + en, fallback en ke id ke kunci, `npm run i18n:check` | Selesai, hijau |
| Persona moe KANA dua bahasa | Selesai |
| Storage local (JSON .dev-data) | Selesai, dites kontrak |
| Storage supabase (bot.kv + migrasi SQL, RLS aktif tanpa policy anon) | Kode selesai, belum dites live |
| Plugin ping, menu, lang, help, owner (status) | Selesai |
| Tombol MB.Button + fallback teks | Kode selesai, belum dites live |
| Game HTML contoh (games/hello, perintah .hello) | Kode selesai, belum dites live di HP |
| Tes unit dan kontrak (node:test) | 5 tes, hijau |
| Spike S1 sampai S7 | Belum jalan, semua butuh pairing dan HP user |

## Scraper dan plugin downloader/search/AI (2026-11-04, atas kiriman user)

Status di bagian ini: kode terpasang + tes unit hijau + smoke test loader.
Tes live di bot tetap menunggu pairing (Gate 1). Tes jaringan langsung dari
VM pada 2026-11-04: Pinterest search berhasil (3 hasil), Spotify search
berhasil (hasil pertama "Sepatu"), metadata iTunes fallback berhasil
("Sepatu", Tulus). Sisanya belum diuji jaringan satu per satu.

| Modul / plugin | Sumber | Status |
|---|---|---|
| src/scrapers/runner.js (SSRF guard, retry, circuit breaker, downloadBuffer, withTempDir) | Kerangka spesifikasi 4.8 | Terpasang, dites unit |
| src/scrapers/spotify/spotify.js, plugin .spotify | Kode kiriman user (spotmp3 + spotidown) | Terpasang, search lolos tes jaringan |
| src/scrapers/spotify/metadata.js, plugin .lirik, fallback metadata .spotify | Yui Agents (Spotify Embed + iTunes + lirik lyrics.ovh/lrclib) | Terpasang, iTunes lolos tes jaringan |
| src/scrapers/youtube/youtube.js, plugin .play dan .yts | Kode kiriman user (@distube/ytdl-core), diubah ke file temp | Terpasang |
| src/scrapers/pinterest/pinterest.js, plugin .pinterest | Kode kiriman user | Terpasang, lolos tes jaringan |
| src/scrapers/facebook/facebook.js, plugin .fb | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/instagram/instagram.js, plugin .ig | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/tiktok/tiktok.js, plugin .tiktok | Kode kiriman user (tiklydown) + fallback tikwm dari snippet Jerexd, https://dpaste.org/YNLWj/raw | Terpasang |
| src/scrapers/komik/komikcast.js, plugin .komik | Adaptasi snippet Jerexd, https://paste.c-net.org/PresumeCaddy | Terpasang |
| src/scrapers/font/dafont.js, plugin .font | Adaptasi snippet Jerexd, https://paste.c-net.org/SworeSmashed | Terpasang |
| src/scrapers/ai/rudder.js, plugin .ai | Snippet rudder.chat oleh hazeloffc (t.me/hazeloffc) | Terpasang, opt-in: aktif hanya bila RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO diisi di .env |

| src/services/auto-bio.js | Fitur dari user: bio profil otomatis | Terpasang, dites unit; tes live menunggu bot connect |

Detail auto bio: saat connection open, bio profil bot diisi status ON plus
runtime dari template (BIO_ON_TEMPLATE, placeholder {bot}, {runtime},
{since}), diperbarui tiap 5 menit, dan diubah ke OFF (BIO_OFF_TEMPLATE)
pada shutdown rapi. Default template moe bawaan kode bila env kosong.
Toggle AUTO_BIO (default true). API sock.updateProfileStatus terkonfirmasi
di README dan kode library v1.4.7. Kegagalan update bio tidak fatal.

Perbaikan bug base dari pairing live 2026-11-04: (1) src/index.js sekarang
memuat .env lewat src/load-env.js (process.loadEnvFile bawaan Node,
diimpor pertama); (2) jeda requestPairingCode diubah 3000 ms menjadi
6000 ms (terbukti berhasil live dengan kode KANAMOE1), dan jalur loggedOut
tetap memanggil clearAuth() agar sisa sesi tidak terdaftar yang korup
dibersihkan dengan aman.

Triage lengkap semua link paste ada di docs/SNIPPETS.md. Catatan jujur:
scraper gratis akan rusak berkala; runner dibuat agar kegagalannya rapi
(error jelas ke pengguna) dan perbaikannya murah. Batas kirim media:
audio 16 MB, video 64 MB, gambar 16 MB, dokumen 64 MB.

## Menu ala Elaina-MD (2026-11-04, permintaan user)

Catatan riwayat: mekanisme pada tabel awal ini sudah digantikan oleh port final dari SC Elaina-MD v6.3.0 milik owner pada seksi port menu di bawah. Formatter registry dan prinsip dinamis tanpa daftar hardcoded tetap dipakai.

| Item | Status |
|---|---|
| Menu gaya bot MD klasik: bingkai box-drawing, header nama bot + sapaan moe ke user (pushName), runtime, mode (env BOT_MODE, default public), jumlah plugin dan perintah (termasuk alias), tanggal + jam WIB | Terpasang, dites unit + smoke test loader |
| Seksi per kategori dari registry (main, download, search, ai, owner) dengan ikon dan judul 「 KATEGORI 」, perintah format "│ ◦ .nama" teks polos | Terpasang, dinamis dari registry, tidak ada daftar hardcoded |
| Formatter murni di src/ui/format.js (formatMenu, formatWibDateTime, sortCategories), label semua lewat i18n; nada id moe + alay, en moe polos | Terpasang, dites unit |
| Gambar header assets/welcome.png: jadi caption bila menu muat 1024 karakter, selain itu gambar terpisah lalu teks menu; tombol quick reply .ping/.help/.owner dipertahankan dengan fallback teks | Terpasang (smoke test lokal: gambar terkirim, fallback teks jalan) |
| Help (.help) diselaraskan: detail perintah dan hint dalam bingkai yang sama | Terpasang |

## Port menu dari SC Elaina-MD v6.3.0 milik owner (2026-11-04, koreksi final user)

Sumber mekanisme adalah SC Elaina-MD v6.3.0 milik owner sendiri, repo OmmniDevv/Elaina-MD, terutama plugins/main/menu.js, plugins/main/menucat.js, plugins/main/allmenu.js, dan lib/menuHelper.js. Bukan SC publik lain.

| Item | Status |
|---|---|
| .menu utama gaya Cantarella: reaksi loading, MB.Button dengan title nama bot, body info moe berisi sapaan, nama, owner, uptime, memori, total perintah, jam dan tanggal WIB, tautan repo, footer, serta gambar banner | Terpasang, dites unit dari payload relayMessage |
| Tombol menu utama: single_select berisi section dan row per kategori dengan id ".menu <key kategori>", cta_url ke repo GitHub kana-md, cta_copy nama bot, quick reply ".menu all" dan ".ping", serta quick reply ".menu owner" khusus owner | Terpasang, dites unit untuk owner dan non-owner |
| Quoted menu utama adalah fake contactMessage ala SC owner; contextInfo hanya memakai mentionedJid, isForwarded, dan forwardingScore tanpa info newsletter karangan | Terpasang, dites unit |
| Fallback menu utama: bila MB.Button gagal, bot mengirim banner sebagai image plus caption, atau teks bila banner tidak ada. Caption selalu memuat daftar perintah ".menu <kategori>" yang terlihat oleh pengirim sebagai jalan keluar lengkap | Terpasang, dites unit dengan relayMessage yang sengaja dibuat gagal |
| .menu <kategori>: tepat satu pesan teks satu kategori memakai formatter KANA, dengan quoted fake orderMessage troli dan thumbnail banner 300x300 | Terpasang, dites unit |
| .menu all: tepat satu pesan teks penuh semua kategori yang terlihat oleh pengirim, dengan quoted fake troli yang sama dan contextInfo mentionedJid, forwardingScore 9, isForwarded true | Terpasang, dites unit |
| Thumbnail troli dibuat dari banner memakai jpeg-js: crop tengah ke area persegi lalu resize nearest neighbor ke 300x300 dan encode JPEG quality 80 | Terpasang, dimensi hasil dibuktikan di tes unit |
| Menu user belum daftar tidak berubah: gate pipeline tetap menampilkan peringatan + tombol daftar | Terpasang (test/registration-gate.test.js) |
| Pipeline membuktikan id ".menu download" tertangkap dari single_select, listResponseMessage, quick reply native flow, template button reply, dan buttons response | Terpasang, dites unit (test/pipeline-buttons.test.js) |
| Perbaikan harness livetest: TEST_CHATS digit mentah dinormalisasi jadi JID penuh sebelum pesan sintetis dibangun (normalizeChatJid), memperbaiki error jidDecode yang menggagalkan semua uji builtin | Terpasang, dites unit (test/livetest.test.js) |

Pelajaran dari lib/menuHelper.js SC owner tetap berlaku: single_select dibuang di banyak klien WhatsApp, sedangkan quick_reply didukung lebih luas dengan batas 10. Karena itu fallback teks menu utama wajib memuat daftar kategori lengkap, dan single_select baru tidak diperkenalkan untuk tombol di luar menu utama.

Status tes live port menu: ⏳ menunggu tes live oleh parent agent bareng user (kode terpasang + tes unit hijau; subagent port tidak menjalankan livetest dan tidak me-restart service).

## Aset resmi dari user (2026-11-04)

| Item | Status |
|---|---|
| assets/menu-banner.jpg (banner KANA MD hijau): gambar header MB.Button pada .menu utama, sumber thumbnail troli 300x300 pada .menu <kategori> dan .menu all, serta gambar fallback menu utama | Terpasang |
| thumbnail.png root repo diganti banner KANA MD 1280x720 dari user; README meng-embed thumbnail.png | Terpasang, terverifikasi di GitHub |
| assets/welcome.jpg: gambar utama kartu welcome grup (caption moe + mention member baru) | Terpasang di plugin welcome Fase 4 |
| assets/goodbye.jpg: gambar pesan goodbye grup (caption moe + nama member keluar) | Terpasang di plugin welcome Fase 4 |
| assets/listbot.jpg: header perintah .listbot | Terpasang Fase 2 |
| assets/rpg.jpg: header menu dan profil RPG, menggantikan rpg.png untuk semua pemakaian RPG | Dipakai Fase 8 |
| welcome.png dan rpg.png hasil generate lama tetap di repo sebagai cadangan, tidak dipakai lagi | Tercatat |

## Aturan tetap: semua fitur memakai button (keputusan user 2026-11-04)

Setiap keluaran fitur yang punya langkah lanjutan wajib menyertakan tombol MB.Button lewat src/ui/buttons.js (quick_reply maks 10, tidak dicampur jenis lain; id tombol adalah perintah valid berprefix titik), badan pesan tetap memuat versi teks perintahnya, dan kegagalan kirim tombol selalu jatuh ke fallback teks. Label tombol lewat i18n id+en. Rincian per kategori ada di laporan pembangunan dan di plugin masing-masing. Menu utama .menu memakai mekanisme khusus dari SC Elaina-MD v6.3.0 milik owner, lihat seksi port menu di atas; single_select tidak diperkenalkan untuk tombol di luar menu utama.

## Persona ekspresif (keputusan user 2026-11-04)

Keluaran bot dibuat ekspresif: pool persona moe di src/persona/moe.js diperkaya variasi emoji dan kaomoji per mood. Batas lama prompt (maks 1 kaomoji + 3 emoji) dilonggarkan atas perintah langsung user; informasi inti (angka, tautan, perintah, error) tetap jelas terbaca.

## Sistem daftar wajib (keputusan user 2026-11-04)

| Item | Status |
|---|---|
| Field profil: registered (bool), regName, registeredAt di user-service | Terpasang, dites unit |
| .daftar (alias register, kategori main): .daftar <nama> mendaftar; .daftar auto memakai pushName (tombol Daftar Otomatis); yang sudah terdaftar mendapat info akunnya; balasan sukses bertombol ke .menu dan .profil | Terpasang, dites unit |
| Gate di pipeline: user belum terdaftar hanya boleh .daftar dan .help daftar; perintah lain termasuk .menu ditolak dengan peringatan moe + tombol [Daftar Otomatis .daftar auto] [Cara Daftar .help daftar]; owner selalu lolos | Terpasang, dites unit (test/registration-gate.test.js, 6 tes) |
| Statistik web (kv bot_stats): totalUsers hanya menghitung user terdaftar sebagai member | Terpasang di scheduler |
| Pengingat pribadi .ingatkan (Fase ekstra) disimpan di namespace reminders dan dikirim scheduler saat jatuh tempo | Scheduler terpasang; plugin di gelombang ekstra |

## Gelombang Fase 2 sampai 6 (2026-11-04)

Status umum gelombang ini: kode terpasang + tes unit hijau (total suite 127 tes, i18n:check hijau, loader 99 plugin 0 karantina). ⏳ Semua menunggu tes live bareng user; belum ada yang dinyatakan lulus live.

| Fase | Isi | Perintah |
|---|---|---|
| Fase 2 Core UX | Profil, XP/level, limit harian, leaderboard XP, pencarian fitur, mode public/self, ban/unban, broadcast ke grup opt-in (.subscribe/.subscribe off) dengan jeda antar kirim, statistik storage, kesehatan scraper, reload plugin, daftar bot | .daftar .profil .level .limit .leaderboard .carifitur .listbot .subscribe .mode .ban .unban .broadcast .dbstats .scraperhealth .reload |
| Fase 3 Game HTML | Token HMAC per pemain, server skor WebSocket murni Node (aktif hanya bila SCORE_WS_PORT diisi; validasi token, rate limit, batas skor per game, skor terbaik ke namespace scores), katalog game dari folder games/, 11 game mandiri (8 wajib + 3 tambahan) dengan kontrol sentuh, pause saat hidden, kirim skor via window.__BOT | .games .game .topgame; game: dino, flappy, snake, 2048, tetris, memory, breakout, tictactoe, minesweeper, whackamole, blockblast |
| Fase 4 Grup | Proteksi middleware (antilink, antispam/flood, antitoxic dengan daftar kata grup, antijudol, antiphising) dengan warn otomatis dan auto-kick, welcome/goodbye memakai aset resmi user, admin (kick/add/promote/demote), tagall/hidetag, buka/tutup + jadwal grup (dieksekusi scheduler), set nama/deskripsi/foto, link/revoke, AFK, absen, polling native, rules, custom command per grup | .protect .guard .welcome .warn .warnings .kick .add .promote .demote .tagall .hidetag .grup .jadwalgrup .setname .setdesc .setppgrup .linkgrup .revoke .afk .absen .poll .rules .setrules .customcmd |
| Fase 5 Pencarian dan unduhan | 12 modul scraper search + mediafire/gdrive/ytmp4; tes jaringan jujur: Wikipedia, myQuran, Open-Meteo, BMKG, er-api, Bing Images, mShots, TinyURL terbukti jalan dari VM; KBBI, Jikan, Google Translate gtx gagal dari lingkungan VM (plugin menjawab jujur); chordtela hasil dirender client-side sehingga parser berakhir jujur belum bisa dijangkau | .wiki .kbbi .chord .gambar .anime .cuaca .gempa .sholat .kurs .terjemah .qr .scanqr .shortlink .ssweb .ocr .aio .ytmp4 .mediafire .gdrive .soundcloud .threads .capcut |
| Fase 6 Stiker dan maker | Konversi stiker WebP + injeksi EXIF pack/author (parser baca-balik dites), konversi media ffmpeg, brat/attp/ttp, emojimix Emoji Kitchen, meme, fakechat/faketweet berlabel PARODI jelas, quotly, carbon, textstyle, logo, hd (perbesaran biasa, diberi label jujur bukan AI) | .sticker .toimg .tovideo .tomp3 .tovn .brat .attp .ttp .emojimix .meme .fakechat .faketweet .quotly .carbon .textstyle .logo .hd .removebg |

## Gelombang Fase 7 sampai 10 + ekstra (2026-11-04)

Status umum: kode terpasang + tes unit hijau (total suite 241 tes, i18n:check hijau, loader 174 plugin 0 karantina, boot bersih tanpa BOT_NUMBER). ⏳ Semua menunggu tes live bareng user.

| Fase | Isi | Perintah |
|---|---|---|
| Fase 7 AI | Provider AI: rudder.chat bila terkonfigurasi, fallback Pollinations publik gratis; memori percakapan per user (kv aimem, 6 pasang) hanya dipakai saat mengobrol; text-to-image Pollinations (terbukti HTTP 200 dari VM); TTS Google Translate publik (terbukti 200 audio dari VM); ringkas URL/teks; vision siap pakai bila owner mengisi VISION_API_URL, selain itu menjawab jujur belum terkonfigurasi | .ai .aireset .aiimg .vision .ringkas .tts |
| Fase 8 RPG dan ekonomi | Engine + data (31 item, 8 resep, 8 monster, 6 job, 11 entri shop): klaim berkala, gather 4 aktivitas, craft, shop beli/jual, bank tanpa bunga, duel PvP, dungeon 3 gelombang, pet, clan + clan war; header assets/rpg.jpg di .rpg dan .menurpg | .rpg .menurpg .daily .hourly .weekly .mining .fishing .hunting .farming .craft .recipes .shop .buy .inventory .bank .duel .dungeon .pet .job .clan .clanwar |
| Fase 9 Kuis, fun, religi | Engine kuis (sesi per chat di kv, TTL, XP): dataset original (caklontong 21, asahotak 21, tekateki 21, family100 21, susunkata 38 kata, bendera 26, kimia 20 unsur, tebakgambar 12); jawaban bisa lewat tombol A-D, perintah .jawab, atau teks biasa (before); truth 22, dare 21, khodam 21, jokes 16; cek-* dan zodiak dengan disclaimer; ayat/hadits + pengingat religi grup (scheduler mengirim sesuai religiTime); seed dataset ke storage lewat scripts/seed.js | .family100 .caklontong .asahotak .tekateki .susunkata .tebakgambar .tebakbendera .tebakkimia .jawab .nyerah .truth .dare .cekjodoh .cekkhodam .zodiak .ayat .hadits .religi |
| Fase 10 Jadibot | Manajer sesi owner-only: maks 3 sesi, auth terpisah per nama sesi, pipeline yang sama, kode pairing diberitahukan ke owner, berhenti per sesi; .listbot menampilkan sesi aktif lewat listJadibotSessions() | .jadibot .stopjadibot |
| Ekstra (perintah user: perbanyak fitur) | Tools: kalkulator aman tanpa eval, konversi satuan, todo, catatan, pengingat pribadi (scheduler mengirim), transfer koin, jam 4 zona; game teks: slot koin virtual, blackjack (+hit/stand), daduvs, suit; fun: bola8, cekmood/cekberuntung/cekpintar, motivasi, pantun, weton (jangkar 17-08-1945 Jumat Legi, teruji), artinama, joke; maker: smeme, circle (terverifikasi ffmpeg asli); search: resep TheMealDB, film TVMaze; RPG: gacha; main: credits | .kalkulator .konversi .todo .catatan .ingatkan .transfer .jam .slot .blackjack .hit .stand .daduvs .suit .bola8 .cekmood .cekberuntung .cekpintar .motivasi .pantun .weton .artinama .joke .smeme .circle .resep .film .gacha .credits |
| Consistency pass tombol | Plugin lama diseragamkan ke aturan button: yts (tombol hasil ke .play URL), play (menerima URL YouTube langsung + tombol susulan), spotify (URL langsung + tombol hasil), pinterest, fb, ig, tiktok, lirik, komik, font, ping, lang | (mengedit plugin yang sudah ada) |
| Harness tes live Mode A | scripts/livetest.js: hanya aktif bila LIVETEST=1 dan bukan production; menolak chat di luar TEST_CHATS; cek kesehatan akun (fetchAccountReachoutTimelock + fetchNewChatMessageCap, berhenti total bila dibatasi); jeda acak 2-4 detik, batas 20 pesan/menit; hasil ke test/live-results.json sebagai status terkirim + panduan expect untuk dicocokkan user di HP (Mode A tidak memvonis otomatis). Tes unit logika penolakan hijau; harness TIDAK dijalankan | Siap pakai menunggu sesi tes bareng user |
| Kontrak login web | Alur utama: web menulis web_login_requests, watcher bot (src/services/web-login-watcher.js, polling 20 detik, sudah diwiring di index.js) mengirim kode via WhatsApp lalu menghapus codePlain dan menandai sent; anti-spam jeda 2 menit dan maks 5 kode per nomor per hari (web_login_limits); record kedaluwarsa dihapus. Cadangan manual: .webcode (namespace web_login, hash sha256, 10 menit, sekali pakai). Kontrak lengkap di docs/WEB.md | .webcode |

## Belum dibangun atau ditunda (jujur)

- OCR (.ocr): plugin menjawab jujur belum tersedia; tesseract.js dinilai terlalu berat dan data latihnya butuh unduhan runtime.
- Remove background (.removebg): belum ada cara lokal gratis yang nyata tanpa model atau key; plugin menjawab jujur.
- SoundCloud, Threads, CapCut (.soundcloud .threads .capcut): belum ada sumber publik gratis yang terverifikasi; plugin menjawab jujur, tidak mengarang endpoint.
- Vision (.vision): struktur siap, menunggu owner mengisi VISION_API_URL (endpoint kompatibel gaya OpenAI dengan image_url); tanpa itu plugin menjawab belum terkonfigurasi.
- Skor game hanya tercatat bila owner mengisi SCORE_WS_PORT dan SCORE_WS_HOST yang bisa dijangkau HP; tanpa itu game tetap bisa dimainkan tanpa papan skor online.
- Pairing jadibot nyata dan semua fitur gelombang ini belum diuji live (aturan proyek: tidak pairing dan tidak mengirim pesan WhatsApp tanpa instruksi owner di chat utama). Harness Mode A siap untuk sesi tes tersebut.
- Bot live di /tmp/kana-pair masih menjalankan kode sebelum gelombang fitur ini; restart dengan kode baru menunggu giliran owner di chat utama.
